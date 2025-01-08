/*
  Warnings:

  - You are about to drop the column `numberPhone` on the `order` table. All the data in the column will be lost.
  - Added the required column `phone` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `numberPhone`,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL;