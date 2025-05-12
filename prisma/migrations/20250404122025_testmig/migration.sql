/*
  Warnings:

  - You are about to drop the column `phone_numbertemp` on the `Doctor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone_number]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tesing]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mig_test` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tesing` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `test` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Doctor_phone_numbertemp_key";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "phone_numbertemp",
ADD COLUMN     "mig_test" TEXT NOT NULL,
ADD COLUMN     "phone_number" TEXT NOT NULL,
ADD COLUMN     "tesing" TEXT NOT NULL,
ADD COLUMN     "test" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_phone_number_key" ON "Doctor"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_tesing_key" ON "Doctor"("tesing");
