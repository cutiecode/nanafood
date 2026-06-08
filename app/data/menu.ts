export type Supplement = {
  id: string;
  name: string;
  price: number;
};

export type Drink = {
  id: string;
  name: string;
  price: number;
};

export type SpiceLevel = "mild" | "medium" | "hot" | "extra-hot";

export type Category = {
  id: string;
  label: string;
  description?: string;
};

export type Dish = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  category: string;
  popular?: boolean;
  spiceable: boolean;
  feeds: number;
  supplements: Supplement[];
  drinks: Drink[];
  imageUrl?: string;
};

export const spiceLevels: { id: SpiceLevel; label: string }[] = [
  { id: "mild", label: "Mild" },
  { id: "medium", label: "Medium" },
  { id: "hot", label: "Hot" },
  { id: "extra-hot", label: "Extra Hot" },
];

export const defaultDrinks: Drink[] = [
  { id: "bissap", name: "Bissap (Hibiscus juice)", price: 3.5 },
  { id: "ginger", name: "Ginger lemonade", price: 3.5 },
  { id: "tamarind", name: "Tamarind juice", price: 3.5 },
  { id: "water", name: "Still water", price: 1.5 },
  { id: "sparkling", name: "Sparkling water", price: 2.0 },
];

export const defaultSupplements: Supplement[] = [
  { id: "attieke", name: "Attiéké (cassava couscous)", price: 2.5 },
  { id: "rice", name: "Steamed rice", price: 1.5 },
  { id: "aloco", name: "Fried plantains (Aloco)", price: 2.0 },
  { id: "extra-sauce", name: "Extra sauce", price: 1.0 },
  { id: "extra-attieke", name: "Extra attiéké", price: 2.0 },
  { id: "hot-pepper", name: "Hot pepper sauce", price: 0.75 },
  { id: "onion-salad", name: "Extra onion salad", price: 1.0 },
  { id: "extra-egg", name: "Extra egg", price: 1.5 },
  { id: "grilled-chicken", name: "Grilled chicken side", price: 4.0 },
  { id: "extra-foutou", name: "Extra foutou", price: 2.0 },
  { id: "extra-meat", name: "Extra beef", price: 3.5 },
  { id: "smoked-fish", name: "Extra smoked fish", price: 3.0 },
  { id: "extra-fish", name: "Extra fish", price: 3.5 },
  { id: "yassa-sauce", name: "Yassa onion sauce", price: 1.5 },
  { id: "dibi", name: "Grilled lamb side", price: 5.0 },
  { id: "chicken", name: "Chicken", price: 3.0 },
  { id: "beef", name: "Beef", price: 4.0 },
  { id: "fish", name: "Smoked fish", price: 3.5 },
];

export const categories: Category[] = [
  { id: "ivorian", label: "Ivorian", description: "Traditional dishes from Côte d'Ivoire" },
  { id: "senegalese", label: "Senegalese", description: "Iconic dishes from Senegal" },
  { id: "other", label: "West African", description: "Other West African specialties" },
];

export const menu: Dish[] = [
  {
    id: "kedjenou",
    name: "Kedjenou Chicken",
    description: "Slow-steamed chicken with tomatoes, onions and African spices.",
    longDescription: "Kedjenou is one of the most iconic dishes of Côte d'Ivoire. Slow-steamed in a sealed canari pot with tomatoes, onions, ginger, and a blend of West African spices, the chicken becomes incredibly tender and deeply flavorful. No water is added — the dish cooks entirely in its own juices, creating a rich, concentrated sauce. Served with your choice of attiéké or steamed rice.",
    price: 16.99,
    category: "ivorian",
    popular: true,
    spiceable: true,
    feeds: 2,
    supplements: [
      { id: "attieke", name: "Attiéké (cassava couscous)", price: 2.5 },
      { id: "rice", name: "Steamed rice", price: 1.5 },
      { id: "aloco", name: "Fried plantains (Aloco)", price: 2.0 },
      { id: "extra-sauce", name: "Extra sauce", price: 1.0 },
    ],
    drinks: defaultDrinks,
  },
  {
    id: "attieke-poisson",
    name: "Attiéké & Grilled Fish",
    description: "Cassava couscous with whole grilled tilapia and fresh onion salad.",
    longDescription: "A staple of the Ivorian street food scene, this dish pairs light and fluffy attiéké — fermented cassava couscous — with a whole grilled tilapia seasoned with garlic, chili, and citrus. Topped with a fresh raw onion and tomato salad and served with our house chili sauce on the side. Simple, fresh, and deeply satisfying.",
    price: 18.99,
    originalPrice: 22.99,
    discountPercent: 17,
    category: "ivorian",
    popular: true,
    spiceable: true,
    feeds: 1,
    supplements: [
      { id: "extra-attieke", name: "Extra attiéké", price: 2.0 },
      { id: "aloco", name: "Fried plantains (Aloco)", price: 2.0 },
      { id: "hot-pepper", name: "Hot pepper sauce", price: 0.75 },
      { id: "onion-salad", name: "Extra onion salad", price: 1.0 },
    ],
    drinks: defaultDrinks,
  },
  {
    id: "alloco",
    name: "Alloco Platter",
    description: "Golden fried sweet plantains with fried eggs and spicy tomato sauce.",
    longDescription: "Alloco is the ultimate Abidjan comfort food. Ripe sweet plantains are fried until golden and caramelized, then served alongside fried eggs and a bold, spicy tomato sauce made with scotch bonnet peppers, onions, and garlic. A true classic found at every maquis in Abidjan, now made fresh for you in Denver.",
    price: 11.99,
    category: "ivorian",
    spiceable: true,
    feeds: 1,
    supplements: [
      { id: "extra-egg", name: "Extra egg", price: 1.5 },
      { id: "grilled-chicken", name: "Grilled chicken side", price: 4.0 },
      { id: "extra-sauce", name: "Extra spicy sauce", price: 0.75 },
    ],
    drinks: defaultDrinks,
  },
  {
    id: "soupe-kangou",
    name: "Soupe Kangou",
    description: "Rich okra soup with smoked fish, beef and traditional spices.",
    longDescription: "Soupe Kangou is a hearty, soul-warming okra soup cooked low and slow with smoked fish, tender beef, and a blend of traditional Ivorian spices. The okra gives the broth a naturally thick and velvety texture. Served with foutou — a smooth paste made from plantain and cassava — for an authentic, filling meal.",
    price: 15.99,
    category: "ivorian",
    spiceable: true,
    feeds: 2,
    supplements: [
      { id: "extra-foutou", name: "Extra foutou", price: 2.0 },
      { id: "extra-meat", name: "Extra beef", price: 3.5 },
      { id: "smoked-fish", name: "Extra smoked fish", price: 3.0 },
    ],
    drinks: defaultDrinks,
  },
  {
    id: "thieboudienne",
    name: "Thiéboudienne",
    description: "The iconic Senegalese rice and fish, slow-cooked in rich tomato broth.",
    longDescription: "Thiéboudienne — meaning 'rice and fish' in Wolof — is the national dish of Senegal and one of the great rice dishes of the world. Fish is stuffed with a blend of parsley, garlic, and scotch bonnet, then seared and slow-cooked with vegetables in a deeply savory tomato and tamarind broth. The rice absorbs every drop of flavor. A dish that demands respect.",
    price: 17.99,
    category: "senegalese",
    popular: true,
    spiceable: false,
    feeds: 3,
    supplements: [
      { id: "extra-fish", name: "Extra fish", price: 3.5 },
      { id: "yassa-sauce", name: "Yassa onion sauce", price: 1.5 },
      { id: "dibi", name: "Grilled lamb side", price: 5.0 },
    ],
    drinks: defaultDrinks,
  },
  {
    id: "akassa",
    name: "Akassa & Sauce Gombo",
    description: "Fermented corn paste with velvety okra sauce and your choice of protein.",
    longDescription: "Akassa is a traditional fermented corn paste with a subtle tangy flavor, smooth and comforting in texture. Paired with a rich sauce gombo — okra sauce cooked with palm oil, crayfish, and your choice of protein — it makes for a deeply nourishing and traditional West African meal. A dish rooted in Beninese and Ivorian culinary heritage.",
    price: 13.99,
    category: "other",
    spiceable: true,
    feeds: 2,
    supplements: [
      { id: "chicken", name: "Chicken", price: 3.0 },
      { id: "beef", name: "Beef", price: 4.0 },
      { id: "fish", name: "Smoked fish", price: 3.5 },
      { id: "extra-sauce", name: "Extra gombo sauce", price: 1.5 },
    ],
    drinks: defaultDrinks,
  },
];

export const filterCategories = [
  { id: "all", label: "All Dishes" },
  ...categories,
  { id: "drinks", label: "Drinks" },
  { id: "extras", label: "Extras" },
];

// Legacy export for compatibility
export const drinks = defaultDrinks;
export const spiceLevel = spiceLevels;