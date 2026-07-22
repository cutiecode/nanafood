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
    const { name, price, imageUrl } = await req.json();
    if (Number(price) < 0 || isNaN(Number(price))) {
      return NextResponse.json({ error: "Price can't be negative." }, { status: 400 });
    }
    const dessert = await prisma.dessert.create({
      data: { name, price: Number(price), imageUrl: imageUrl || null },
    });
    return NextResponse.json(dessert);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create dessert" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, price, imageUrl } = await req.json();
    if (Number(price) < 0 || isNaN(Number(price))) {
      return NextResponse.json({ error: "Price can't be negative." }, { status: 400 });
    }
    const dessert = await prisma.dessert.update({
      where: { id },
      data: { name, price: Number(price), imageUrl: imageUrl || null },
    });
    return NextResponse.json(dessert);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create dessert" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.dessert.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete dessert" }, { status: 500 });
  }
}