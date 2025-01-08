-- AlterTable
ALTER TABLE `order` ADD COLUMN `address` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `phone` VARCHAR(191) NULL;
