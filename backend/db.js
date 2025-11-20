// db.js
import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",    // phpMyAdmin host
  user: "root",         // your DB username
  password: "",         // your DB password
  database: "signup"    // your DB name
});

export default db;
