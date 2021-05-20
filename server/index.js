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

// pool
//   .query(
//     'SELECT first_name AS "firstName", surname, login, password_hash AS "passportHash", EXISTS(SELECT * FROM `admin` WHERE `admin`.user_id = `user`.user_id) AS "isAdmin" FROM `user` WHERE login = ?',
//     ["dsfsdf"]
//   )
//   .then((row) => console.log(Object.keys(row[0][0])));

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

app.get("*", async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

app.listen(4000, () => {
  console.log(`Example app listening at http://localhost:4000`);
});
