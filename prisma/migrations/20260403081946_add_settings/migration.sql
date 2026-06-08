-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "restaurantName" TEXT NOT NULL DEFAULT 'Nana-AfricanFood',
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
