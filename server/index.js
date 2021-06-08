const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const mysql = require("mysql2/promise");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const sha512 = require("js-sha512").sha512;
const path = require("path");

const dbConfig = require("./db-config");
const pool = mysql.createPool(dbConfig);

const MySqlDAO = require("./MySQL_DAO");
const mysqlDAO = new MySqlDAO(pool);

passport.use(
  new LocalStrategy(
    {
      usernameField: "login",
    },
    function (login, password, done) {
      mysqlDAO
        .getUserByLogin(login)
        .then(
          (rows) =>
            rows[0] || done(null, false, { message: "Користувач не знайдений" })
        )
        .then((user) => {
          if (user.passwordHash === sha512(password)) {
            done(null, user);
          } else {
            done(null, false, { message: "Неправильний пароль" });
          }
        })
        .catch((err) => done(err));
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.userId);
});

passport.deserializeUser(function (id, done) {
  mysqlDAO
    .deserializeUserById(id)
    .then((rows) => rows[0] || done(null, false))
    .then((user) => done(null, user))
    .catch((err) => done(err));
});

const app = express();

const allowCors = (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
};

app.use(allowCors);
app.use(express.static(path.join(__dirname, "..", "dist")));
app.use(cookieParser());
app.use(
  session({
    secret: "overwatch",
    cookie: {
      secure: false,
      resave: false,
      saveUninitialized: false,
    },
  })
);
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.post("/api/user", async (req, res) => {
  const userData = req.body;

  const user = {
    firstName: userData.firstName,
    surname: userData.surname,
    login: userData.login,
    passwordHash: sha512(userData.password),
  };

  const result = await mysqlDAO.insertUser(
    user.login,
    user.passwordHash,
    user.firstName,
    user.surname
  );

  req.logIn(
    {
      userId: result.insertId,
      ...user,
    },
    function () {
      res.status(200).json({
        firstName: user.firstName,
        surname: user.surname,
        isAdmin: false,
      });
    }
  );
});

app.post("/api/login", passport.authenticate("local"), function (req, res) {
  if (req.isAuthenticated()) {
    res.status(200).json({
      isAdmin: req.user.isAdmin,
      firstName: req.user.firstName,
      surname: req.user.surname,
    });
  } else {
    res.status(403).json({
      message: req.message,
    });
  }
});

app.post("/api/product_in_basket", async (req, res) => {
  if (!req.user) {
    res.status(403).send("");
    return;
  }

  await mysqlDAO.insertProductInBasket(
    req.user.userId,
    req.body.productId,
    req.body.n
  );

  res.status(200).send("");
});

app.get("/api/product_in_basket", async (req, res) => {
  if (!req.user) {
    res.status(403).send("");
    return;
  }

  let rows = await mysqlDAO.getProductsInBasket(req.user.userId);

  res.status(200).json(rows);
});

app.patch("/api/product_in_basket", async (req, res) => {
  if (!req.user) {
    res.status(403).send("");
    return;
  }

  if (req.body.n == 0) {
    await mysqlDAO.deleteProductInBasket(req.user.userId, req.body.productId);
  } else {
    await mysqlDAO.updateProductInBasket(
      req.body.n,
      req.user.userId,
      req.body.productId
    );
  }

  res.status(200).send("");
});

app.get("/api/filters", async (req, res) => {
  const filters = {
    min: null,
    max: null,
    isAscending: true,
    categories: [],
    providers: [],
  };

  let row = (await mysqlDAO.getMaxMinPrice())[0];

  filters.min = row.min;
  filters.max = row.max;

  let categoriesRows = await mysqlDAO.getCategories();

  for (let key in categoriesRows) filters.categories.push(categoriesRows[key]);

  let providersRows = await mysqlDAO.getProviders();

  for (let key in providersRows)
    filters.providers.push(providersRows[key].provider);

  res.json(filters);
});

