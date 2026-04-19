-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-04-2026 a las 05:26:06
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
(1, 'Dan', NULL, NULL, NULL, NULL, 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `id_detalle` int(11) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `id_repuesto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`id_detalle`, `id_pedido`, `id_repuesto`, `cantidad`, `observaciones`) VALUES
(1, 10, 4, 1, NULL),
(2, 10, 4, 1, NULL),
(3, 11, 4, 1, NULL),
(4, 11, 4, 1, NULL),
(5, 12, 4, 1, NULL),
(6, 12, 4, 1, NULL),
(7, 12, 4, 1, NULL),
(8, 13, 4, 1, NULL),
(9, 13, 4, 1, NULL),
(10, 13, 4, 1, NULL),
(11, 13, 4, 1, NULL),
(12, 13, 4, 1, NULL),
(13, 13, 5, 1, NULL),
(14, 13, 5, 1, NULL),
(15, 14, 5, 1, NULL),
(16, 15, 4, 1, NULL),
(17, 15, 4, 1, NULL),
(18, 15, 4, 1, NULL),
(19, 16, 5, 1, NULL),
(20, 16, 5, 1, NULL),
(21, 16, 5, 1, NULL),
(22, 17, 4, 1, NULL),
(23, 17, 4, 1, NULL),
(24, 18, 4, 1, NULL),
(25, 18, 4, 1, NULL),
(26, 19, 5, 1, NULL),
(27, 19, 5, 1, NULL),
(28, 20, 6, 1, NULL),
(29, 20, 6, 1, NULL),
(30, 21, 5, 1, NULL),
(31, 21, 5, 1, NULL),
(32, 21, 5, 1, NULL),
(33, 22, 5, 1, NULL),
(34, 22, 5, 1, NULL),
(35, 23, 4, 1, NULL),
(36, 23, 4, 1, NULL),
(37, 23, 4, 1, NULL),
(38, 23, 4, 1, NULL),
(39, 23, 4, 1, NULL),
(40, 23, 4, 1, NULL),
(41, 23, 4, 1, NULL),
(42, 23, 4, 1, NULL),
(43, 23, 4, 1, NULL);

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
(14, 1, 10, 1, '2026-04-17 08:03:23', NULL, NULL, NULL),
(15, 1, 10, 1, '2026-04-17 08:48:09', NULL, NULL, NULL),
(16, 1, 10, 1, '2026-04-17 08:50:10', NULL, NULL, NULL),
(17, 1, 10, 1, '2026-04-17 09:15:29', NULL, NULL, NULL),
(18, 1, 10, 4, '2026-04-17 09:31:58', NULL, NULL, NULL),
(19, 1, 10, 1, '2026-04-17 09:50:27', NULL, NULL, NULL),
(20, 1, 10, 4, '2026-04-17 09:50:35', NULL, NULL, NULL),
(21, 1, 10, 4, '2026-04-17 09:53:02', NULL, NULL, NULL),
(22, 1, 10, 4, '2026-04-17 10:32:46', NULL, NULL, NULL),
(23, 1, 10, 4, '2026-04-17 10:42:21', NULL, NULL, NULL),
(24, 1, 10, 4, '2026-04-17 11:20:25', NULL, NULL, NULL);

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
  `stock` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `repuesto`
--

INSERT INTO `repuesto` (`id_repuesto`, `nombre`, `descripcion`, `categoria`, `marca`, `modelo_compatible`, `stock`) VALUES
(4, 'Filtro de aceite Nissan', 'Para motores 1.6 y 2.0', NULL, NULL, NULL, 9),
(5, 'Pastillas de freno', 'Alta duración', NULL, NULL, NULL, 13),
(6, 'Bujías Nissan', 'Originales', NULL, NULL, NULL, 13);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(160) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `rol` varchar(50) NOT NULL DEFAULT 'OPERADOR',
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `nombre`, `correo`, `contrasena_hash`, `rol`, `estado`, `creado_en`, `actualizado_en`) VALUES
(10, 'Dan', 'admin@nissan.com', '$2b$10$OvWz3bNm1WXp3vCi8UHC7OT/6.IB1FR3TaUYqHAZ7BdsP/vHvG5eO', 'OPERADOR', 'ACTIVO', '2026-04-16 23:46:35', NULL);

--
-- Índices para tablas volcadas
--

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
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_repuesto` (`id_repuesto`);

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
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_estado` (`id_estado`);

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
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT de la tabla `estado_pedido`
--
ALTER TABLE `estado_pedido`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `historial_estado`
--
ALTER TABLE `historial_estado`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `repuesto`
--
ALTER TABLE `repuesto`
  MODIFY `id_repuesto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Restricciones para tablas volcadas
--

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
