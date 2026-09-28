import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const desserts = await prisma.dessert.findMany({
      where: { available: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(desserts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch desserts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Dessert name is required." }, { status: 400 });
    }
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Price can't be negative." }, { status: 400 });
    }
    const dessert = await prisma.dessert.create({
      data: { name, price, imageUrl: body.imageUrl || null },
    });
    return NextResponse.json(dessert);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create dessert" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "Dessert id is required." }, { status: 400 });
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Dessert name is required." }, { status: 400 });
    }
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Price can't be negative." }, { status: 400 });
    }
    const dessert = await prisma.dessert.update({
      where: { id },
      data: { name, price, imageUrl: body.imageUrl || null },
    });
    return NextResponse.json(dessert);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create dessert" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "Dessert id is required." }, { status: 400 });
    }
    await prisma.dessert.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete dessert" }, { status: 500 });
  }
}
