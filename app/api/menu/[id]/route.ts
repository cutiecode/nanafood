import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeDishPayload } from "@/lib/menu-dish-payload";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dish = await prisma.dish.findUnique({
      where: { id },
      include: {
        supplements: true,
        dishDrinks: { include: { drink: true } },
        dishDesserts: { include: { dessert: true } },
        category: true,
      },
    });

    if (!dish) return NextResponse.json({ error: "Dish not found" }, { status: 404 });

    return NextResponse.json({
      ...dish,
      drinks: dish.dishDrinks.map((dd) => dd.drink),
      desserts: dish.dishDesserts.map((dd) => dd.dessert),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const normalized = await normalizeDishPayload(body);

    if (!normalized.ok) {
      return NextResponse.json({ error: normalized.error }, { status: normalized.status });
    }

    await prisma.supplement.deleteMany({ where: { dishId: id } });
    await prisma.dishDrink.deleteMany({ where: { dishId: id } });
    await prisma.dishDessert.deleteMany({ where: { dishId: id } });

    const dish = await prisma.dish.update({
      where: { id },
      data: normalized.data,
      include: {
        supplements: true,
        dishDrinks: { include: { drink: true } },
        dishDesserts: { include: { dessert: true } },
        category: true,
      },
    });

    return NextResponse.json({
      ...dish,
      drinks: dish.dishDrinks.map((dd) => dd.drink),
      desserts: dish.dishDesserts.map((dd) => dd.dessert),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update dish." }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.dish.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
