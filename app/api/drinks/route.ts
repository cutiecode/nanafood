import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, logAdminAction, logError } from "@/lib/log";

export async function GET() {
  try {
    const drinks = await prisma.drink.findMany({
      where: { available: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(drinks);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch drinks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Drink name is required." }, { status: 400 });
    }
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Price can't be negative." }, { status: 400 });
    }
    const drink = await prisma.drink.create({
      data: { name, price, imageUrl: body.imageUrl || null },
    });

    await logAdminAction({ action: "drink.create", entityId: drink.id, ip: getClientIp(req), detail: drink.name });

    return NextResponse.json(drink);
  } catch (error) {
    console.error(error);
    await logError({ route: "POST /api/drinks", error });
    return NextResponse.json({ error: "Failed to create drink" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "Drink id is required." }, { status: 400 });
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Drink name is required." }, { status: 400 });
    }
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Price can't be negative." }, { status: 400 });
    }
    const drink = await prisma.drink.update({
      where: { id },
      data: { name, price, imageUrl: body.imageUrl || null },
    });

    await logAdminAction({ action: "drink.update", entityId: drink.id, ip: getClientIp(req), detail: drink.name });

    return NextResponse.json(drink);
  } catch (error) {
    console.error(error);
    await logError({ route: "PUT /api/drinks", error });
    return NextResponse.json({ error: "Failed to update drink" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "Drink id is required." }, { status: 400 });
    }
    const drink = await prisma.drink.delete({ where: { id } });

    await logAdminAction({ action: "drink.delete", entityId: id, ip: getClientIp(req), detail: drink.name });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    await logError({ route: "DELETE /api/drinks", error });
    return NextResponse.json({ error: "Failed to delete drink" }, { status: 500 });
  }
}
