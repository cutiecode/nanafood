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

const REQUIRED_STRING_FIELDS = ["restaurantName", "email", "phone", "address", "hours"] as const;
const OPTIONAL_STRING_FIELDS = ["logo", "instagram", "facebook", "whatsapp", "tiktok"] as const;

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    for (const field of REQUIRED_STRING_FIELDS) {
      if (typeof body[field] !== "string" || !body[field].trim()) {
        return NextResponse.json({ error: `${field} is required.` }, { status: 400 });
      }
    }
    for (const field of OPTIONAL_STRING_FIELDS) {
      if (body[field] !== undefined && body[field] !== null && typeof body[field] !== "string") {
        return NextResponse.json({ error: `${field} must be text.` }, { status: 400 });
      }
    }

    const data = {
      restaurantName: body.restaurantName.trim(),
      logo: typeof body.logo === "string" ? body.logo.trim() : "",
      email: body.email.trim(),
      phone: body.phone.trim(),
      address: body.address.trim(),
      hours: body.hours.trim(),
      instagram: typeof body.instagram === "string" ? body.instagram.trim() : "",
      facebook: typeof body.facebook === "string" ? body.facebook.trim() : "",
      whatsapp: typeof body.whatsapp === "string" ? body.whatsapp.trim() : "",
      tiktok: typeof body.tiktok === "string" ? body.tiktok.trim() : "",
    };

    const settings = await prisma.settings.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
