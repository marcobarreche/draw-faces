CREATE TABLE IF NOT EXISTS `faces` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `url` CHAR(100) NOT NULL,
    `positions` TEXT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY (`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
