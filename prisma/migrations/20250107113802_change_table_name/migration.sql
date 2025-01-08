/*
  Warnings:

  - You are about to drop the `orderdetail` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `orderdetail` DROP FOREIGN KEY `OrderDetail_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `orderdetail` DROP FOREIGN KEY `OrderDetail_productId_fkey`;

-- DropTable
DROP TABLE `orderdetail`;

-- CreateTable
CREATE TABLE `Order_Detail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order_Detail` ADD CONSTRAINT `Order_Detail_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`orderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order_Detail` ADD CONSTRAINT `Order_Detail_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
