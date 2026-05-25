-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 25-05-2026 a las 23:29:10
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sistema_pedidos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria`
--

CREATE TABLE `auditoria` (
  `id_auditoria` int(11) NOT NULL,
  `id_usuario` bigint(20) UNSIGNED NOT NULL,
  `accion` varchar(100) NOT NULL,
  `detalle` text DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `auditoria`
--

INSERT INTO `auditoria` (`id_auditoria`, `id_usuario`, `accion`, `detalle`, `ip`, `fecha`) VALUES
(1, 11, 'LOGIN', NULL, '::1', '2026-05-21 13:56:30'),
(2, 10, 'LOGIN', NULL, '::1', '2026-05-21 13:59:57'),
(3, 11, 'LOGIN', NULL, '::1', '2026-05-21 14:55:55'),
(4, 11, 'CREAR_PEDIDO', 'Pedido #29', '::1', '2026-05-21 14:56:06'),
(5, 10, 'LOGIN', NULL, '::1', '2026-05-21 14:56:29'),
(6, 10, 'EDITAR_PEDIDO', 'Pedido #29', '::1', '2026-05-21 14:57:51'),
(7, 10, 'CAMBIO_ESTADO', 'Pedido #29: 1→2', '::1', '2026-05-21 14:58:09'),
(8, 10, 'LOGIN', NULL, '::1', '2026-05-22 08:52:54'),
(9, 10, 'LOGIN', NULL, '::1', '2026-05-23 20:56:29'),
(10, 10, 'LOGIN', NULL, '::1', '2026-05-25 07:20:44'),
(11, 11, 'LOGIN', NULL, '::1', '2026-05-25 07:21:51'),
(12, 11, 'CREAR_PEDIDO', 'Pedido #30', '::1', '2026-05-25 07:22:00'),
(13, 10, 'LOGIN', NULL, '::1', '2026-05-25 07:34:28'),
(14, 10, 'LOGIN', NULL, '::1', '2026-05-25 15:36:58'),
(15, 11, 'LOGIN', NULL, '::1', '2026-05-25 15:40:16'),
(16, 11, 'CREAR_PEDIDO', 'Pedido #31', '::1', '2026-05-25 15:40:35'),
(17, 10, 'LOGIN', NULL, '::1', '2026-05-25 15:40:50'),
(18, 10, 'CAMBIO_ESTADO', 'Pedido #31: 1→2', '::1', '2026-05-25 15:41:20'),
(19, 10, 'CAMBIO_ESTADO', 'Pedido #31: 2→3', '::1', '2026-05-25 15:41:26'),
(20, 11, 'LOGIN', NULL, '::1', '2026-05-25 15:41:42'),
(21, 10, 'LOGIN', NULL, '::1', '2026-05-25 15:43:26'),
(22, 10, 'CREAR_USUARIO', 'Creó OPERADOR: dan12@jfdshn.com', '::1', '2026-05-25 15:43:50'),
(23, 11, 'LOGIN', NULL, '::1', '2026-05-25 15:44:04'),
(24, 12, 'LOGIN', NULL, '::1', '2026-05-25 15:44:11'),
(25, 10, 'LOGIN', NULL, '::1', '2026-05-25 15:51:42'),
(26, 12, 'LOGIN', NULL, '::1', '2026-05-25 16:11:51'),
(27, 11, 'LOGIN', NULL, '::1', '2026-05-25 16:14:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `documento` varchar(50) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `id_usuario` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id_cliente`, `nombre`, `documento`, `telefono`, `email`, `direccion`, `id_usuario`) VALUES
(1, 'Dan', NULL, NULL, NULL, NULL, 10),
(2, 'joe', NULL, NULL, NULL, NULL, 11);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `id_detalle` int(11) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `id_repuesto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(12,2) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`id_detalle`, `id_pedido`, `id_repuesto`, `cantidad`, `precio_unitario`, `observaciones`) VALUES
(1, 10, 4, 1, NULL, NULL),
(3, 11, 4, 1, NULL, NULL),
(5, 12, 4, 1, NULL, NULL),
(8, 13, 4, 1, NULL, NULL),
(13, 13, 5, 1, NULL, NULL),
(15, 14, 5, 1, NULL, NULL),
(16, 15, 4, 1, NULL, NULL),
(19, 16, 5, 1, NULL, NULL),
(22, 17, 4, 1, NULL, NULL),
(24, 18, 4, 1, NULL, NULL),
(26, 19, 5, 1, NULL, NULL),
(28, 20, 6, 1, NULL, NULL),
(30, 21, 5, 1, NULL, NULL),
(33, 22, 5, 1, NULL, NULL),
(35, 23, 4, 1, NULL, NULL),
(47, 25, 4, 1, NULL, NULL),
(56, 28, 5, 2, NULL, NULL),
(58, 30, 6, 3, 0.00, NULL),
(59, 31, 6, 2, 0.00, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_pedido`
--

