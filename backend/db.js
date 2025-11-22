// db.js
import mysql from "mysql2";

const db = mysql.createConnection({
  host: "8.219.197.217",    // phpMyAdmin host
  user: "db_user",         // your DB username
  password: "winter@2025",         // your DB password
  database: "signup",
  port: 3307    // your DB name
});

export default db;
