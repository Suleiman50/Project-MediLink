-- AlterTable
ALTER TABLE "Doctor" ALTER COLUMN "gender" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Patient" ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "weight" DROP NOT NULL,
ALTER COLUMN "bloodType" DROP NOT NULL;
