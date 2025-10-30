import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
app.use(cors());
app.use(express.json());

// ========================
// ✅ Static folder for images
// ========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========================
// ✅ Multer setup
// ========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ========================
// ✅ MySQL Connection
// ========================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "signup",
});

db.connect((err) => {
  if (err) console.error("❌ Database connection failed:", err);
  else console.log("✅ Connected to MySQL database!");
});

// ========================
// ✅ User Routes
// ========================

// Signup
app.post("/signup", async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password || !role)
    return res.status(400).json({ message: "All fields are required." });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error." });
    if (results.length > 0) return res.status(400).json({ message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (fullname, email, password, role, status) VALUES (?, ?, ?, ?, 'active')",
      [fullName, email, hashedPassword, role],
      (err) => {
        if (err) return res.status(500).json({ message: "Server error." });
        res.status(201).json({ message: "Signup successful!" });
      }
    );
  });
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error." });
    if (results.length === 0) return res.status(401).json({ message: "Invalid credentials." });

    const user = results[0];
    if (user.status === "restricted")
      return res.status(403).json({ message: "Your account is restricted." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      res.status(200).json({
        message: "Login successful!",
        user: {
          id: user.id,
          fullName: user.fullname,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid credentials." });
    }
  });
});

// GET single user by id (for profile)
app.get("/users/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.query("SELECT id, fullname, email, role, status FROM users WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  });
});

// Update Profile
app.put("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { fullName, email, oldPassword, newPassword } = req.body;

  db.query("SELECT * FROM users WHERE id = ?", [id], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });

    const user = results[0];
    const updates = [];
    const values = [];

    if (fullName && fullName.trim() !== "") {
      updates.push("fullname = ?");
      values.push(fullName);
    }
    if (email && email.trim() !== "") {
      updates.push("email = ?");
      values.push(email);
    }
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });
      const hashedNew = await bcrypt.hash(newPassword, 10);
      updates.push("password = ?");
      values.push(hashedNew);
    }

    if (updates.length === 0) return res.json({ message: "Nothing to update" });

    values.push(id);
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    db.query(query, values, (err2) => {
      if (err2) return res.status(500).json({ message: "Update failed" });

      db.query("SELECT id, fullname, email, role, status FROM users WHERE id = ?", [id], (err3, result) => {
        if (err3) return res.status(500).json({ message: "Fetch after update failed" });
        res.json({ message: "Profile updated successfully", user: result[0] });
      });
    });
  });
});

// ========================
// ✅ Admin Routes
// ========================

// Dashboard stats
app.get("/admin/stats", (req, res) => {
  const stats = {};
  db.query("SELECT COUNT(*) AS count FROM users", (err, result1) => {
    if (err) return res.status(500).json({ message: "Database error" });
    stats.userCount = result1[0].count;

    db.query("SELECT COUNT(*) AS count FROM products", (err, result2) => {
      stats.productCount = err ? 0 : result2[0].count;

      db.query("SELECT COUNT(*) AS count FROM orders", (err, result3) => {
        stats.orderCount = err ? 0 : result3[0].count;
        return res.json(stats);
      });
    });
  });
});

// Manage Users
app.get("/admin/users", (req, res) => {
  db.query("SELECT id, fullname, email, role, status FROM users", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

app.delete("/admin/users/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM users WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Delete failed" });
    res.json({ message: "User deleted successfully" });
  });
});

app.put("/admin/users/restrict/:id", (req, res) => {
  const id = req.params.id;
  const { action } = req.body;

  let status = "";
  switch (action) {
    case "block":
      status = "restricted";
      break;
    case "unblock":
      status = "active";
      break;
    case "block_buying":
      status = "blocked_buying";
      break;
    case "block_selling":
      status = "blocked_selling";
      break;
    default:
      return res.status(400).json({ message: "Invalid action" });
  }

  db.query("UPDATE users SET status = ? WHERE id = ?", [status, id], (err) => {
    if (err) return res.status(500).json({ message: "Status update failed" });
    return res.json({ message: `User status updated to '${status}' successfully` });
  });
});

// Admin - Products
app.get("/admin/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

app.delete("/admin/products/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM products WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Delete failed" });
    res.json({ message: "Product deleted successfully" });
  });
});

// Admin - Orders
app.get("/admin/orders", (req, res) => {
  db.query("SELECT * FROM orders", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

app.delete("/admin/orders/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM orders WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Delete failed" });
    res.json({ message: "Order deleted successfully" });
  });
});

// Admin - Feedbacks
app.get("/admin/feedbacks", (req, res) => {
  db.query("SELECT * FROM feedbacks", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

// Admin - Reports
app.get("/admin/reports", (req, res) => {
  db.query("SELECT * FROM reports", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

app.delete("/admin/reports/delete/:userId", (req, res) => {
  const userId = req.params.userId;
  db.query("DELETE FROM reports WHERE reportedUserId = ?", [userId], (err) => {
    if (err) return res.status(500).json({ message: "Failed to delete reports" });
    res.json({ message: "All reports for this user have been deleted" });
  });
});

// ========================
// ✅ Product Routes (Farm Owner)
// ========================

// Add new product with image upload
app.post("/add-product", upload.single("image"), (req, res) => {
  const { name, price, description, userId } = req.body;
  if (!name || !price || !description || !userId || !req.file)
    return res.status(400).json({ message: "All fields including image are required" });

  const imageUrl = `/uploads/${req.file.filename}`;

  db.query(
    "INSERT INTO products (userId, name, price, image, description) VALUES (?, ?, ?, ?, ?)",
    [userId, name, price, imageUrl, description],
    (err) => {
      if (err) return res.status(500).json({ message: "Failed to add product" });
      res.status(201).json({ message: "Product added successfully!", image: imageUrl });
    }
  );
});

// Get all products (public) with ownerName
app.get("/get-products", (req, res) => {
  const query = `
    SELECT p.*, u.fullname AS ownerName
    FROM products p
    LEFT JOIN users u ON p.userId = u.id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

// Get products by farm owner id
app.get("/get-my-products/:userId", (req, res) => {
  const { userId } = req.params;
  db.query("SELECT * FROM products WHERE userId = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch products" });
    res.json(results);
  });
});

// ✅ New: Delete product by ID (Farm Owner)
app.delete("/delete-product/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM products WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Failed to delete product" });
    res.json({ message: "Product deleted successfully" });
  });
});

// ========================
// ✅ Server Listen
// ========================
app.listen(5000, () => console.log("🚀 Backend running at http://localhost:5000"));
