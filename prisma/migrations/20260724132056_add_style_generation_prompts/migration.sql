-- AlterTable
ALTER TABLE "style_catalog" ADD COLUMN     "backPrompt" TEXT,
ADD COLUMN     "frontPrompt" TEXT,
ADD COLUMN     "leftPrompt" TEXT,
ADD COLUMN     "rightPrompt" TEXT,
ADD COLUMN     "tryonPrompt" TEXT;
