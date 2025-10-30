const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Default route
app.get("/", (req, res) => {
  res.send("Backend Server is Running ✅");
});

// ✅ Signup route
app.post("/signup", async (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    // ✅ Check if email already exists
    const checkQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkQuery, [email], async (err, result) => {
      if (err) {
        console.error("Error checking user:", err);
        return res.status(500).json({ message: "Database error." });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: "Email already exists!" });
      }

      // ✅ Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ Insert new user
      const insertQuery =
        "INSERT INTO users (fullName, email, password, role) VALUES (?, ?, ?, ?)";
      db.query(
        insertQuery,
        [fullName, email, hashedPassword, role],
        (err, result) => {
          if (err) {
            console.error("Error inserting user:", err);
            return res.status(500).json({ message: "Signup failed." });
          }

          res.json({ message: "User registered successfully ✅" });
        }
      );
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ✅ Start the backend server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
