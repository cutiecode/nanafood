import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      );
    }

    const lineItems = items.map((item: {
      dish: { name: string; price: number };
      selectedSupplements: { name: string; price: number }[];
      quantity: number;
      totalPrice: number;
    }) => {
      const supplementsText =
        item.selectedSupplements.length > 0
          ? ` — with: ${item.selectedSupplements.map((s) => s.name).join(", ")}`
          : "";

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${item.dish.name}${supplementsText}`,
          },
          unit_amount: Math.round(item.totalPrice * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
      metadata: {
        source: "nanafood_web",
      },
      automatic_tax: { enabled: false },
      custom_fields: [
        {
          key: "delivery_address",
          label: { type: "custom", custom: "Delivery address" },
          type: "text",
        },
      ],
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
