import { PrismaClient } from '@prisma/client';
import { DEFAULT_CATEGORIES, DEFAULT_MERCHANT_RULES } from '../packages/shared/src/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Initializing system categories and merchant rules...');

  // 1. Seed Categories and Subcategories
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, icon: cat.icon, color: cat.color, isEssential: cat.isEssential },
      create: {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isEssential: cat.isEssential,
      },
    });

    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        await prisma.subcategory.upsert({
          where: { id: sub.id },
          update: { name: sub.name, icon: sub.icon },
          create: {
            id: sub.id,
            categoryId: cat.id,
            name: sub.name,
            icon: sub.icon,
          },
        });
      }
    }
  }
  console.log(`📂 Seeded ${DEFAULT_CATEGORIES.length} Indian system categories & subcategories.`);

  console.log('✅ System initialization complete with zero mock user data.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
