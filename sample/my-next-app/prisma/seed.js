// prisma/seed.js (CommonJS version)
const prismaClient = require("@prisma/client");
const { PrismaClient } = prismaClient;
const prisma = new PrismaClient();

async function main() {
  const demoProducts = [
    {
      id: "basic-tee",
      name: "Basic Tee",
      price: 499,
      image:
        "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&q=80",
    },
    {
      id: "hoodie",
      name: "Comfy Hoodie",
      price: 1299,
      image:
        "https://images.unsplash.com/photo-1520975432082-6c4b1b1d0d50?w=800&q=80",
    },
    {
      id: "cap",
      name: "Classic Cap",
      price: 299,
      image:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    },
    {
      id: "sneakers",
      name: "Street Sneakers",
      price: 2499,
      image:
        "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&q=80",
    },
  ];

  for (const p of demoProducts) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  console.log("✅ Seeded products into the database");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
