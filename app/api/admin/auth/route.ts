import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

// Compares two strings in constant time. Hashing first normalizes both
// inputs to a fixed 32-byte digest before the constant-time compare, so
// neither the password's length nor which character first differs can leak
// through response timing (a direct string compare, or timingSafeEqual on
// the raw — variable-length — strings, both leak that information).
function timingSafeStringEqual(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// x-forwarded-for is set by Vercel's edge network on real deployments. It's
// client-spoofable on a bare Node server with no trusted proxy in front, so
// this isn't a bulletproof identifier — but it's the standard signal and
// still meaningfully raises the cost of brute-forcing.
function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const first = forwardedFor?.split(",")[0]?.trim();
  return first || "unknown";
}

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error("ADMIN_PASSWORD is not configured.");
    return NextResponse.json({ error: "Admin login is not configured." }, { status: 500 });
  }

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

  let password: unknown;
  try {
    ({ password } = await req.json());
  } catch {
    password = undefined;
  }

  const candidate = typeof password === "string" ? password : "";

  if (timingSafeStringEqual(candidate, expected)) {
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
