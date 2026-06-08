import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        dishes: {
          where: { available: true },
          include: {
            supplements: true,
            dishDrinks: { include: { drink: true } },
            dishDesserts: { include: { dessert: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("CATEGORIES ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { label, description, order } = await req.json();
    const category = await prisma.category.create({
      data: { label, description, order: order || 0 },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
