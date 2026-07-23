-- CreateTable
CREATE TABLE "user_hair_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitId" TEXT,
    "faceShape" TEXT NOT NULL,
    "faceConfidence" REAL NOT NULL,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_hair_profiles_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_hair_profiles_visitId_key" ON "user_hair_profiles"("visitId");
