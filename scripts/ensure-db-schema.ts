import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
config();

const prisma = new PrismaClient();

async function main() {
  // Use DATABASE_DIRECT_URL when available (bypass PgBouncer for DDL statements)
  const databaseUrl = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('DATABASE_URL not set. Skipping database schema guard.');
    return;
  }
  process.env.DATABASE_URL = databaseUrl;

  const statements = [
    'ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT',
    'ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "address" TEXT',
    'ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "businessHours" TEXT',
    'ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "institutionalText" TEXT',
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true',
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false',
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0',
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "galleryImage1" TEXT',
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "galleryImage2" TEXT',
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "galleryImage3" TEXT',
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT',
    'ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3)',
    'ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "usageLimit" INTEGER',
    'ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "usedCount" INTEGER NOT NULL DEFAULT 0',
    'ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "minOrder" DOUBLE PRECISION NOT NULL DEFAULT 0',
    'ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryMethod" TEXT NOT NULL DEFAULT \'DELIVERY\'',
    `CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
      "id" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "metadata" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
    )`,
    'CREATE INDEX IF NOT EXISTS "AnalyticsEvent_type_idx" ON "AnalyticsEvent"("type")',
    'CREATE INDEX IF NOT EXISTS "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt")',
  ];

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  console.log('Database schema guard completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
