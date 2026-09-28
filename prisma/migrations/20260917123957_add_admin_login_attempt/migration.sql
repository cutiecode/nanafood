-- CreateTable
CREATE TABLE "AdminLoginAttempt" (
    "ip" TEXT NOT NULL PRIMARY KEY,
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "firstFailureAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" DATETIME,
    "updatedAt" DATETIME NOT NULL
);
