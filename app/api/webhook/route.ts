import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

      const items = lineItems.data
        .map((item) => `${item.description} x${item.quantity}`)
        .join(", ");

      const discount = session.total_details?.amount_discount
        ? session.total_details.amount_discount / 100
        : null;

      await prisma.order.create({
        data: {
          id: session.id,
          amount: (session.amount_total || 0) / 100,
          items,
          phone: session.customer_details?.phone || null,
          address: session.customer_details?.address
            ? `${session.customer_details.address.line1}, ${session.customer_details.address.city} ${session.customer_details.address.postal_code}`
            : null,
          discount,
        },
      });

      console.log(`Order saved: ${session.id}`);
    } catch (error) {
      console.error("Failed to save order:", error);
      return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
