-- AlterTable
ALTER TABLE "public"."Report" ADD COLUMN     "reportUrl" TEXT,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP DEFAULT;
