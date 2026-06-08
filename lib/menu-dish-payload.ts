import { prisma } from "@/lib/prisma";

type DishOptionInput = {
  id?: string | null;
};

type SupplementInput = {
  name?: string | null;
  price?: number | string | null;
};

type DishPayloadInput = {
  name?: string | null;
  description?: string | null;
  longDescription?: string | null;
  price?: number | string | null;
  originalPrice?: number | string | null;
  discountPercent?: number | string | null;
  imageUrl?: string | null;
  popular?: boolean | null;
  spiceable?: boolean | null;
  feeds?: number | string | null;
  categoryId?: string | null;
  supplements?: SupplementInput[] | null;
  drinks?: DishOptionInput[] | null;
  desserts?: DishOptionInput[] | null;
};

type DishWriteData = {
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  imageUrl: string | null;
  popular: boolean;
  spiceable: boolean;
  feeds: number;
  categoryId: string;
  supplements: {
    create: Array<{
      name: string;
      price: number;
    }>;
  };
  dishDrinks: {
    create: Array<{
      drinkId: string;
    }>;
  };
  dishDesserts: {
    create: Array<{
      dessertId: string;
    }>;
  };
};

type DishPayloadResult =
  | { ok: true; data: DishWriteData }
  | { ok: false; status: number; error: string };

const toNullableNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const collectIds = (items: DishOptionInput[] | null | undefined) => {
  if (!Array.isArray(items)) return [];

  return [...new Set(
    items
      .map((item) => (typeof item?.id === "string" ? item.id.trim() : ""))
      .filter(Boolean)
  )];
};

export async function normalizeDishPayload(body: DishPayloadInput): Promise<DishPayloadResult> {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return { ok: false, status: 400, error: "Dish name is required." };
  }

  const price = Number(body.price);
  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, status: 400, error: "Dish price must be a valid number greater than 0." };
  }

  const categoryId = typeof body.categoryId === "string" ? body.categoryId.trim() : "";
  if (!categoryId) {
    return { ok: false, status: 400, error: "A valid category is required before saving a dish." };
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    return { ok: false, status: 400, error: "The selected category no longer exists. Refresh the page and try again." };
  }

  const uniqueDrinkIds = collectIds(body.drinks);
  if (uniqueDrinkIds.length > 0) {
    const validDrinks = await prisma.drink.findMany({
      where: { id: { in: uniqueDrinkIds } },
      select: { id: true },
    });

    const validDrinkIds = new Set(validDrinks.map((drink) => drink.id));
    const invalidDrinkIds = uniqueDrinkIds.filter((id) => !validDrinkIds.has(id));

    if (invalidDrinkIds.length > 0) {
      return {
        ok: false,
        status: 400,
        error: "One or more selected drink IDs are invalid.",
      };
    }
  }

  const uniqueDessertIds = collectIds(body.desserts);
  if (uniqueDessertIds.length > 0) {
    const validDesserts = await prisma.dessert.findMany({
      where: { id: { in: uniqueDessertIds } },
      select: { id: true },
    });

    const validDessertIds = new Set(validDesserts.map((dessert) => dessert.id));
    const invalidDessertIds = uniqueDessertIds.filter((id) => !validDessertIds.has(id));

    if (invalidDessertIds.length > 0) {
      return {
        ok: false,
        status: 400,
        error: "One or more selected dessert IDs are invalid.",
      };
    }
  }

  const supplements = Array.isArray(body.supplements)
    ? body.supplements
        .map((supplement) => ({
          name: typeof supplement?.name === "string" ? supplement.name.trim() : "",
          price: Number(supplement?.price),
        }))
        .filter((supplement) => supplement.name && Number.isFinite(supplement.price))
    : [];

  return {
    ok: true,
    data: {
      name,
      description: typeof body.description === "string" ? body.description : "",
      longDescription: typeof body.longDescription === "string" ? body.longDescription : "",
      price,
      originalPrice: toNullableNumber(body.originalPrice),
      discountPercent: toNullableNumber(body.discountPercent),
      imageUrl: typeof body.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl : null,
      popular: Boolean(body.popular),
      spiceable: Boolean(body.spiceable),
      feeds: Number(body.feeds) > 0 ? Number(body.feeds) : 1,
      categoryId,
      supplements: {
        create: supplements,
      },
      dishDrinks: {
        create: uniqueDrinkIds.map((drinkId) => ({ drinkId })),
      },
      dishDesserts: {
        create: uniqueDessertIds.map((dessertId) => ({ dessertId })),
      },
    },
  };
}
