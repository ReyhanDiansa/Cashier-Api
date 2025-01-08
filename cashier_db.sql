-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for cashier
CREATE DATABASE IF NOT EXISTS `cashier` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `cashier`;

-- Dumping structure for table cashier.color
CREATE TABLE IF NOT EXISTS `color` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table cashier.color: ~3 rows (approximately)
INSERT INTO `color` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
	(1, 'Red', '2025-01-07 07:25:44.547', '2025-01-07 07:25:44.547'),
	(2, 'Blue', '2025-01-07 07:26:48.454', '2025-01-08 05:51:39.970'),
	(4, 'White', '2025-01-07 07:34:13.964', '2025-01-07 07:34:13.964');

-- Dumping structure for table cashier.order
CREATE TABLE IF NOT EXISTS `order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','cancel','done') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `total` decimal(65,30) NOT NULL,
  `userId` int NOT NULL,
  `expiredAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Order_orderId_key` (`orderId`),
  KEY `Order_userId_fkey` (`userId`),
  CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table cashier.order: ~7 rows (approximately)
INSERT INTO `order` (`id`, `orderId`, `name`, `email`, `status`, `total`, `userId`, `expiredAt`, `createdAt`, `updatedAt`, `phone`, `address`) VALUES
	(4, 'ORD-1736256118515671-MMN', 'diansa marsalino', 'diansam@mail.com', 'pending', 40000.000000000000000000000000000000, 1, '2025-01-07 14:21:58.515', '2025-01-07 13:21:58.545', '2025-01-07 17:25:37.946', '08567825457', NULL),
	(5, 'ORD-1736256312064416-MMN', 'diansa marsalino', 'diansam@mail.com', 'cancel', 1800000.000000000000000000000000000000, 8, '2025-01-07 14:25:12.064', '2025-01-07 13:25:12.104', '2025-01-08 06:42:59.766', '08567825457', NULL),
	(14, 'ORD-1736321121920863-MMN', 'diansa', 'diansa@mail.com', 'pending', 3600000.000000000000000000000000000000, 3, '2025-01-08 08:25:21.921', '2025-01-08 07:25:21.975', '2025-01-08 07:25:21.975', NULL, NULL),
	(15, 'ORD-1736321139941355-MMN', 'diansa', 'diansa@mail.com', 'pending', 3600000.000000000000000000000000000000, 3, '2025-01-08 08:25:39.941', '2025-01-08 07:25:39.960', '2025-01-08 07:25:39.960', NULL, 'malang'),
	(16, 'ORD-1736325798065728-MMN', 'diansa', 'diansa@mail.com', 'done', 1800000.000000000000000000000000000000, 8, '2025-01-08 09:43:18.065', '2025-01-08 08:43:18.078', '2025-01-08 08:48:02.945', NULL, NULL),
	(17, 'ORD-1736326299899576-MMN', 'diansa', 'diansa@mail.com', 'pending', 1800000.000000000000000000000000000000, 8, '2025-01-08 09:51:39.899', '2025-01-08 08:51:39.916', '2025-01-08 08:52:23.231', NULL, NULL),
	(18, 'ORD-1736326544348966-MMN', 'diansa marsalino', 'diansa@mail.com', 'pending', 1800000.000000000000000000000000000000, 8, '2025-01-08 09:55:44.348', '2025-01-08 08:55:44.358', '2025-01-08 11:44:30.315', '08567825457', NULL);

-- Dumping structure for table cashier.order_detail
CREATE TABLE IF NOT EXISTS `order_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Order_Detail_orderId_fkey` (`orderId`),
  KEY `Order_Detail_productId_fkey` (`productId`),
  CONSTRAINT `Order_Detail_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`orderId`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Order_Detail_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table cashier.order_detail: ~7 rows (approximately)
INSERT INTO `order_detail` (`id`, `orderId`, `productId`, `quantity`) VALUES
	(19, 'ORD-1736256118515671-MMN', 8, 2),
	(24, 'ORD-1736256312064416-MMN', 10, 2),
	(25, 'ORD-1736321121920863-MMN', 10, 4),
	(26, 'ORD-1736321139941355-MMN', 10, 4),
	(27, 'ORD-1736325798065728-MMN', 12, 2),
	(28, 'ORD-1736326299899576-MMN', 12, 2),
	(31, 'ORD-1736326544348966-MMN', 10, 2);

-- Dumping structure for table cashier.product
CREATE TABLE IF NOT EXISTS `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(65,30) NOT NULL,
  `stock` int NOT NULL,
  `colorId` int DEFAULT NULL,
  `sizeId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Product_colorId_fkey` (`colorId`),
  KEY `Product_sizeId_fkey` (`sizeId`),
  CONSTRAINT `Product_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `color` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Product_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `size` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table cashier.product: ~3 rows (approximately)
INSERT INTO `product` (`id`, `name`, `sku`, `description`, `image`, `price`, `stock`, `colorId`, `sizeId`, `createdAt`, `updatedAt`) VALUES
	(8, 'hoodie', 'd6GiyRn2qaZX', 'pakaian', 'download_1736256358200.png', 20000.000000000000000000000000000000, 1, NULL, NULL, '2025-01-07 13:25:58.242', '2025-01-08 08:49:50.932'),
	(10, 'jersey timnas indonesia', 'zV4GCbKWewoW', 'jersey original', 'download_1736316546916.png', 900000.000000000000000000000000000000, 4, 1, 7, '2025-01-08 06:09:06.926', '2025-01-08 11:44:30.308'),
	(12, 'jersey arema fc', 'x1Ph5xxs9fHN', 'jersey original', 'download_1736325197172.png', 900000.000000000000000000000000000000, 18, 1, 7, '2025-01-08 08:33:17.184', '2025-01-08 08:56:27.850');

-- Dumping structure for table cashier.size
CREATE TABLE IF NOT EXISTS `size` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table cashier.size: ~1 rows (approximately)
INSERT INTO `size` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
	(7, 'XL', '2025-01-08 05:45:08.355', '2025-01-08 05:45:08.355');

-- Dumping structure for table cashier.user
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('helper','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'helper',
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table cashier.user: ~6 rows (approximately)
INSERT INTO `user` (`id`, `username`, `email`, `role`, `password`, `createdAt`, `updatedAt`) VALUES
	(1, 'reyhan diansa', 'reyhan@gmail.com', 'helper', '25d55ad283aa400af464c76d713c07ad', '2025-01-07 06:13:23.530', '2025-01-07 17:57:19.410'),
	(3, 'reyhans', 'reyhan@mail.com', 'helper', '25d55ad283aa400af464c76d713c07ad', '2025-01-08 05:23:17.379', '2025-01-08 05:23:17.379'),
	(4, 'admin cashier 1', 'admin@gmail.com', 'admin', '25d55ad283aa400af464c76d713c07ad', '2025-01-08 05:30:41.501', '2025-01-08 11:43:37.676'),
	(6, 'admin', 'admin@mail.com', 'admin', '25d55ad283aa400af464c76d713c07ad', '2025-01-08 08:07:50.516', '2025-01-08 08:07:50.516'),
	(7, 'admin3', 'admin3@mail.com', 'admin', '25d55ad283aa400af464c76d713c07ad', '2025-01-08 08:17:26.969', '2025-01-08 08:17:26.969'),
	(8, 'helper1', 'helper1@mail.com', 'helper', '25d55ad283aa400af464c76d713c07ad', '2025-01-08 08:17:51.079', '2025-01-08 08:17:51.079');

-- Dumping structure for table cashier._prisma_migrations
CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table cashier._prisma_migrations: ~6 rows (approximately)
/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
