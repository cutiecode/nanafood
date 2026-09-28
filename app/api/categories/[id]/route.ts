import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, logAdminAction, logError } from "@/lib/log";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const label = typeof body.label === "string" ? body.label.trim() : "";
    if (!label) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const description = typeof body.description === "string" ? body.description.trim() : "";

    // The admin "edit category" form only sends label/description — order is
    // only touched when the caller actually provides it.
    let order: number | undefined;
    if (body.order !== null && body.order !== undefined && body.order !== "") {
      const orderValue = Number(body.order);
      if (!Number.isInteger(orderValue) || orderValue < 0) {
        return NextResponse.json({ error: "Order must be a whole number of 0 or more." }, { status: 400 });
      }
      order = orderValue;
    }

    const category = await prisma.category.update({
      where: { id },
      data: { label, description: description || null, ...(order !== undefined ? { order } : {}) },
    });

    await logAdminAction({
      action: "category.update",
      entityId: category.id,
      ip: getClientIp(req),
      detail: category.label,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);
    await logError({ route: "PUT /api/categories/[id]", error });
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const dishes = await prisma.dish.findMany({ where: { categoryId: id } });

    for (const dish of dishes) {
      await prisma.dishDrink.deleteMany({ where: { dishId: dish.id } });
      await prisma.dishDessert.deleteMany({ where: { dishId: dish.id } });
      await prisma.supplement.deleteMany({ where: { dishId: dish.id } });
    }

    await prisma.dish.deleteMany({ where: { categoryId: id } });
    const category = await prisma.category.delete({ where: { id } });

    await logAdminAction({
      action: "category.delete",
      entityId: id,
      ip: getClientIp(req),
      detail: category.label,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);
    await logError({ route: "DELETE /api/categories/[id]", error });
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
