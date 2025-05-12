/*
  Warnings:

  - You are about to drop the column `phone_number` on the `Doctor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone_numbertemp]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone_numbertemp` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "phone_number",
ADD COLUMN     "phone_numbertemp" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_phone_numbertemp_key" ON "Doctor"("phone_numbertemp");
