import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { label, description, order } = await req.json();
    const category = await prisma.category.update({
      where: { id },
      data: { label, description, order },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const dishes = await prisma.dish.findMany({ where: { categoryId: id } });

    for (const dish of dishes) {
      await prisma.dishDrink.deleteMany({ where: { dishId: dish.id } });
      await prisma.dishDessert.deleteMany({ where: { dishId: dish.id } });
      await prisma.supplement.deleteMany({ where: { dishId: dish.id } });
    }

    await prisma.dish.deleteMany({ where: { categoryId: id } });
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
