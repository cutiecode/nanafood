-- CreateTable
CREATE TABLE "DishDessert" (
    "dishId" TEXT NOT NULL,
    "dessertId" TEXT NOT NULL,

    PRIMARY KEY ("dishId", "dessertId"),
    CONSTRAINT "DishDessert_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DishDessert_dessertId_fkey" FOREIGN KEY ("dessertId") REFERENCES "Dessert" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
