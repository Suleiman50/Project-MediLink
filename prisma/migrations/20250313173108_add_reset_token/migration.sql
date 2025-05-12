-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "resetToken" TEXT;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "resetToken" TEXT;
