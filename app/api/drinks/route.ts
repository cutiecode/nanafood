import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const { name, price, imageUrl } = await req.json();
    if (Number(price) < 0 || isNaN(Number(price))) {
      return NextResponse.json({ error: "Price can't be negative." }, { status: 400 });
    }
    const drink = await prisma.drink.create({
      data: { name, price: Number(price), imageUrl: imageUrl || null },
    });
    return NextResponse.json(drink);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create drink" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, price, imageUrl } = await req.json();
    if (Number(price) < 0 || isNaN(Number(price))) {
      return NextResponse.json({ error: "Price can't be negative." }, { status: 400 });
    }
    const drink = await prisma.drink.update({
      where: { id },
      data: { name, price: Number(price), imageUrl: imageUrl || null },
    });
    return NextResponse.json(drink);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update drink" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.drink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete drink" }, { status: 500 });
  }
}