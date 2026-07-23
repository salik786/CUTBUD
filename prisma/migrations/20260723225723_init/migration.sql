-- CreateTable
CREATE TABLE "shops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "entryQrToken" TEXT NOT NULL,
    "exitQrToken" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "deviceSessionToken" TEXT NOT NULL,
    "selectedGenerationId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "ratedAt" TIMESTAMP(3),

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "style_catalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "basePrompt" TEXT NOT NULL,
    "faceShapeFit" TEXT NOT NULL,
    "guardNumber" TEXT,
    "lengthMm" TEXT,
    "fadeType" TEXT,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "style_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "style_generations" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "styleCatalogId" TEXT NOT NULL,
    "frontImageUrl" TEXT NOT NULL,
    "sideImageUrl" TEXT NOT NULL,
    "backImageUrl" TEXT NOT NULL,
    "instructionText" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "style_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "oauthProvider" TEXT,
    "oauthId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_cuts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "styleGenerationId" TEXT NOT NULL,
    "shopId" TEXT,
    "note" TEXT,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_cuts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "beforeImageUrl" TEXT,
    "afterImageUrl" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_hair_profiles" (
    "id" TEXT NOT NULL,
    "visitId" TEXT,
    "faceShape" TEXT NOT NULL,
    "faceConfidence" DOUBLE PRECISION NOT NULL,
    "faceLength" TEXT NOT NULL,
    "jawline" TEXT NOT NULL,
    "forehead" TEXT NOT NULL,
    "hairType" TEXT NOT NULL,
    "hairDensity" TEXT NOT NULL,
    "hairThickness" TEXT NOT NULL,
    "hairline" TEXT NOT NULL,
    "hairTexture" TEXT NOT NULL,
    "hairDirection" TEXT NOT NULL,
    "hairVolume" TEXT NOT NULL,
    "recommendedStyles" TEXT NOT NULL,
    "avoidStyles" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_hair_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shops_entryQrToken_key" ON "shops"("entryQrToken");

-- CreateIndex
CREATE UNIQUE INDEX "shops_exitQrToken_key" ON "shops"("exitQrToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_visitId_key" ON "ratings"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "user_hair_profiles_visitId_key" ON "user_hair_profiles"("visitId");

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_selectedGenerationId_fkey" FOREIGN KEY ("selectedGenerationId") REFERENCES "style_generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "style_generations" ADD CONSTRAINT "style_generations_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "style_generations" ADD CONSTRAINT "style_generations_styleCatalogId_fkey" FOREIGN KEY ("styleCatalogId") REFERENCES "style_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_cuts" ADD CONSTRAINT "saved_cuts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_cuts" ADD CONSTRAINT "saved_cuts_styleGenerationId_fkey" FOREIGN KEY ("styleGenerationId") REFERENCES "style_generations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_cuts" ADD CONSTRAINT "saved_cuts_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_hair_profiles" ADD CONSTRAINT "user_hair_profiles_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
