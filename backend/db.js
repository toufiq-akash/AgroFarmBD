const mysql = require("mysql");

// ✅ Create MySQL connection
const db = mysql.createConnection({
  host: "localhost",   // Database host
  user: "root",        // Your MySQL username
  password: "20032003",        // Your MySQL password (if any)
  database: "farmdb",  // Database name
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
  } else {
    console.log("✅ MySQL Connected Successfully!");
  }
});

module.exports = db;
