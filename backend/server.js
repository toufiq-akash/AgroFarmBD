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




import db from "./db.js";

db.connect((err) => {
  if (err) console.error("❌ Database connection failed:", err);
  else console.log("✅ Connected to MySQL database!");
});

// ========================
// ✅ User Routes
// ========================
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

app.get("/users/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.query("SELECT id, fullname, email, role, status FROM users WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  });
});

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

app.get("/admin/orders", (req, res) => {
  const sql = `
    SELECT 
      o.*, 
      GROUP_CONCAT(CONCAT(p.name, ' (', oi.quantity, ')') SEPARATOR ', ') AS products,
      SUM(oi.quantity) AS totalQuantity
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    GROUP BY o.id
    ORDER BY o.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
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

app.get("/admin/feedbacks", (req, res) => {
  db.query("SELECT * FROM feedbacks", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

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

app.delete("/admin/feedbacks/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM feedbacks WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Failed to delete feedback" });
    res.json({ message: "Feedback deleted successfully" });
  });
});

// ========================
// ✅ Product Routes (Farm Owner)
// ========================
app.post("/add-product", upload.single("image"), (req, res) => {
  const { name, price, description, userId } = req.body;
  if (!name || !price || !description || !userId || !req.file)
    return res.status(400).json({ message: "All fields including image are required" });

  const imageUrl = `/uploads/${req.file.filename}`;

  // Resolve owner email from users table using userId
  db.query("SELECT email FROM users WHERE id = ?", [userId], (lookupErr, results) => {
    if (lookupErr) {
      return res.status(500).json({ message: "Failed to resolve owner email" });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: "Owner user not found" });
    }
    const owner_email = results[0].email;

    db.query(
      "INSERT INTO products (userId, name, price, image, description, owner_email) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, name, price, imageUrl, description, owner_email],
      (err) => {
        if (err) return res.status(500).json({ message: "Failed to add product" });
        res.status(201).json({ message: "Product added successfully!", image: imageUrl });
      }
    );
  });
});

app.put("/update-product/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { name, price, description, owner_email } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  let query = "UPDATE products SET name = ?, price = ?, description = ?, owner_email = ?";
  const params = [name, price, description, owner_email];

  if (image) {
    query += ", image = ?";
    params.push(image);
  }

  query += " WHERE id = ?";
  params.push(id);

  db.query(query, params, (err) => {
    if (err) return res.status(500).json({ message: "Failed to update product" });
    res.json({ message: "Product updated successfully!" });
  });
});

// ✅ Updated Get Products with Smart Sorting and Search
app.get("/get-products", (req, res) => {
  const sort = req.query.sort || "newest";
  const search = req.query.search || "";
  let orderBy = "p.id DESC";

  if (sort === "oldest") orderBy = "p.id ASC";
  else if (sort === "price_low") orderBy = "p.price ASC";
  else if (sort === "price_high") orderBy = "p.price DESC";
  else if (sort === "name_az") orderBy = "p.name ASC";
  else if (sort === "name_za") orderBy = "p.name DESC";

  let query = `
    SELECT p.*, u.fullname AS ownerName
    FROM products p
    LEFT JOIN users u ON p.userId = u.id
  `;
  const params = [];

  if (search.trim()) {
    query += ` WHERE p.name LIKE ? OR p.description LIKE ? OR p.id = ?`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, isNaN(search) ? -1 : parseInt(search));
  }

  query += ` ORDER BY ${orderBy}`;

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

// ✅ Get Product by ID or Name
app.get("/get-product/:identifier", (req, res) => {
  const identifier = req.params.identifier;
  const isNumeric = !isNaN(identifier);

  let query = `
    SELECT p.*, u.fullname AS ownerName, u.email AS ownerEmail
    FROM products p
    LEFT JOIN users u ON p.userId = u.id
    WHERE ${isNumeric ? "p.id = ?" : "p.name LIKE ?"}
  `;
  const param = isNumeric ? parseInt(identifier) : `%${identifier}%`;

  db.query(query, [param], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(isNumeric ? results[0] : results);
  });
});

app.get("/get-my-products/:userId", (req, res) => {
  const { userId } = req.params;
  db.query("SELECT * FROM products WHERE userId = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch products" });
    res.json(results);
  });
});

app.delete("/delete-product/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM products WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Failed to delete product" });
    res.json({ message: "Product deleted successfully" });
  });
});




///////////////reports
app.post("/report", upload.single("image"), (req, res) => {
  const { reportedFarmOwnerId, reporterCustomerId, reason } = req.body;

  // uploaded file name (if exists)
  const proofUrl = req.file ? req.file.filename : null;

  if (!reportedFarmOwnerId || !reporterCustomerId || !reason) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `
    INSERT INTO reports 
    (reportedFarmOwnerId, reporterCustomerId, reason, proofUrl)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    query,
    [reportedFarmOwnerId, reporterCustomerId, reason, proofUrl],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      return res.json({ message: "Report submitted successfully" });
    }
  );
});


// ========================
// DELETE a Report (Admin)
// ========================
app.delete("/admin/reports/:id", (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM reports WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.json({ message: "Report deleted successfully" });
  });
});



