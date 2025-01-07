-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_colorId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_sizeId_fkey`;

-- DropIndex
DROP INDEX `Product_colorId_fkey` ON `product`;

-- DropIndex
DROP INDEX `Product_sizeId_fkey` ON `product`;

-- AlterTable
ALTER TABLE `product` MODIFY `colorId` INTEGER NULL,
    MODIFY `sizeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
