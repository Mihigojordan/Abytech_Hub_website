-- CreateEnum
CREATE TYPE "public"."ExpenseStatus" AS ENUM ('PENDING', 'APPROVED', 'COMPLETED');

-- AlterTable
ALTER TABLE "public"."Admin" ADD COLUMN     "publicId" TEXT;

-- AlterTable
ALTER TABLE "public"."Expense" ADD COLUMN     "status" "public"."ExpenseStatus" NOT NULL DEFAULT 'PENDING';
