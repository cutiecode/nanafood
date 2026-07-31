-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "restaurantName" TEXT NOT NULL DEFAULT 'Nana-AfricanFood',
    "logo" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT 'hello@nanafood.com',
    "phone" TEXT NOT NULL DEFAULT '+1 (720) 000-0000',
    "address" TEXT NOT NULL DEFAULT 'Denver, CO 80202',
    "hours" TEXT NOT NULL DEFAULT 'Mon–Sun · 11am – 10pm',
    "taxRate" REAL NOT NULL DEFAULT 8.81,
    "instagram" TEXT NOT NULL DEFAULT '',
    "facebook" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "tiktok" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Settings" ("address", "email", "facebook", "hours", "id", "instagram", "phone", "restaurantName", "taxRate", "tiktok", "whatsapp") SELECT "address", "email", "facebook", "hours", "id", "instagram", "phone", "restaurantName", "taxRate", "tiktok", "whatsapp" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