app.get("/api/products", (req, res) => {
  const orderString = req.query.desc === "true" ? "DESC" : "";

  let whereString = "";

  if (req.query.min) {
    let minInInt = Math.floor(Number.parseFloat(req.query.min) * 100);
    whereString += `price >= ${minInInt} AND `;
  }

  if (req.query.max) {
    let maxInInt = Math.floor(Number.parseFloat(req.query.max) * 100);
    whereString += `price <= ${maxInInt} AND `;
  }

  if (req.query.providers) {
    const providers = req.query.providers
      .replace(/"/g, "")
      .split(",")
      .map((el) => `"${el}"`);
    whereString += `provider_name IN (${providers}) AND `;
  }

  if (req.query.categories) {
    const categories = req.query.categories
      .split(",")
      .map((el) => Number.parseInt(el))
      .join(",");
    whereString += `category_id IN (${categories}) AND `;
  }

  if (whereString.endsWith(" AND ")) {
    whereString = whereString.slice(0, whereString.length - 4);
    whereString = "WHERE " + whereString;
  }

  pool
    .query(
      `SELECT DISTINCT
      product_id AS "productId",
      product.name AS "productName", 
      price, 
      description, 
      available_number AS "availableNumber", 
      provider_name AS "providerName"  
    FROM category 
      INNER JOIN category_has_product USING(category_id)
      INNER JOIN product USING(product_id)
    ${whereString}
    ORDER BY price ${orderString}`
    )
    .then((result) => result[0])
    .then((rows) => res.status(200).json(rows))
    .catch(res.status(500));
});

app.post("/api/order", async (req, res) => {
  if (!req.user) {
    res.status(403).send("");
    return;
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();
  const basketRows = (
    await connection.query(
      `SELECT 
        product_id AS "productId", 
        number_of_product AS "number", 
        available_number AS "availableNumber"
      FROM product NATURAL JOIN product_in_basket
      WHERE user_id = ?
      FOR UPDATE`,
      [req.user.userId]
    )
  )[0];

  if (Object.keys(basketRows).length === 0) {
    await connection.commit();
    res.status(409).json({
      message: "Не можно оформити замовлення при пустому кошику",
    });
    return;
  }

  const absentProducts = [];
  for (let key in basketRows) {
    const productInBasket = basketRows[key];
    if (productInBasket.availableNumber < productInBasket.number)
      absentProducts.push(productInBasket.productId);

    if (absentProducts.length > 0) {
      connection.commit();
      res.status(409).json({
        message:
          "Деякі товари Вашого кошику відсутні на складі у необхідній кількості",
        absentProducts,
      });
      return;
    }
  }

  const result = (
    await connection.query(
      `
    INSERT INTO \`order\` 
      (oblast, locality, department_number, status, user_id)
    VALUES
      (?,?,?,?,?)`,
      [
        req.body.oblast,
        req.body.locality,
        req.body.departmentNumber,
        0,
        req.user.userId,
      ]
    )
  )[0];

  const orderId = result.insertId;

  for (let key in basketRows) {
    const productInBasket = basketRows[key];
    await connection.query(
      `
      INSERT INTO order_has_product 
        (order_id, product_id, number_of_products)
      VALUES
        (?,?,?)`,
      [orderId, productInBasket.productId, productInBasket.number]
    );

    await connection.query(
      `
      UPDATE product product 
        SET available_number = ?
      WHERE product_id = ?`,
      [
        productInBasket.availableNumber - productInBasket.number,
        productInBasket.productId,
      ]
    );
  }

  await connection.query(
    `DELETE
    FROM product_in_basket
    WHERE user_id = ?`,
    [req.user.userId]
  );

  await connection.commit();

  res.status(200).send("");
});

app.get("/api/order", async (req, res) => {
  if (!req.user) res.status(403).end();
  const rows = await mysqlDAO.getOrdersByUserId(req.user.userId);
  const orders = [];

  for (let key in rows) {
    const row = rows[key];
    const product = {
      productId: row.productId,
      productName: row.productName,
      price: row.price,
      number: row.number,
      description: row.description,
    };
    if (
      orders[orders.length - 1] &&
      orders[orders.length - 1].orderId === row.orderId
    ) {
      orders[orders.length - 1].products.push(product);
    } else {
      orders.push({
        orderId: row.orderId,
        oblast: row.oblast,
        locality: row.locality,
        departmentNumber: row.departmentNumber,
        status: row.status,
        products: [product],
      });
    }
  }
  res.status(200).json(orders);
});

app.get("/api/isAdmin", (req, res) => {
  if (req.user) {
    res.json({
      isAdmin: req.user.isAdmin,
    });
  } else {
    res.status(403).end();
  }
});

app.get("/api/order/all", async (req, res) => {
  if (!req.user || !req.user.isAdmin) {
    res.status(403).end();
    return;
  }

  const rows = await mysqlDAO.getAllOrders();
  const orders = [];

  for (let key in rows) {
    const row = rows[key];
    const product = {
      productId: row.productId,
      productName: row.productName,
      price: row.price,
      number: row.number,
      description: row.description,
    };
    if (
      orders[orders.length - 1] &&
      orders[orders.length - 1].orderId === row.orderId
    ) {
      orders[orders.length - 1].products.push(product);
    } else {
      orders.push({
        userFullName: row.userFullName,
        orderId: row.orderId,
        oblast: row.oblast,
        locality: row.locality,
        departmentNumber: row.departmentNumber,
        status: row.status,
        products: [product],
      });
    }
  }

  res.json(orders);
});

app.patch("/api/order", async (req, res) => {
  if (!req.user || !req.user.isAdmin) {
    res.status(403).end();
    return;
  }

  await mysqlDAO.updateOrderStatus(req.body.status, req.body.orderId);

  res.status(200).end();
});

app.get("/api/order/by_provider", async (req, res) => {
  if (!req.user || !req.user.isAdmin) res.status(403).end();

  const rows = await mysqlDAO.getOrdersByProvider(req.query.provider);
  const orders = [];

  for (let key in rows) {
    const row = rows[key];
    const product = {
      productId: row.productId,
      productName: row.productName,
      price: row.price,
      number: row.number,
      description: row.description,
    };
    if (
      orders[orders.length - 1] &&
      orders[orders.length - 1].orderId === row.orderId
    ) {
      orders[orders.length - 1].products.push(product);
    } else {
      orders.push({
        userFullName: row.userFullName,
        orderId: row.orderId,
        status: row.status,
        products: [product],
      });
    }
  }

  res.json(orders);
});

app.get("*", async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

app.listen(4000, () => {
  console.log(`Example app listening at http://localhost:4000`);
});