CREATE TABLE `estado_pedido` (
  `id_estado` int(11) NOT NULL,
  `nombre_estado` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estado_pedido`
--

INSERT INTO `estado_pedido` (`id_estado`, `nombre_estado`, `descripcion`) VALUES
(1, 'PENDIENTE', 'Pedido creado'),
(2, 'EN PROCESO', 'Pedido en gestion'),
(3, 'FINALIZADO', 'Pedido completado'),
(4, 'CANCELADO', 'Pedido cancelado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_estado`
--

CREATE TABLE `historial_estado` (
  `id_historial` int(11) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `id_usuario` bigint(20) UNSIGNED NOT NULL,
  `id_estado_anterior` int(11) DEFAULT NULL,
  `id_estado_nuevo` int(11) DEFAULT NULL,
  `fecha_cambio` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_estado`
--

INSERT INTO `historial_estado` (`id_historial`, `id_pedido`, `id_usuario`, `id_estado_anterior`, `id_estado_nuevo`, `fecha_cambio`) VALUES
(1, 14, 10, 1, 4, '2026-05-21 08:10:17'),
(2, 29, 11, NULL, 1, '2026-05-21 14:56:06'),
(3, 29, 10, 1, 2, '2026-05-21 14:58:09'),
(4, 30, 11, NULL, 1, '2026-05-25 07:22:00'),
(5, 31, 11, NULL, 1, '2026-05-25 15:40:35'),
(6, 31, 10, 1, 2, '2026-05-25 15:41:20'),
(7, 31, 10, 2, 3, '2026-05-25 15:41:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id_pedido` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_usuario` bigint(20) UNSIGNED NOT NULL,
  `id_estado` int(11) NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `prioridad` varchar(50) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_entrega_estimada` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido`
--

INSERT INTO `pedido` (`id_pedido`, `id_cliente`, `id_usuario`, `id_estado`, `fecha_creacion`, `prioridad`, `observaciones`, `fecha_entrega_estimada`) VALUES
(10, 1, 10, 4, '2026-04-16 23:49:49', NULL, NULL, NULL),
(11, 1, 10, 4, '2026-04-16 23:54:25', NULL, NULL, NULL),
(12, 1, 10, 4, '2026-04-17 07:46:41', NULL, NULL, NULL),
(13, 1, 10, 1, '2026-04-17 08:02:01', NULL, NULL, NULL),
(14, 1, 10, 4, '2026-04-17 08:03:23', NULL, NULL, NULL),
(15, 1, 10, 1, '2026-04-17 08:48:09', NULL, NULL, NULL),
(16, 1, 10, 1, '2026-04-17 08:50:10', NULL, NULL, NULL),
(17, 1, 10, 1, '2026-04-17 09:15:29', NULL, NULL, NULL),
(18, 1, 10, 4, '2026-04-17 09:31:58', NULL, NULL, NULL),
(19, 1, 10, 1, '2026-04-17 09:50:27', NULL, NULL, NULL),
(20, 1, 10, 4, '2026-04-17 09:50:35', NULL, NULL, NULL),
(21, 1, 10, 4, '2026-04-17 09:53:02', NULL, NULL, NULL),
(22, 1, 10, 4, '2026-04-17 10:32:46', NULL, NULL, NULL),
(23, 1, 10, 4, '2026-04-17 10:42:21', NULL, NULL, NULL),
(24, 1, 10, 4, '2026-04-17 11:20:25', NULL, NULL, NULL),
(25, 1, 10, 4, '2026-05-20 08:01:43', NULL, NULL, NULL),
(26, 1, 10, 4, '2026-05-20 08:33:31', NULL, NULL, NULL),
(27, 1, 10, 4, '2026-05-20 08:41:32', NULL, NULL, NULL),
(28, 1, 10, 3, '2026-05-20 08:59:03', NULL, NULL, NULL),
(29, 2, 11, 2, '2026-05-21 14:56:06', NULL, NULL, NULL),
(30, 2, 11, 1, '2026-05-25 07:22:00', NULL, NULL, NULL),
(31, 2, 11, 3, '2026-05-25 15:40:35', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `repuesto`
--

CREATE TABLE `repuesto` (
  `id_repuesto` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `modelo_compatible` varchar(100) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `precio` decimal(12,2) DEFAULT 0.00,
  `imagen_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `repuesto`
--

INSERT INTO `repuesto` (`id_repuesto`, `nombre`, `descripcion`, `categoria`, `marca`, `modelo_compatible`, `stock`, `precio`, `imagen_url`) VALUES
(4, 'Filtro de aceite Nissan', 'Para motores 1.6 y 2.0', NULL, NULL, NULL, 2, 0.00, NULL),
(5, 'Pastillas de freno', 'Alta duración', NULL, NULL, NULL, 9, 0.00, NULL),
(6, 'Bujías Nissan', 'Originales', NULL, NULL, NULL, 8, 0.00, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(160) NOT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `intentos_fallidos` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `bloqueado_hasta` datetime DEFAULT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `rol` enum('CLIENTE','OPERADOR','ADMINISTRADOR') NOT NULL DEFAULT 'CLIENTE',
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `nombre`, `correo`, `celular`, `intentos_fallidos`, `bloqueado_hasta`, `contrasena_hash`, `rol`, `estado`, `creado_en`, `actualizado_en`) VALUES
(10, 'Dan', 'admin@nissan.com', NULL, 0, NULL, '$2b$10$OvWz3bNm1WXp3vCi8UHC7OT/6.IB1FR3TaUYqHAZ7BdsP/vHvG5eO', 'ADMINISTRADOR', 'ACTIVO', '2026-04-16 23:46:35', NULL),
(11, 'joe', 'tres@fnbjhaf.com', NULL, 0, NULL, '$2b$10$MybyrVFeTQSmD2VQg5Y/7eN4CwlKwf3j1urTIH2ASd1neKg6dO0Em', 'CLIENTE', 'ACTIVO', '2026-05-21 13:56:28', NULL),
(12, 'Juan Perez', 'dan12@jfdshn.com', NULL, 0, NULL, '$2b$10$15llfHd/kRk9/nY.fwhE4OAo/7V3M8EYNYGUwgN.Ff2OYSpVMSHv6', 'OPERADOR', 'ACTIVO', '2026-05-25 15:43:50', NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD PRIMARY KEY (`id_auditoria`),
  ADD KEY `idx_auditoria_usuario` (`id_usuario`),
  ADD KEY `idx_auditoria_fecha` (`fecha`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `documento` (`documento`),
  ADD KEY `fk_cliente_usuario` (`id_usuario`);

--
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`id_detalle`),
  ADD UNIQUE KEY `uq_pedido_repuesto` (`id_pedido`,`id_repuesto`),
  ADD KEY `idx_detalle_repuesto` (`id_repuesto`);

--
-- Indices de la tabla `estado_pedido`
--
ALTER TABLE `estado_pedido`
  ADD PRIMARY KEY (`id_estado`),
  ADD UNIQUE KEY `nombre_estado` (`nombre_estado`);

--
-- Indices de la tabla `historial_estado`
--
ALTER TABLE `historial_estado`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_estado_anterior` (`id_estado_anterior`),
  ADD KEY `id_estado_nuevo` (`id_estado_nuevo`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `idx_pedido_fecha` (`fecha_creacion`),
  ADD KEY `idx_pedido_estado` (`id_estado`),
  ADD KEY `idx_pedido_cliente` (`id_cliente`);

--
-- Indices de la tabla `repuesto`
--
ALTER TABLE `repuesto`
  ADD PRIMARY KEY (`id_repuesto`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  MODIFY `id_auditoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT de la tabla `estado_pedido`
--
ALTER TABLE `estado_pedido`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `historial_estado`
--
ALTER TABLE `historial_estado`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `repuesto`
--
ALTER TABLE `repuesto`
  MODIFY `id_repuesto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`);

--
-- Filtros para la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `fk_cliente_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`);

--
-- Filtros para la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `detalle_pedido_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_pedido_ibfk_2` FOREIGN KEY (`id_repuesto`) REFERENCES `repuesto` (`id_repuesto`);

--
-- Filtros para la tabla `historial_estado`
--
ALTER TABLE `historial_estado`
  ADD CONSTRAINT `historial_estado_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE CASCADE,
  ADD CONSTRAINT `historial_estado_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`),
  ADD CONSTRAINT `historial_estado_ibfk_3` FOREIGN KEY (`id_estado_anterior`) REFERENCES `estado_pedido` (`id_estado`),
  ADD CONSTRAINT `historial_estado_ibfk_4` FOREIGN KEY (`id_estado_nuevo`) REFERENCES `estado_pedido` (`id_estado`);

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  ADD CONSTRAINT `pedido_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`),
  ADD CONSTRAINT `pedido_ibfk_3` FOREIGN KEY (`id_estado`) REFERENCES `estado_pedido` (`id_estado`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
