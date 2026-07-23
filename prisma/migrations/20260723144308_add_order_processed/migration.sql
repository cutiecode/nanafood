-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT,
    "amount" REAL NOT NULL,
    "items" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "discount" REAL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Order" ("address", "amount", "createdAt", "discount", "id", "items", "orderNumber", "phone") SELECT "address", "amount", "createdAt", "discount", "id", "items", "orderNumber", "phone" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
