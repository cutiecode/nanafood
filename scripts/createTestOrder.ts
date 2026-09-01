import { prisma } from "../lib/prisma";

async function main() {
  const id = `test-${Date.now()}`;
  const order = await prisma.order.create({
    data: {
      id,
      orderNumber: `T${Math.floor(Math.random() * 9000) + 1000}`,
      amount: 25.5,
      items: "Test Dish x1",
      phone: "+10000000000",
      address: "123 Test St",
      discount: 0,
      note: "Please leave at the door (test)",
    },
  });
  console.log("Created order:", order);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
