import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  await prisma.dishDrink.deleteMany();
  await prisma.supplement.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.drink.deleteMany();
  await prisma.category.deleteMany();

  const ivorian = await prisma.category.create({
    data: { label: "Ivorian", description: "Traditional dishes from Côte d'Ivoire", order: 1 },
  });
  const senegalese = await prisma.category.create({
    data: { label: "Senegalese", description: "Iconic dishes from Senegal", order: 2 },
  });
  const westAfrican = await prisma.category.create({
    data: { label: "West African", description: "Other West African specialties", order: 3 },
  });

  const bissap = await prisma.drink.create({ data: { name: "Bissap (Hibiscus juice)", price: 3.5 } });
  const ginger = await prisma.drink.create({ data: { name: "Ginger lemonade", price: 3.5 } });
  const tamarind = await prisma.drink.create({ data: { name: "Tamarind juice", price: 3.5 } });
  const water = await prisma.drink.create({ data: { name: "Still water", price: 1.5 } });
  const sparkling = await prisma.drink.create({ data: { name: "Sparkling water", price: 2.0 } });

  const allDrinks = [bissap, ginger, tamarind, water, sparkling];

  await prisma.dish.create({
    data: {
      name: "Kedjenou Chicken",
      description: "Slow-steamed chicken with tomatoes, onions and African spices.",
      longDescription: "Kedjenou is one of the most iconic dishes of Côte d'Ivoire. Slow-steamed in a sealed canari pot with tomatoes, onions, ginger, and a blend of West African spices, the chicken becomes incredibly tender and deeply flavorful. No water is added — the dish cooks entirely in its own juices, creating a rich, concentrated sauce.",
      price: 16.99,
      popular: true,
      spiceable: true,
      feeds: 2,
      categoryId: ivorian.id,
      supplements: {
        create: [
          { name: "Attiéké (cassava couscous)", price: 2.5 },
          { name: "Steamed rice", price: 1.5 },
          { name: "Fried plantains (Aloco)", price: 2.0 },
          { name: "Extra sauce", price: 1.0 },
        ],
      },
      dishDrinks: { create: allDrinks.map((d) => ({ drinkId: d.id })) },
    },
  });

  await prisma.dish.create({
    data: {
      name: "Attiéké & Grilled Fish",
      description: "Cassava couscous with whole grilled tilapia and fresh onion salad.",
      longDescription: "A staple of the Ivorian street food scene, this dish pairs light and fluffy attiéké with a whole grilled tilapia seasoned with garlic, chili, and citrus. Topped with a fresh raw onion and tomato salad and served with our house chili sauce on the side.",
      price: 18.99,
      originalPrice: 22.99,
      discountPercent: 17,
      popular: true,
      spiceable: true,
      feeds: 1,
      categoryId: ivorian.id,
      supplements: {
        create: [
          { name: "Extra attiéké", price: 2.0 },
          { name: "Fried plantains (Aloco)", price: 2.0 },
          { name: "Hot pepper sauce", price: 0.75 },
          { name: "Extra onion salad", price: 1.0 },
        ],
      },
      dishDrinks: { create: allDrinks.map((d) => ({ drinkId: d.id })) },
    },
  });

  await prisma.dish.create({
    data: {
      name: "Alloco Platter",
      description: "Golden fried sweet plantains with fried eggs and spicy tomato sauce.",
      longDescription: "Alloco is the ultimate Abidjan comfort food. Ripe sweet plantains are fried until golden and caramelized, then served alongside fried eggs and a bold, spicy tomato sauce made with scotch bonnet peppers, onions, and garlic.",
      price: 11.99,
      spiceable: true,
      feeds: 1,
      categoryId: ivorian.id,
      supplements: {
        create: [
          { name: "Extra egg", price: 1.5 },
          { name: "Grilled chicken side", price: 4.0 },
          { name: "Extra spicy sauce", price: 0.75 },
        ],
      },
      dishDrinks: { create: allDrinks.map((d) => ({ drinkId: d.id })) },
    },
  });

  await prisma.dish.create({
    data: {
      name: "Soupe Kangou",
      description: "Rich okra soup with smoked fish, beef and traditional spices.",
      longDescription: "Soupe Kangou is a hearty, soul-warming okra soup cooked low and slow with smoked fish, tender beef, and a blend of traditional Ivorian spices. The okra gives the broth a naturally thick and velvety texture. Served with foutou.",
      price: 15.99,
      spiceable: true,
      feeds: 2,
      categoryId: ivorian.id,
      supplements: {
        create: [
          { name: "Extra foutou", price: 2.0 },
          { name: "Extra beef", price: 3.5 },
          { name: "Extra smoked fish", price: 3.0 },
        ],
      },
      dishDrinks: { create: allDrinks.map((d) => ({ drinkId: d.id })) },
    },
  });

  await prisma.dish.create({
    data: {
      name: "Thiéboudienne",
      description: "The iconic Senegalese rice and fish, slow-cooked in rich tomato broth.",
      longDescription: "Thiéboudienne — meaning 'rice and fish' in Wolof — is the national dish of Senegal. Fish is stuffed with a blend of parsley, garlic, and scotch bonnet, then seared and slow-cooked with vegetables in a deeply savory tomato and tamarind broth.",
      price: 17.99,
      popular: true,
      spiceable: false,
      feeds: 3,
      categoryId: senegalese.id,
      supplements: {
        create: [
          { name: "Extra fish", price: 3.5 },
          { name: "Yassa onion sauce", price: 1.5 },
          { name: "Grilled lamb side", price: 5.0 },
        ],
      },
      dishDrinks: { create: allDrinks.map((d) => ({ drinkId: d.id })) },
    },
  });

  await prisma.dish.create({
    data: {
      name: "Akassa & Sauce Gombo",
      description: "Fermented corn paste with velvety okra sauce and your choice of protein.",
      longDescription: "Akassa is a traditional fermented corn paste with a subtle tangy flavor, smooth and comforting in texture. Paired with a rich sauce gombo cooked with palm oil, crayfish, and your choice of protein.",
      price: 13.99,
      spiceable: true,
      feeds: 2,
      categoryId: westAfrican.id,
      supplements: {
        create: [
          { name: "Chicken", price: 3.0 },
          { name: "Beef", price: 4.0 },
          { name: "Smoked fish", price: 3.5 },
          { name: "Extra gombo sauce", price: 1.5 },
        ],
      },
      dishDrinks: { create: allDrinks.map((d) => ({ drinkId: d.id })) },
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });