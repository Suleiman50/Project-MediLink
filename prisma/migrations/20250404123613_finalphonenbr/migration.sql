/*
  Warnings:

  - You are about to drop the column `mig_test` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `tesing` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `test` on the `Doctor` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Doctor_tesing_key";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "mig_test",
DROP COLUMN "tesing",
DROP COLUMN "test";
