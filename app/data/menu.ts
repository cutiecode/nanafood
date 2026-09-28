// Shared cart/menu types. The actual menu, categories, drinks and desserts
// all come from the database via /api/menu, /api/categories, /api/drinks and
// /api/desserts — this file only holds the type contract the cart relies on.

export type Supplement = {
  id: string;
  name: string;
  price: number;
};

export type Dish = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  imageUrl?: string | null;
  popular?: boolean;
  spiceable: boolean;
  feeds: number;
  available?: boolean;
  categoryId?: string;
  category: { id: string; label: string };
  supplements: Supplement[];
  drinks: Supplement[];
};
