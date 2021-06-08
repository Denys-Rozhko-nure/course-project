class MySqlDAO {
  constructor(pool) {
    this.pool = pool;
  }

  async getUserByLogin(login) {
    return (
      await this.pool.query(
        'SELECT `user_id` AS "userId", first_name AS "firstName", surname, login, password_hash AS "passwordHash", EXISTS(SELECT * FROM `admin` WHERE `admin`.user_id = `user`.user_id) AS "isAdmin" FROM `user` WHERE login = ?',
        [login]
      )
    )[0];
  }

  async deserializeUserById(id) {
    return (
      await this.pool.query(
        'SELECT user_id AS "userId", first_name AS "firstName", surname, login, password_hash AS "passportHash", EXISTS(SELECT * FROM admin WHERE admin.user_id = user.user_id) AS "isAdmin" FROM user WHERE user_id = ?',
        [id]
      )
    )[0];
  }

  async insertUser(login, passwordHash, firstName, surname) {
    return (
      await this.pool.query(
        "INSERT INTO user (login, password_hash, first_name, surname) VALUES (?, ?, ?, ?)",
        [login, passwordHash, firstName, surname]
      )
    )[0];
  }

  async insertProductInBasket(userId, productId, number) {
    return (
      await this.pool.query(
        "INSERT INTO product_in_basket (user_id, product_id, number_of_product) VALUES (?,?,?)",
        [userId, productId, number]
      )
    )[0];
  }

  async getProductsInBasket(userId) {
    return (
      await this.pool.query(
        `SELECT 
          product_id AS "productId",
          name,
          price,
          description,
          number_of_product AS "number"
      FROM product NATURAL JOIN product_in_basket 
      WHERE user_id = ?`,
        [userId]
      )
    )[0];
  }

  async deleteProductInBasket(userId, productId) {
    return (
      await this.pool.query(
        "DELETE FROM product_in_basket WHERE user_id = ? AND product_id = ?",
        [userId, productId]
      )
    )[0];
  }

  async updateProductInBasket(number, userId, productId) {
    return (
      await this.pool.query(
        "UPDATE product_in_basket SET number_of_product = ? WHERE user_id = ? AND product_id = ?",
        [number, userId, productId]
      )
    )[0];
  }

  async getMaxMinPrice() {
    return (
      await this.pool.query(
        'SELECT MAX(price) AS "max", MIN(price) AS "min" FROM product'
      )
    )[0];
  }

  async getCategories() {
    return (
      await this.pool.query(
        'SELECT category_id AS "categoryId", name AS "categoryName" FROM category'
      )
    )[0];
  }

  async getProviders() {
    return (
      await this.pool.query(
        'SELECT DISTINCT provider_name AS "provider" FROM product'
      )
    )[0];
  }

  async getOrdersByUserId(userId) {
    return (
      await this.pool.query(
        `
      SELECT
        order_id AS "orderId",
        oblast,
        locality,
        department_number AS "departmentNumber",
        status,
        product_id AS "productId",
        name AS "productName",
        price,
        description,
        number_of_products AS "number"
      FROM \`order\` 
        NATURAL JOIN order_has_product 
        NATURAL JOIN product 
      WHERE user_id = ?
      ORDER BY order_id DESC`,
        [userId]
      )
    )[0];
  }

  async getAllOrders() {
    return (
      await this.pool.query(
        `
      SELECT
        CONCAT(first_name, " ", surname) AS userFullName,
        order_id AS "orderId",
        oblast,
        locality,
        department_number AS "departmentNumber",
        status,
        product_id AS "productId",
        name AS "productName",
        price,
        description,
        number_of_products AS "number"
      FROM \`order\` 
        NATURAL JOIN order_has_product 
        NATURAL JOIN product 
        NATURAL JOIN user
      ORDER BY order_id DESC`
      )
    )[0];
  }

  async updateOrderStatus(status, orderId) {
    await this.pool.query("UPDATE `order` SET status = ? WHERE order_id = ?", [
      status,
      orderId,
    ]);
  }

  async getOrdersByProvider(provider) {
    return (
      await this.pool.query(
        `
      SELECT
        CONCAT(first_name, " ", surname) AS userFullName,
        order_id AS "orderId",
        status,
        product_id AS "productId",
        name AS "productName",
        price,
        description,
        number_of_products AS "number"
      FROM \`order\` 
        NATURAL JOIN order_has_product 
        NATURAL JOIN product 
        NATURAL JOIN user
      WHERE provider_name = ?
      ORDER BY order_id DESC`,
        [provider]
      )
    )[0];
  }
}

module.exports = MySqlDAO;
