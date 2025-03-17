-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "bloodType" "BloodType",
ADD COLUMN     "clinic_location" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "weight" DOUBLE PRECISION;
