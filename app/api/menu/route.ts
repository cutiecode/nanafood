import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeDishPayload } from "@/lib/menu-dish-payload";

export async function GET() {
  try {
    const dishes = await prisma.dish.findMany({
      where: { available: true },
      include: {
        supplements: true,
        dishDrinks: { include: { drink: true } },
        dishDesserts: { include: { dessert: true } },
        category: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const formatted = dishes.map((dish) => ({
      ...dish,
      drinks: dish.dishDrinks.map((dd) => dd.drink),
      desserts: dish.dishDesserts.map((dd) => dd.dessert),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const normalized = await normalizeDishPayload(body);

    if (!normalized.ok) {
      return NextResponse.json({ error: normalized.error }, { status: normalized.status });
    }

    const dish = await prisma.dish.create({
      data: {
        ...normalized.data,
        available: true,
      },
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
    return NextResponse.json({ error: "Failed to save dish." }, { status: 500 });
  }
}
