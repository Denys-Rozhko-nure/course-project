-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema main
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema main
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `main` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ;
USE `main` ;

-- -----------------------------------------------------
-- Table `main`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `main`.`user` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `login` VARCHAR(100) NOT NULL,
  `password_hash` CHAR(128) NOT NULL,
  `first_name` VARCHAR(45) NOT NULL,
  `surname` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `login_UNIQUE` (`login` ASC) VISIBLE,
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `main`.`admin`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `main`.`admin` (
  `user_id` INT NOT NULL,
  INDEX `fk_admin_user_idx` (`user_id` ASC) VISIBLE,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_admin_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `main`.`user` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `main`.`order`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `main`.`order` (
  `order_id` INT NOT NULL AUTO_INCREMENT,
  `oblast` VARCHAR(45) NOT NULL,
  `locality` VARCHAR(45) NOT NULL,
  `status` INT NOT NULL,
  `department_number` INT NOT NULL,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`order_id`),
  UNIQUE INDEX `order_id_UNIQUE` (`order_id` ASC) VISIBLE,
  INDEX `fk_order_user1_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_order_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `main`.`user` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `main`.`category`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `main`.`category` (
  `category_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE INDEX `category_id_UNIQUE` (`category_id` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `main`.`product`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `main`.`product` (
  `product_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(70) NOT NULL,
  `price` INT NOT NULL,
  `description` TEXT NOT NULL,
  `available_number` INT NOT NULL,
  `provider_name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`product_id`),
  UNIQUE INDEX `product_id_UNIQUE` (`product_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `main`.`product_in_basket`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `main`.`product_in_basket` (
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `number_of_product` INT NOT NULL,
  PRIMARY KEY (`user_id`, `product_id`),
  INDEX `fk_user_has_product_product1_idx` (`product_id` ASC) VISIBLE,
  INDEX `fk_user_has_product_user1_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_user_has_product_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `main`.`user` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_has_product_product1`
    FOREIGN KEY (`product_id`)
    REFERENCES `main`.`product` (`product_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `main`.`category_has_product`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `main`.`category_has_product` (
  `category_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  PRIMARY KEY (`category_id`, `product_id`),
  INDEX `fk_category_has_product_product1_idx` (`product_id` ASC) VISIBLE,
  INDEX `fk_category_has_product_category1_idx` (`category_id` ASC) VISIBLE,
  CONSTRAINT `fk_category_has_product_category1`
    FOREIGN KEY (`category_id`)
    REFERENCES `main`.`category` (`category_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_category_has_product_product1`
    FOREIGN KEY (`product_id`)
    REFERENCES `main`.`product` (`product_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `main`.`order_has_product`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `main`.`order_has_product` (
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `number_of_products` INT NOT NULL,
  PRIMARY KEY (`order_id`, `product_id`),
  INDEX `fk_order_has_product_product1_idx` (`product_id` ASC) VISIBLE,
  CONSTRAINT `fk_order_has_product_order1`
    FOREIGN KEY (`order_id`)
    REFERENCES `main`.`order` (`order_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_order_has_product_product1`
    FOREIGN KEY (`product_id`)
    REFERENCES `main`.`product` (`product_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
