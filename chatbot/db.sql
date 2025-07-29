CREATE TABLE `registro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_hora` datetime DEFAULT current_timestamp(),
  `mensaje_recibido` varchar(1000) DEFAULT '',
  `mensaje_enviado` varchar(1000) DEFAULT '',
  `id_wa` varchar(1000) DEFAULT '',
  `timestamp_wa` bigint DEFAULT NULL,
  `telefono_wa` varchar(50) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
