-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 22, 2025 at 04:34 PM
-- Server version: 8.0.42
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `spk_ahp_unj`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `email`, `password`) VALUES
(1, 'admin@unj.ac.id', 'unj123'),
(3, 'adminptik@unj.ac.id', 'ptikunj23');

-- --------------------------------------------------------

--
-- Table structure for table `kriteria`
--

CREATE TABLE `kriteria` (
  `id` int NOT NULL,
  `kode` varchar(10) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `bobot` decimal(5,4) NOT NULL DEFAULT '0.0000',
  `aktif` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `kriteria`
--

INSERT INTO `kriteria` (`id`, `kode`, `nama`, `bobot`, `aktif`) VALUES
(12, 'C1', 'Penambahan Ruangan', '0.0230', 1),
(13, 'C2', 'Penambahan Monitor', '0.0495', 1),
(14, 'C3', 'Penambahan Keyboard', '0.0915', 1),
(15, 'C4', 'Penambahan Mouse', '0.0877', 1),
(16, 'C5', 'Penambahan System Unit Computer', '0.0584', 1),
(17, 'C6', 'Penambahan Meja dan Kursi', '0.0345', 1),
(18, 'C7', 'Penambahan Kabel dan Terminal Listrik', '0.1877', 1),
(19, 'C8', 'Penambahan AC', '0.0180', 1),
(20, 'C9', 'Software Peminatan RPL', '0.1499', 1),
(21, 'C10', 'Software Peminatan TKJ', '0.1499', 1),
(22, 'C11', 'Software Peminatan MM', '0.1499', 1);

-- --------------------------------------------------------

--
-- Table structure for table `perbandingan`
--

CREATE TABLE `perbandingan` (
  `id` int NOT NULL,
  `kriteria_i` int NOT NULL,
  `kriteria_j` int NOT NULL,
  `nilai` decimal(10,6) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `perbandingan`
--

INSERT INTO `perbandingan` (`id`, `kriteria_i`, `kriteria_j`, `nilai`, `created_at`) VALUES
(1, 12, 14, '0.200000', '2025-12-17 06:17:18'),
(2, 12, 17, '0.200000', '2025-12-17 06:17:18'),
(3, 12, 16, '0.200000', '2025-12-17 06:17:18'),
(4, 12, 13, '0.200000', '2025-12-17 06:17:18'),
(5, 12, 18, '0.333333', '2025-12-17 06:17:18'),
(6, 12, 15, '0.200000', '2025-12-17 06:17:18'),
(7, 12, 19, '3.000000', '2025-12-17 06:17:18'),
(8, 12, 20, '0.142857', '2025-12-17 06:17:18'),
(9, 12, 21, '0.142857', '2025-12-17 06:17:18'),
(10, 12, 22, '0.142857', '2025-12-17 06:17:18'),
(11, 13, 14, '0.333333', '2025-12-17 06:17:18'),
(12, 13, 15, '0.333333', '2025-12-17 06:17:18'),
(13, 13, 16, '0.333333', '2025-12-17 06:17:18'),
(14, 13, 17, '5.000000', '2025-12-17 06:17:18'),
(15, 13, 18, '0.333333', '2025-12-17 06:17:18'),
(16, 13, 19, '3.000000', '2025-12-17 06:17:18'),
(17, 13, 20, '0.200000', '2025-12-17 06:17:18'),
(18, 13, 21, '0.200000', '2025-12-17 06:17:18'),
(19, 13, 22, '0.200000', '2025-12-17 06:17:18'),
(20, 14, 15, '1.000000', '2025-12-17 06:17:18'),
(21, 14, 16, '3.000000', '2025-12-17 06:17:18'),
(22, 14, 17, '3.000000', '2025-12-17 06:17:18'),
(23, 14, 18, '1.000000', '2025-12-17 06:17:18'),
(24, 14, 19, '5.000000', '2025-12-17 06:17:18'),
(25, 14, 20, '0.333333', '2025-12-17 06:17:18'),
(26, 14, 21, '0.333333', '2025-12-17 06:17:18'),
(27, 14, 22, '0.333333', '2025-12-17 06:17:18'),
(28, 15, 16, '3.000000', '2025-12-17 06:17:18'),
(29, 15, 17, '3.000000', '2025-12-17 06:17:18'),
(30, 15, 18, '1.000000', '2025-12-17 06:17:18'),
(31, 15, 19, '3.000000', '2025-12-17 06:17:18'),
(32, 15, 20, '0.333333', '2025-12-17 06:17:18'),
(33, 15, 21, '0.333333', '2025-12-17 06:17:18'),
(34, 15, 22, '0.333333', '2025-12-17 06:17:18'),
(35, 16, 17, '3.000000', '2025-12-17 06:17:18'),
(36, 16, 18, '0.333333', '2025-12-17 06:17:18'),
(37, 16, 19, '3.000000', '2025-12-17 06:17:18'),
(38, 16, 20, '0.333333', '2025-12-17 06:17:18'),
(39, 16, 21, '0.333333', '2025-12-17 06:17:18'),
(40, 16, 22, '0.333333', '2025-12-17 06:17:18'),
(41, 17, 18, '0.200000', '2025-12-17 06:17:18'),
(42, 17, 19, '3.000000', '2025-12-17 06:17:18'),
(43, 17, 20, '0.200000', '2025-12-17 06:17:18'),
(44, 17, 21, '0.200000', '2025-12-17 06:17:18'),
(45, 17, 22, '0.200000', '2025-12-17 06:17:18'),
(46, 18, 19, '5.000000', '2025-12-17 06:17:18'),
(47, 18, 20, '3.000000', '2025-12-17 06:17:18'),
(48, 18, 21, '3.000000', '2025-12-17 06:17:18'),
(49, 18, 22, '3.000000', '2025-12-17 06:17:18'),
(50, 19, 20, '0.142857', '2025-12-17 06:17:18'),
(51, 19, 21, '0.142857', '2025-12-17 06:17:18'),
(52, 19, 22, '0.142857', '2025-12-17 06:17:18'),
(53, 20, 21, '1.000000', '2025-12-17 06:17:18'),
(54, 20, 22, '1.000000', '2025-12-17 06:17:18'),
(55, 21, 22, '1.000000', '2025-12-17 06:17:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `kriteria`
--
ALTER TABLE `kriteria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode` (`kode`);

--
-- Indexes for table `perbandingan`
--
ALTER TABLE `perbandingan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_pair` (`kriteria_i`,`kriteria_j`),
  ADD KEY `kriteria_j` (`kriteria_j`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `kriteria`
--
ALTER TABLE `kriteria`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `perbandingan`
--
ALTER TABLE `perbandingan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=661;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `perbandingan`
--
ALTER TABLE `perbandingan`
  ADD CONSTRAINT `perbandingan_ibfk_1` FOREIGN KEY (`kriteria_i`) REFERENCES `kriteria` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `perbandingan_ibfk_2` FOREIGN KEY (`kriteria_j`) REFERENCES `kriteria` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