// ========================
// ✅ Order Routes
// ========================
app.post("/place-order", (req, res) => {
  const { userId, items, shipping, totalCost, phone, address, paymentMethod, note } = req.body;

  if (!userId || !items || !Array.isArray(items) || items.length === 0 || !phone || !address) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Get farmowner_id from first product
  db.query("SELECT userId FROM products WHERE id = ?", [items[0].productId], (err, productResult) => {
    if (err || productResult.length === 0) {
      return res.status(400).json({ message: "Invalid product" });
    }

    const farmownerId = productResult[0].userId;


    // Insert order
    const orderQuery = `
      INSERT INTO orders (customer_id, farmowner_id, total_price, delivery_address, contact_number, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'Pending', NOW())
    `;

    db.query(
      orderQuery,
      [userId, farmownerId, totalCost, address, phone],
      (err, orderResult) => {
        if (err) {
          console.error("Order insert error:", err);
          return res.status(500).json({ message: "Failed to create order" });
        }

        const orderId = orderResult.insertId;

        // Insert order items
        const itemQueries = items.map((item) => {
          return new Promise((resolve, reject) => {
            db.query(
              "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
              [orderId, item.productId, item.quantity, item.unitPrice],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        });

        Promise.all(itemQueries)
          .then(() => {
            res.status(201).json({
              message: "Order placed successfully!",
              orderId: orderId,
            });
          })
          .catch((err) => {
            console.error("Order items insert error:", err);
            res.status(500).json({ message: "Failed to create order items" });
          });
      }
    );
  });
});

// Get My Orders for a Customer
app.get("/get-my-orders/:customerId", (req, res) => {
  const customerId = req.params.customerId;

  const query = `
    SELECT 
      o.id AS id,
      o.customer_id,
      o.farmowner_id,
      u.fullname AS farmownerName,
      GROUP_CONCAT(CONCAT(p.name, ' (', oi.quantity, ')') SEPARATOR ', ') AS productName,
      SUM(oi.quantity) AS totalQuantity,
      SUM(oi.price) AS totalPrice,
      o.delivery_address AS address,
      o.contact_number AS phone,
      o.status,
      o.created_at
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    JOIN users u ON o.farmowner_id = u.id
    WHERE o.customer_id = ?
    GROUP BY o.id, o.farmowner_id, u.fullname, o.delivery_address, o.contact_number, o.status, o.created_at
    ORDER BY o.created_at DESC
  `;

  db.query(query, [customerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});




// File: server.js (or wherever your routes are)
app.get("/get-farmowner-orders/:userId", (req, res) => {
    const userId = req.params.userId;

    const query = `
        SELECT 
            o.id,
            o.customer_id,
            u.fullname AS customerName,
            u.email AS customerEmail,
            o.delivery_address AS address,
            o.contact_number AS phone,
            o.status,
            o.created_at,
            o.deliveryman_id,

            GROUP_CONCAT(
                CONCAT(p.name, ' (', oi.quantity, ' KG)')
                SEPARATOR ', '
            ) AS productName,

            SUM(oi.quantity) AS totalQuantity,
            SUM(oi.price) AS totalPrice
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN users u ON o.customer_id = u.id
        WHERE o.farmowner_id = ?
        GROUP BY 
            o.id, 
            u.fullname, 
            u.email, 
            o.delivery_address, 
            o.contact_number, 
            o.status, 
            o.created_at,
            o.deliveryman_id
        ORDER BY o.created_at DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Get farmowner orders error:", err);
            return res.status(500).json({ message: "Failed to fetch orders" });
        }
        res.json(results);
    });
});



app.put("/update-order-status/:id", (req, res) => {
  const orderId = req.params.id;
  const { status, deliverymanId } = req.body;

  if (!status || !["Pending", "Approved", "Cancelled", "Delivered"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  let query = "UPDATE orders SET status = ?";
  const params = [status];

  if (deliverymanId && status === "Approved") {
    query += ", deliveryman_id = ?";
    params.push(deliverymanId);
  }

  query += " WHERE id = ?";
  params.push(orderId);

  db.query(query, params, (err) => {
    if (err) {
      console.error("Update order status error:", err);
      return res.status(500).json({ message: "Failed to update order status" });
    }
    res.json({ message: "Order status updated successfully" });
  });
});

// ========================
// ✅ Delivery Management Routes
// ========================
app.get("/get-deliverymen", (req, res) => {
  db.query("SELECT * FROM deliverymen WHERE status = 'active'", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

app.get("/get-delivery-orders/:deliverymanId", (req, res) => {
  const deliverymanId = req.params.deliverymanId;

  const query = `
    SELECT 
      o.id,
      o.customer_id,
      o.farmowner_id,
      o.total_price AS totalCost,
      o.delivery_address AS address,
      o.contact_number AS phone,
      o.status,

      DATE_FORMAT(o.created_at, '%Y-%m-%d %h:%i %p') AS createdAt,

      u1.fullname AS customerName,
      u2.fullname AS farmownerName,

      GROUP_CONCAT(
        CONCAT(p.name, ' (', oi.quantity, ' KG)')
        SEPARATOR ', '
      ) AS productList,

      SUM(oi.quantity) AS totalQuantity

    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    LEFT JOIN users u1 ON o.customer_id = u1.id
    LEFT JOIN users u2 ON o.farmowner_id = u2.id

    WHERE o.deliveryman_id = ?

    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  db.query(query, [deliverymanId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", err });
    res.json(results);
  });
});


// ========================
// ✅ Server Listen
// ========================
app.listen(5000, () => console.log("🚀 Backend running at http://localhost:5000"));
