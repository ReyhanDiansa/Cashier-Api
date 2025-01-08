-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('helper', 'admin') NOT NULL DEFAULT 'helper';
