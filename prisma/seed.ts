import { PrismaClient } from '@prisma/client';
import {
  SEED_USER,
  SEED_ACCOUNTS,
  SEED_DEBTS,
  SEED_GOALS,
  SEED_BUDGET,
  SEED_RECURRING,
  SEED_TRANSACTIONS,
} from './seedData';
import { DEFAULT_CATEGORIES, DEFAULT_MERCHANT_RULES } from '../packages/shared/src/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Indian Personal Finance Tracker...');

  // 1. Upsert User
  const user = await prisma.user.upsert({
    where: { id: SEED_USER.id },
    update: {},
    create: {
      id: SEED_USER.id,
      email: SEED_USER.email,
      name: SEED_USER.name,
      monthlyIncome: SEED_USER.monthlyIncome,
      currency: SEED_USER.currency,
    },
  });
  console.log(`👤 Seeded User: ${user.name} (${user.email})`);

  // 2. Seed Categories and Subcategories
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
  console.log(`📂 Seeded ${DEFAULT_CATEGORIES.length} Indian categories & subcategories.`);

  // 3. Seed Accounts
  for (const acc of SEED_ACCOUNTS) {
    await prisma.account.upsert({
      where: { id: acc.id },
      update: acc,
      create: acc,
    });
  }
  console.log(`🏦 Seeded ${SEED_ACCOUNTS.length} accounts.`);

  // 4. Seed Debts & Loans
  for (const debt of SEED_DEBTS) {
    await prisma.debt.upsert({
      where: { id: debt.id },
      update: debt,
      create: debt,
    });
  }
  console.log(`💳 Seeded ${SEED_DEBTS.length} loan/debt accounts.`);

  // 5. Seed Goals
  for (const goal of SEED_GOALS) {
    await prisma.goal.upsert({
      where: { id: goal.id },
      update: goal,
      create: goal,
    });
  }
  console.log(`🎯 Seeded ${SEED_GOALS.length} financial goals.`);

  // 6. Seed Budget
  await prisma.budget.upsert({
    where: { id: SEED_BUDGET.id },
    update: { totalAmount: SEED_BUDGET.totalAmount },
    create: {
      id: SEED_BUDGET.id,
      userId: SEED_USER.id,
      month: SEED_BUDGET.month,
      totalAmount: SEED_BUDGET.totalAmount,
    },
  });

  for (const item of SEED_BUDGET.items) {
    await prisma.budgetItem.upsert({
      where: { id: item.id },
      update: { amount: item.amount },
      create: {
        id: item.id,
        budgetId: SEED_BUDGET.id,
        categoryId: item.categoryId,
        amount: item.amount,
      },
    });
  }
  console.log(`📊 Seeded monthly budget.`);

  // 7. Seed Recurring Transactions
  for (const rec of SEED_RECURRING) {
    await prisma.recurringTransaction.upsert({
      where: { id: rec.id },
      update: rec,
      create: rec,
    });
  }

  // 8. Seed Merchant Rules
  for (let i = 0; i < DEFAULT_MERCHANT_RULES.length; i++) {
    const rule = DEFAULT_MERCHANT_RULES[i];
    await prisma.merchantRule.upsert({
      where: { id: `rule_default_${i}` },
      update: {
        pattern: rule.pattern,
        merchantName: rule.merchantName,
        categoryId: rule.categoryId,
        subcategoryId: rule.subcategoryId,
        defaultType: rule.defaultType,
        confidenceScore: rule.confidenceScore,
        isRegex: rule.isRegex || false,
      },
      create: {
        id: `rule_default_${i}`,
        userId: SEED_USER.id,
        pattern: rule.pattern,
        merchantName: rule.merchantName,
        categoryId: rule.categoryId,
        subcategoryId: rule.subcategoryId,
        defaultType: rule.defaultType,
        confidenceScore: rule.confidenceScore,
        isRegex: rule.isRegex || false,
      },
    });
  }

  // 9. Seed Transactions
  for (const tx of SEED_TRANSACTIONS) {
    await prisma.transaction.upsert({
      where: { id: tx.id },
      update: tx,
      create: tx,
    });
  }
  console.log(`💸 Seeded ${SEED_TRANSACTIONS.length} transactions across 2 months.`);

  console.log('✅ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
