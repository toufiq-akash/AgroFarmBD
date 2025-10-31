-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 31, 2025 at 06:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `signup`
--

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `owner_email` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `userId`, `name`, `price`, `image`, `description`, `owner_email`) VALUES
(12, 10, 'borboti', 50.00, '/uploads/1761852172673-134502937.png', 'testy', NULL),
(13, 6, 'begun', 40.00, '/uploads/1761852723117-916760822.jpeg', 'taja begun', NULL),
(14, 10, 'Brokoli', 200.00, '/uploads/1761853224689-881494541.png', 'Fresh from field', NULL),
(15, 10, 'Mula', 40.00, '/uploads/1761853253928-326508802.png', 'winter special vegetables', NULL),
(16, 6, 'korola', 60.00, '/uploads/1761921478651-922411987.png', 'best quality', NULL),
(17, 10, 'Alu', 40.00, '/uploads/1761922135583-661081164.png', 'Fresh Alu', NULL),
(18, 6, 'Dherosh', 50.00, '/uploads/1761926239029-510966682.png', 'Fresh Best quality', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `reportedUserId` int(11) DEFAULT NULL,
  `reporterName` varchar(255) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `proofUrl` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `password`, `role`, `status`) VALUES
(1, 'aksh', 'aksh@em.com', '$2b$10$TuLO41iyJrz4MLmZxkfwJOBrsKVjFWVRIsSZw1P8b3NOaGXBEO80i', 'Customer', 'active'),
(2, 'binsec01', 'binsec01@ducks.com', '$2b$10$vbZpz8LI/F8AKK60SLFzCuwRZ0RPRboSK8Xis.hGtw/Ov1PyYM9GC', 'Owner', 'active'),
(4, 'k', 'k@gmail.com', '$2b$10$UXEnHfVijXMgEg8HBrNXMOFHn/IZCzb1xItwKUL6FCr/XEPWm.DS6', 'Owner', 'active'),
(6, 'Istiyak Karim', 'isty@gmail.com', '$2b$10$PkSjxbqmcEPNZF0.nJO.S.9Ry.mk5UdxqZDFTQJ3G0m75PcRuJvO2', 'Owner', 'active'),
(7, 'Akash', 'akash@gmail.com', '$2b$10$XnKUnh74YpcUM7B4syYG2u5RM.CYzC3JdXzzXmiok8d5SNLxOGaGG', 'Customer', 'active'), 
-- pass: 12345
(9, 'Mamun', 'mam@gmail.com', '$2b$10$xsIB3zSHIrK0QS8JeCrm5uN9rfxwqO9ngDQXE3zKvmjy1..cBTQi.', 'Admin', 'active'), 
-- pass:20032003
(10, 'toufiq', 'tou@gmail.com', '$2b$10$sKerRO3V5aeP6K4lyCgW1uVIfIfpylis8hi5kL08uqNqpWsbDR6xe', 'Owner', 'active'),
(11, 'isty', 'is@gmail.com', '$2b$10$.B4EwYYkJF1oHdGKN8kN..JXDFzEOIRO9uD/vWzq//hry34pK8r8i', 'Owner', 'active'),
--  pass:12345
(12, 'Amio', 'omio@gmail.com', '$2b$10$lNQ.51I8xdQ9YRr16HIrN.fM/5K0GAiqLZshRVgPUk7JxvifcqZgq', 'Customer', 'active');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
