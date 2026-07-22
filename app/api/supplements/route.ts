import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supplements = await prisma.supplement.findMany({
      distinct: ["name"],
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return NextResponse.json(supplements);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch supplements" }, { status: 500 });
  }
}