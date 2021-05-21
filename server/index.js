const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const mysql = require("mysql2/promise");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const sha512 = require("js-sha512").sha512;
const path = require("path");

const pool = mysql.createPool({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "12345678",
  database: "main",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "login",
    },
    function (login, password, done) {
      pool
        .query(
          'SELECT `user_id` AS "userId", first_name AS "firstName", surname, login, password_hash AS "passwordHash", EXISTS(SELECT * FROM `admin` WHERE `admin`.user_id = `user`.user_id) AS "isAdmin" FROM `user` WHERE login = ?',
          [login]
        )
        .then((result) => result[0])
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
  pool
    .query(
      'SELECT user_id AS "userId", first_name AS "firstName", surname, login, password_hash AS "passportHash", EXISTS(SELECT * FROM `admin` WHERE `admin`.user_id = `user`.user_id) AS "isAdmin" FROM `user` WHERE user_id = ?',
      [id]
    )
    .then((result) => result[0])
    .then((rows) => rows[0] || done(null, false))
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
app.use(session({ secret: "overwatch" }));
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

  const result = (
    await pool.query(
      "INSERT INTO user (login, password_hash, first_name, surname) VALUES (?, ?, ?, ?)",
      [user.login, user.passwordHash, user.firstName, user.surname]
    )
  )[0];

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
    console.log(req.user);
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

app.get("/api/filters", async (req, res) => {
  const filters = {
    min: null,
    max: null,
    isAscending: true,
    categories: [],
    providers: [],
  };

  let row = (
    await pool.query(
      'SELECT MAX(price) AS "max", MIN(price) AS "min" FROM product'
    )
  )[0][0];

  filters.min = row.min;
  filters.max = row.max;

  let categoriesRows = (
    await pool.query(
      'SELECT category_id AS "categoryId", name AS "categoryName" FROM category'
    )
  )[0];

  for (let key in categoriesRows) filters.categories.push(categoriesRows[key]);

  let providersRows = (
    await pool.query('SELECT DISTINCT provider_name AS "provider" FROM product')
  )[0];

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

app.get("*", async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

app.listen(4000, () => {
  console.log(`Example app listening at http://localhost:4000`);
});
