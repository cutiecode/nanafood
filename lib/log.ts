import { prisma } from "@/lib/prisma";

// x-forwarded-for is set by the platform's edge/proxy on real deployments.
// Best-effort only — never blocks the caller if it's missing.
export function getClientIp(req: Request): string | null {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const first = forwardedFor?.split(",")[0]?.trim();
  return first || null;
}

type AdminActionParams = {
  action: string;
  entityId?: string | null;
  ip?: string | null;
  detail?: string | null;
};

// Logging must never break the request it's attached to — every failure here
// is swallowed (after a console.error) rather than propagated.
export async function logAdminAction(params: AdminActionParams): Promise<void> {
  try {
    await prisma.adminActionLog.create({
      data: {
        action: params.action,
        entityId: params.entityId ?? null,
        ip: params.ip ?? null,
        detail: params.detail ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to write AdminActionLog:", error);
  }
}

type ErrorLogParams = {
  route: string;
  error: unknown;
};

export async function logError(params: ErrorLogParams): Promise<void> {
  try {
    const message = params.error instanceof Error ? params.error.message : String(params.error);
    const stack = params.error instanceof Error ? (params.error.stack ?? null) : null;
    await prisma.errorLog.create({
      data: { route: params.route, message, stack },
    });
  } catch (loggingError) {
    console.error("Failed to write ErrorLog:", loggingError);
  }
}
