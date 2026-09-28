import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

// x-forwarded-for is set by the platform's edge/proxy on real deployments. It's
// client-spoofable on a bare Node server with no trusted proxy in front, so
// this isn't a bulletproof identifier — but it's the standard signal and
// still meaningfully raises the cost of brute-forcing.
function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const first = forwardedFor?.split(",")[0]?.trim();
  return first || "unknown";
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const now = new Date();

  const attempt = await prisma.adminLoginAttempt.findUnique({ where: { ip } });

  // Locked out — reject before even looking at the submitted password.
  if (attempt?.lockedUntil && attempt.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((attempt.lockedUntil.getTime() - now.getTime()) / 1000);
    return NextResponse.json(
      { error: "Too many failed attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  // Lazily seed the Admin record from ADMIN_PASSWORD on first-ever use — from
  // then on, the stored hash is the sole source of truth and the env var is
  // no longer consulted (changing password via AdminProfile updates the hash).
  let admin = await prisma.admin.findUnique({ where: { id: "default" } });
  if (!admin) {
    const bootstrapPassword = process.env.ADMIN_PASSWORD;
    if (!bootstrapPassword) {
      console.error("No Admin record exists and ADMIN_PASSWORD is not set to seed one.");
      return NextResponse.json({ error: "Admin login is not configured." }, { status: 500 });
    }
    admin = await prisma.admin.create({
      data: { id: "default", passwordHash: hashPassword(bootstrapPassword) },
    });
  }

  let password: unknown;
  try {
    ({ password } = await req.json());
  } catch {
    password = undefined;
  }

  const candidate = typeof password === "string" ? password : "";

  if (verifyPassword(candidate, admin.passwordHash)) {
    if (attempt) {
      await prisma.adminLoginAttempt.delete({ where: { ip } }).catch(() => {});
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return response;
  }

  // Wrong password — track this failure for the IP, resetting the window if
  // the last failure recorded for it is old enough.
  const previousFailCount = attempt?.failCount ?? 0;
  const previousFirstFailureAt = attempt?.firstFailureAt ?? now;
  const windowExpired = now.getTime() - previousFirstFailureAt.getTime() > WINDOW_MS;

  const nextFailCount = windowExpired ? 1 : previousFailCount + 1;
  const nextFirstFailureAt = windowExpired ? now : previousFirstFailureAt;
  const nextLockedUntil = nextFailCount >= MAX_ATTEMPTS ? new Date(now.getTime() + LOCKOUT_MS) : null;

  await prisma.adminLoginAttempt.upsert({
    where: { ip },
    create: {
      ip,
      failCount: nextFailCount,
      firstFailureAt: nextFirstFailureAt,
      lockedUntil: nextLockedUntil,
    },
    update: {
      failCount: nextFailCount,
      firstFailureAt: nextFirstFailureAt,
      lockedUntil: nextLockedUntil,
    },
  });

  if (nextLockedUntil) {
    return NextResponse.json(
      { error: "Too many failed attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(LOCKOUT_MS / 1000)) } }
    );
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_auth");
  return response;
}
