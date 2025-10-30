
import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MySQL (adjust values to match your DB setup)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",        // your MySQL username
  password: "password",// your MySQL password
  database: "mydb"     // your database name
});

// ✅ Login API
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) return res.status(500).jsonS({ error: "Server error" });
      if (results.length > 0) {
        res.json({ success: true, message: "Login successful" });
      } else {
        res.json({ success: false, message: "Invalid credentials" });
      }
    }
  );
});

// ✅ Run server
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
