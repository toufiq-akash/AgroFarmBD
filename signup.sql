-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 09, 2025 at 07:29 AM
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
-- Table structure for table `deliverymen`
--

CREATE TABLE `deliverymen` (
  `id` int(11) NOT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `phone` varchar(80) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `farmowner_id` int(11) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `delivery_address` varchar(255) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `status` enum('Pending','Approved','Cancelled','Delivered') DEFAULT 'Pending',
  `deliveryman_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL
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
(13, 6, 'Begun', 40.00, '/uploads/1762075668955-863956794.jpeg', 'taja begun', NULL),
(14, 10, 'Brokoli', 200.00, '/uploads/1761853224689-881494541.png', 'Fresh from field', NULL),
(15, 10, 'Mula', 40.00, '/uploads/1761853253928-326508802.png', 'winter special vegetables', NULL),
(16, 6, 'korola', 60.00, '/uploads/1761921478651-922411987.png', 'best quality', NULL),
(17, 10, 'Alu', 40.00, '/uploads/1761922135583-661081164.png', 'Fresh Alu', NULL),
(18, 6, 'Dherosh', 50.00, '/uploads/1761926239029-510966682.png', 'Fresh Best quality', NULL),
(19, 10, 'Green Apple', 260.00, '/uploads/1761941879214-428281583.png', 'Testy fresh', NULL),
(20, 10, 'Onion Leaves', 60.00, '/uploads/1761941910862-266546518.png', 'winter special', NULL),
(21, 10, 'Tomato', 60.00, '/uploads/1761941938547-343388974.png', 'Fresh Quality', NULL),
(22, 6, 'Onion Piyaj', 60.00, '/uploads/1761943390087-170483377.png', 'Deshi', NULL),
(23, 6, 'Palong Shak', 50.00, '/uploads/1761943426018-20799216.png', 'Winter Special', NULL),
(24, 6, 'Squash', 40.00, '/uploads/1761943452505-501218162.png', 'Nice', NULL),
(27, 6, 'Fresh Dhone pata', 70.00, '/uploads/1762075718919-125816660.png', 'Fully Fresh', NULL),
(28, 6, 'Apple (Green)', 600.00, '/uploads/1762076826460-730640125.png', 'Premium', NULL),
(29, 6, 'Coriander', 40.00, '/uploads/1762443288621-898192775.png', 'fresh quality', NULL);

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
(9, 'Mamun', 'mam@gmail.com', '$2b$10$xsIB3zSHIrK0QS8JeCrm5uN9rfxwqO9ngDQXE3zKvmjy1..cBTQi.', 'Admin', 'active'),
(10, 'toufiq', 'tou@gmail.com', '$2b$10$sKerRO3V5aeP6K4lyCgW1uVIfIfpylis8hi5kL08uqNqpWsbDR6xe', 'Owner', 'active'),
(11, 'isty', 'is@gmail.com', '$2b$10$.B4EwYYkJF1oHdGKN8kN..JXDFzEOIRO9uD/vWzq//hry34pK8r8i', 'Owner', 'active'),
(12, 'Amio', 'omio@gmail.com', '$2b$10$lNQ.51I8xdQ9YRr16HIrN.fM/5K0GAiqLZshRVgPUk7JxvifcqZgq', 'Customer', 'active');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `deliverymen`
--
ALTER TABLE `deliverymen`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

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
-- AUTO_INCREMENT for table `deliverymen`
--
ALTER TABLE `deliverymen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

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
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
