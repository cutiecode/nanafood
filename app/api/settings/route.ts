import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: "default" } });
    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: "default" },
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (Number(body.taxRate) < 0 || isNaN(Number(body.taxRate))) {
      return NextResponse.json({ error: "Tax rate can't be negative." }, { status: 400 });
    }
    const settings = await prisma.settings.upsert({
      where: { id: "default" },
      update: {
        restaurantName: body.restaurantName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        hours: body.hours,
        taxRate: Number(body.taxRate),
        instagram: body.instagram || "",
        facebook: body.facebook || "",
        whatsapp: body.whatsapp || "",
        tiktok: body.tiktok || "",
      },
      create: {
        id: "default",
        restaurantName: body.restaurantName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        hours: body.hours,
        taxRate: Number(body.taxRate),
        instagram: body.instagram || "",
        facebook: body.facebook || "",
        whatsapp: body.whatsapp || "",
        tiktok: body.tiktok || "",
      },
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}