import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

type CheckoutItemInput = {
  dishId?: unknown;
  kind?: unknown;
  quantity?: unknown;
  extraIds?: unknown;
};

type NormalizedItem = {
  dishId: string;
  kind: "dish" | "drink" | "dessert";
  quantity: number;
  extraIds: string[];
};

type ResolvedLine = {
  name: string;
  unitAmount: number;
  quantity: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = body?.items;
    const note = body?.note;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Validate shape first — no DB access yet.
    const normalized: NormalizedItem[] = [];
    for (const raw of items as CheckoutItemInput[]) {
      const dishId = typeof raw.dishId === "string" ? raw.dishId.trim() : "";
      const kind: NormalizedItem["kind"] =
        raw.kind === "drink" || raw.kind === "dessert" ? raw.kind : "dish";
      const quantity = Number(raw.quantity);
      const extraIds = Array.isArray(raw.extraIds)
        ? raw.extraIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        : [];

      if (!dishId) {
        return NextResponse.json({ error: "Each item must include a valid id." }, { status: 400 });
      }
      if (!Number.isInteger(quantity) || quantity < 1) {
        return NextResponse.json({ error: `Invalid quantity for item ${dishId}.` }, { status: 400 });
      }

      normalized.push({ dishId, kind, quantity, extraIds });
    }

    // Prices, names and existence are only ever trusted from the database
    // below — nothing from the client body is used past this point.
    const dishIds = [...new Set(normalized.filter((i) => i.kind === "dish").map((i) => i.dishId))];
    const drinkIds = [...new Set(normalized.filter((i) => i.kind === "drink").map((i) => i.dishId))];
    const dessertIds = [...new Set(normalized.filter((i) => i.kind === "dessert").map((i) => i.dishId))];

    const [dishes, drinks, desserts] = await Promise.all([
      dishIds.length
        ? prisma.dish.findMany({
            where: { id: { in: dishIds } },
            include: {
              supplements: true,
              dishDrinks: { include: { drink: true } },
              dishDesserts: { include: { dessert: true } },
            },
          })
        : Promise.resolve([]),
      drinkIds.length ? prisma.drink.findMany({ where: { id: { in: drinkIds } } }) : Promise.resolve([]),
      dessertIds.length ? prisma.dessert.findMany({ where: { id: { in: dessertIds } } }) : Promise.resolve([]),
    ]);

    const dishMap = new Map(dishes.map((d) => [d.id, d]));
    const drinkMap = new Map(drinks.map((d) => [d.id, d]));
    const dessertMap = new Map(desserts.map((d) => [d.id, d]));

    // A dish/drink/dessert can be marked unavailable (e.g. by the admin)
    // after a customer already added it to their cart — reject the whole
    // order rather than silently dropping or selling something no longer on
    // the menu.
    const unavailableNames = new Set<string>();
    for (const item of normalized) {
      if (item.kind === "dish") {
        const dish = dishMap.get(item.dishId);
        if (dish && !dish.available) unavailableNames.add(dish.name);
      } else if (item.kind === "drink") {
        const drink = drinkMap.get(item.dishId);
        if (drink && !drink.available) unavailableNames.add(drink.name);
      } else if (item.kind === "dessert") {
        const dessert = dessertMap.get(item.dishId);
        if (dessert && !dessert.available) unavailableNames.add(dessert.name);
      }
    }
    if (unavailableNames.size > 0) {
      return NextResponse.json(
        { error: `No longer available: ${[...unavailableNames].join(", ")}` },
        { status: 400 }
      );
    }

    const resolvedLines: ResolvedLine[] = [];

    for (const item of normalized) {
      if (item.kind === "drink") {
        const drink = drinkMap.get(item.dishId);
        if (!drink) {
          return NextResponse.json({ error: `Drink not found: ${item.dishId}` }, { status: 400 });
        }
        resolvedLines.push({ name: drink.name, unitAmount: drink.price, quantity: item.quantity });
        continue;
      }

      if (item.kind === "dessert") {
        const dessert = dessertMap.get(item.dishId);
        if (!dessert) {
          return NextResponse.json({ error: `Dessert not found: ${item.dishId}` }, { status: 400 });
        }
        resolvedLines.push({ name: dessert.name, unitAmount: dessert.price, quantity: item.quantity });
        continue;
      }

      const dish = dishMap.get(item.dishId);
      if (!dish) {
        return NextResponse.json({ error: `Dish not found: ${item.dishId}` }, { status: 400 });
      }

      // Everything a customer is allowed to attach to this dish: its own
      // supplements plus the drinks/desserts explicitly linked to it.
      const extraPrices = new Map<string, { name: string; price: number }>();
      for (const s of dish.supplements) extraPrices.set(s.id, { name: s.name, price: s.price });
      for (const dd of dish.dishDrinks) extraPrices.set(dd.drink.id, { name: dd.drink.name, price: dd.drink.price });
      for (const dd of dish.dishDesserts) extraPrices.set(dd.dessert.id, { name: dd.dessert.name, price: dd.dessert.price });

      let unitAmount = dish.price;
      const extraNames: string[] = [];
      for (const extraId of item.extraIds) {
        const extra = extraPrices.get(extraId);
        if (!extra) {
          return NextResponse.json(
            { error: `Add-on not available for dish "${dish.name}": ${extraId}` },
            { status: 400 }
          );
        }
        unitAmount += extra.price;
        extraNames.push(extra.name);
      }

      const suffix = extraNames.length > 0 ? ` — with: ${extraNames.join(", ")}` : "";
      resolvedLines.push({ name: `${dish.name}${suffix}`, unitAmount, quantity: item.quantity });
    }

    const lineItems = resolvedLines.map((line) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: line.name,
        },
        unit_amount: Math.round(line.unitAmount * 100),
      },
      quantity: line.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
      metadata: {
        source: "nanafood_web",
        note: typeof note === "string" ? note : "",
      },
      // Stripe computes and collects the actual tax itself, based on the
      // shipping address gathered below — the app no longer tracks or
      // displays a manual tax figure anywhere (see CartSidebar.tsx /
      // schema.prisma). Requires Stripe Tax to be enabled and a tax
      // registration set up in the Stripe Dashboard — this alone doesn't
      // turn tax collection on.
      automatic_tax: { enabled: true },
      shipping_address_collection: { allowed_countries: ["US"] },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
