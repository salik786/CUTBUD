-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "openingHours" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "whatsapp" TEXT;

-- AlterTable
ALTER TABLE "style_catalog" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "barber_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barber_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barber_sessions" (
    "id" TEXT NOT NULL,
    "barberUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barber_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_styles" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "styleCatalogId" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "skillLevel" TEXT,
    "price" TEXT,
    "durationMin" INTEGER,
    "requiresAppointment" BOOLEAN NOT NULL DEFAULT false,
    "portfolioUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_styles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "barber_users_email_key" ON "barber_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "barber_users_shopId_key" ON "barber_users"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "shop_styles_shopId_styleCatalogId_key" ON "shop_styles"("shopId", "styleCatalogId");

-- AddForeignKey
ALTER TABLE "barber_users" ADD CONSTRAINT "barber_users_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barber_sessions" ADD CONSTRAINT "barber_sessions_barberUserId_fkey" FOREIGN KEY ("barberUserId") REFERENCES "barber_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_styles" ADD CONSTRAINT "shop_styles_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_styles" ADD CONSTRAINT "shop_styles_styleCatalogId_fkey" FOREIGN KEY ("styleCatalogId") REFERENCES "style_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
