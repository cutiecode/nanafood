import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getClientIp, logAdminAction, logError } from "@/lib/log";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { id: "default" } });
    if (!admin || !verifyPassword(currentPassword, admin.passwordHash)) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    await prisma.admin.update({
      where: { id: "default" },
      data: { passwordHash: hashPassword(newPassword) },
    });

    await logAdminAction({ action: "admin.password_change", ip: getClientIp(req) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password change error:", error);
    await logError({ route: "PUT /api/admin/password", error });
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }
}
