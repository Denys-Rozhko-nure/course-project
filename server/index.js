const express = require("express");
const mysql = require("mysql2/promise");
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

const app = express();

const allowCors = (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8081");
  next();
};

app.use(allowCors);
// app.use(history({ index: "/" }));
app.use(express.static(path.join(__dirname, "..", "dist")));
app.use(express.json());

app.post("/api/user", async (req, res) => {
  const userData = req.body;

  const user = {
    firstName: userData.firstName,
    surname: userData.surname,
    login: userData.login,
    passwordHash: sha512(userData.password),
  };

  await pool.query(
    "INSERT INTO user (login, password_hash, first_name, surname) VALUES (?, ?, ?, ?)",
    [user.login, user.passwordHash, user.firstName, user.surname]
  );

  res.status(200).json({
    firstName: user.firstName,
    surname: user.surname,
    isAdmin: false,
  });
});

app.get("*", async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

app.listen(4000, () => {
  console.log(`Example app listening at http://localhost:4000`);
});
