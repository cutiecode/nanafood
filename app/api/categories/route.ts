import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, logAdminAction, logError } from "@/lib/log";

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
    const body = await req.json();
    const label = typeof body.label === "string" ? body.label.trim() : "";
    if (!label) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const description = typeof body.description === "string" ? body.description.trim() : "";

    let order = 0;
    if (body.order !== null && body.order !== undefined && body.order !== "") {
      const orderValue = Number(body.order);
      if (!Number.isInteger(orderValue) || orderValue < 0) {
        return NextResponse.json({ error: "Order must be a whole number of 0 or more." }, { status: 400 });
      }
      order = orderValue;
    }

    const category = await prisma.category.create({
      data: { label, description: description || null, order },
    });

    await logAdminAction({
      action: "category.create",
      entityId: category.id,
      ip: getClientIp(req),
      detail: category.label,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);
    await logError({ route: "POST /api/categories", error });
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
