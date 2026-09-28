import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, logAdminAction, logError } from "@/lib/log";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, processed } = await req.json();
    if (!id || typeof processed !== "boolean") {
      return NextResponse.json({ error: "id and processed are required" }, { status: 400 });
    }
    const order = await prisma.order.update({
      where: { id },
      data: { processed },
    });

    await logAdminAction({
      action: processed ? "order.mark_processed" : "order.mark_unprocessed",
      entityId: order.id,
      ip: getClientIp(req),
      detail: order.orderNumber,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    await logError({ route: "PATCH /api/orders", error });
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}