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
// ✅ Helper Functions
// ========================
/**
 * Updates deliveryman earnings when an order is marked as Delivered
 * @param {number} orderId - The order ID
 * @param {string} newStatus - The new status being set
 * @param {callback} callback - Callback function (err, result)
 */
function updateDeliverymanEarnings(orderId, newStatus, callback) {
  // Only process if status is being changed to 'Delivered'
  if (newStatus !== "Delivered") {
    return callback(null, { message: "Status is not Delivered, no earnings update needed" });
  }

  // First, get the order details including current status and deliveryman_id
  db.query("SELECT deliveryman_id, status FROM orders WHERE id = ?", [orderId], (err, orderResults) => {
    if (err) return callback(err);
    if (orderResults.length === 0) return callback(new Error("Order not found"));
    
    const order = orderResults[0];
    const previousStatus = order.status;
    const deliverymanId = order.deliveryman_id;

    // Check if order was already delivered (to avoid double payment)
    if (previousStatus === "Delivered") {
      return callback(null, { message: "Order already delivered, earnings already credited" });
    }

    // Check if order has a deliveryman assigned
    if (!deliverymanId) {
      return callback(null, { message: "No deliveryman assigned to this order" });
    }

    // Get deliveryman details from users table
    db.query("SELECT email, fullname FROM users WHERE id = ? AND role = 'DeliveryMan'", [deliverymanId], (err, userResults) => {
      if (err) return callback(err);
      if (userResults.length === 0) {
        return callback(new Error("Deliveryman not found in users table"));
      }

      const deliverymanEmail = userResults[0].email;
      const deliverymanName = userResults[0].fullname;

      // Check if deliveryman exists in deliverymen table, if not create one
      db.query("SELECT id, earnings FROM deliverymen WHERE email = ?", [deliverymanEmail], (err, deliverymanResults) => {
        if (err) return callback(err);

        if (deliverymanResults.length === 0) {
          // Create new deliveryman record
          const currentEarnings = 50.00;
          db.query(
            "INSERT INTO deliverymen (fullname, email, status, earnings) VALUES (?, ?, 'active', ?)",
            [deliverymanName, deliverymanEmail, currentEarnings],
            (err, insertResult) => {
              if (err) return callback(err);
              callback(null, { 
                message: "Deliveryman earnings updated", 
                deliverymanId: insertResult.insertId,
                earnings: currentEarnings 
              });
            }
          );
        } else {
          // Update existing deliveryman earnings
          const currentEarnings = parseFloat(deliverymanResults[0].earnings || 0);
          const newEarnings = currentEarnings + 50.00;
          
          db.query(
            "UPDATE deliverymen SET earnings = ? WHERE email = ?",
            [newEarnings, deliverymanEmail],
            (err) => {
              if (err) return callback(err);
              callback(null, { 
                message: "Deliveryman earnings updated", 
                deliverymanId: deliverymanResults[0].id,
                earnings: newEarnings 
              });
            }
          );
        }
      });
    });
  });
}

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

app.post("/report", async (req, res) => {
  const { reportedFarmOwnerId, reporterCustomerId, reason, proofUrl } = req.body;

  // order_id is optional now
  if (!reportedFarmOwnerId || !reporterCustomerId || !reason) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const query = `
      INSERT INTO reports 
      (reportedFarmOwnerId, reporterCustomerId, reason, proofUrl)
      VALUES (?, ?, ?, ?)
    `;
    db.query(
      query,
      [reportedFarmOwnerId, reporterCustomerId, reason, proofUrl || null],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database error" });
        }
        return res.json({ message: "Report submitted successfully" });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
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

// Get My Orders for a Customer (with deliveryman info)
app.get("/get-my-orders/:customerId", (req, res) => {
  const customerId = req.params.customerId;

  const query = `
    SELECT 
      o.id AS id,
      o.customer_id,
      o.farmowner_id,
      o.deliveryman_id,
      u.fullname AS farmownerName,
      d.fullname AS deliverymanName,
      d.email AS deliverymanEmail,
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
    LEFT JOIN users d ON o.deliveryman_id = d.id
    WHERE o.customer_id = ?
    GROUP BY o.id, o.farmowner_id, u.fullname, o.delivery_address, o.contact_number, o.status, o.created_at, o.deliveryman_id, d.fullname, d.email
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
      d.fullname AS deliverymanName,
      d.email AS deliverymanEmail,
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
    LEFT JOIN users d ON o.deliveryman_id = d.id
    WHERE o.farmowner_id = ?
    GROUP BY o.id, u.fullname, u.email, o.delivery_address, o.contact_number, o.status, o.created_at, o.deliveryman_id, d.fullname, d.email
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

  // Get current order status before updating
  db.query("SELECT status, deliveryman_id FROM orders WHERE id = ?", [orderId], (err, currentOrder) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (currentOrder.length === 0) return res.status(404).json({ message: "Order not found" });
    
    const previousStatus = currentOrder[0].status;
    const shouldUpdateEarnings = status === "Delivered" && previousStatus !== "Delivered";

  let query = "UPDATE orders SET status = ?";
  const params = [status];

  // Allow assigning deliveryman when approving order
  if (deliverymanId && status === "Approved") {
    // Verify deliveryman exists and is active
    db.query(
      "SELECT id FROM users WHERE id = ? AND role = 'DeliveryMan' AND status = 'active'",
      [deliverymanId],
      (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0) {
          return res.status(400).json({ message: "Invalid or inactive deliveryman" });
        }

        query += ", deliveryman_id = ?";
        params.push(deliverymanId);
        params.push(orderId);
        query += " WHERE id = ?";

        db.query(query, params, (err) => {
          if (err) {
            console.error("Update order status error:", err);
            return res.status(500).json({ message: "Failed to update order status" });
          }
          
          // If status is Delivered and wasn't already delivered, update deliveryman earnings
          if (shouldUpdateEarnings) {
            updateDeliverymanEarnings(orderId, status, (earningsErr, earningsResult) => {
              if (earningsErr) {
                console.error("Earnings update error:", earningsErr);
                // Still return success for order update, but log the earnings error
              }
              res.json({ 
                message: "Order status updated and deliveryman assigned successfully",
                earningsUpdated: !earningsErr
              });
            });
          } else {
            res.json({ message: "Order status updated and deliveryman assigned successfully" });
          }
        });
      }
    );
    return;
  }

  // If no deliveryman assignment, just update status
  query += " WHERE id = ?";
  params.push(orderId);

  db.query(query, params, (err) => {
    if (err) {
      console.error("Update order status error:", err);
      return res.status(500).json({ message: "Failed to update order status" });
    }
    
    // If status is Delivered and wasn't already delivered, update deliveryman earnings
    if (shouldUpdateEarnings) {
      updateDeliverymanEarnings(orderId, status, (earningsErr, earningsResult) => {
        if (earningsErr) {
          console.error("Earnings update error:", earningsErr);
          // Still return success for order update, but log the earnings error
        }
        res.json({ 
          message: "Order status updated successfully",
          earningsUpdated: !earningsErr
        });
      });
    } else {
      res.json({ message: "Order status updated successfully" });
    }
  });
  });
});

// ========================
// ✅ Delivery Management Routes
// ========================
// Get available deliverymen (for owners to assign)
app.get("/get-deliverymen", (req, res) => {
  db.query(
    "SELECT id, fullname, email, status FROM users WHERE role = 'DeliveryMan' AND status = 'active'",
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});

// Get deliveryman dashboard stats
app.get("/deliveryman/stats/:deliverymanId", (req, res) => {
  const deliverymanId = req.params.deliverymanId;

  const stats = {};
  
  // Total assigned orders
  db.query(
    "SELECT COUNT(*) AS count FROM orders WHERE deliveryman_id = ?",
    [deliverymanId],
    (err, result1) => {
      if (err) return res.status(500).json({ message: "Database error" });
      stats.totalOrders = result1[0].count;

      // Pending orders
      db.query(
        "SELECT COUNT(*) AS count FROM orders WHERE deliveryman_id = ? AND status = 'Approved'",
        [deliverymanId],
        (err, result2) => {
          if (err) return res.status(500).json({ message: "Database error" });
          stats.pendingDeliveries = result2[0].count;

          // Delivered orders
          db.query(
            "SELECT COUNT(*) AS count FROM orders WHERE deliveryman_id = ? AND status = 'Delivered'",
            [deliverymanId],
            (err, result3) => {
              if (err) return res.status(500).json({ message: "Database error" });
              stats.deliveredOrders = result3[0].count;
              
              // Get deliveryman earnings
              db.query(
                "SELECT email FROM users WHERE id = ?",
                [deliverymanId],
                (err, userResult) => {
                  if (err || userResult.length === 0) {
                    stats.earnings = 0.00;
                    return res.json(stats);
                  }
                  
                  db.query(
                    "SELECT earnings FROM deliverymen WHERE email = ?",
                    [userResult[0].email],
                    (err, earningsResult) => {
                      if (err) {
                        stats.earnings = 0.00;
                      } else {
                        stats.earnings = parseFloat(earningsResult[0]?.earnings || 0).toFixed(2);
                      }
                      res.json(stats);
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

// Get deliveryman earnings
app.get("/deliveryman/earnings/:deliverymanId", (req, res) => {
  const deliverymanId = req.params.deliverymanId;

  // Get deliveryman email from users table
  db.query("SELECT email, fullname FROM users WHERE id = ? AND role = 'DeliveryMan'", [deliverymanId], (err, userResults) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (userResults.length === 0) {
      return res.status(404).json({ message: "Deliveryman not found" });
    }

    const deliverymanEmail = userResults[0].email;
    const deliverymanName = userResults[0].fullname;

    // Get earnings from deliverymen table
    db.query("SELECT earnings FROM deliverymen WHERE email = ?", [deliverymanEmail], (err, earningsResults) => {
      if (err) return res.status(500).json({ message: "Database error" });
      
      const earnings = earningsResults.length > 0 ? parseFloat(earningsResults[0].earnings || 0) : 0.00;
      
      res.json({
        deliverymanId: deliverymanId,
        fullname: deliverymanName,
        email: deliverymanEmail,
        earnings: earnings.toFixed(2)
      });
    });
  });
});

// Get deliveryman profile info from deliverymen table
app.get("/deliveryman/profile/:deliverymanId", (req, res) => {
  const deliverymanId = req.params.deliverymanId;

  // Get deliveryman email from users table
  db.query("SELECT email, fullname FROM users WHERE id = ? AND role = 'DeliveryMan'", [deliverymanId], (err, userResults) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (userResults.length === 0) {
      return res.status(404).json({ message: "Deliveryman not found" });
    }

    const deliverymanEmail = userResults[0].email;

    // Get profile from deliverymen table
    db.query("SELECT * FROM deliverymen WHERE email = ?", [deliverymanEmail], (err, deliverymanResults) => {
      if (err) return res.status(500).json({ message: "Database error" });
      
      if (deliverymanResults.length === 0) {
        // If no record exists in deliverymen table, return default values
        return res.json({
          id: null,
          fullname: userResults[0].fullname,
          phone: "",
          email: deliverymanEmail,
          status: "active",
          earnings: "0.00"
        });
      }

      const deliveryman = deliverymanResults[0];
      res.json({
        id: deliveryman.id,
        fullname: deliveryman.fullname || userResults[0].fullname,
        phone: deliveryman.phone || "",
        email: deliveryman.email || deliverymanEmail,
        status: deliveryman.status || "active",
        earnings: parseFloat(deliveryman.earnings || 0).toFixed(2)
      });
    });
  });
});

// Update deliveryman profile in deliverymen table
app.put("/deliveryman/profile/:deliverymanId", (req, res) => {
  const deliverymanId = req.params.deliverymanId;
  const { fullname, phone, email, status } = req.body;

  // Get deliveryman email from users table to find existing record
  db.query("SELECT email FROM users WHERE id = ? AND role = 'DeliveryMan'", [deliverymanId], (err, userResults) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (userResults.length === 0) {
      return res.status(404).json({ message: "Deliveryman not found" });
    }

    const oldEmail = userResults[0].email;

    // Check if deliveryman record exists
    db.query("SELECT id FROM deliverymen WHERE email = ?", [oldEmail], (err, existingResults) => {
      if (err) return res.status(500).json({ message: "Database error" });

      if (existingResults.length === 0) {
        // Create new record in deliverymen table
        db.query(
          "INSERT INTO deliverymen (fullname, phone, email, status, earnings) VALUES (?, ?, ?, ?, 0.00)",
          [fullname || userResults[0].fullname, phone || "", email || oldEmail, status || "active"],
          (err, insertResult) => {
            if (err) return res.status(500).json({ message: "Failed to create deliveryman profile" });
            res.json({ message: "Profile created successfully", profileId: insertResult.insertId });
          }
        );
      } else {
        // Update existing record
        const updates = [];
        const values = [];

        if (fullname) {
          updates.push("fullname = ?");
          values.push(fullname);
        }
        if (phone !== undefined) {
          updates.push("phone = ?");
          values.push(phone);
        }
        if (email && email !== oldEmail) {
          updates.push("email = ?");
          values.push(email);
        }
        if (status) {
          updates.push("status = ?");
          values.push(status);
        }

        if (updates.length === 0) {
          return res.json({ message: "No updates provided" });
        }

        values.push(oldEmail);
        const query = `UPDATE deliverymen SET ${updates.join(", ")} WHERE email = ?`;
        
        db.query(query, values, (err) => {
          if (err) return res.status(500).json({ message: "Failed to update profile" });
          res.json({ message: "Profile updated successfully" });
        });
      }
    });
  });
});

// Get deliveryman's orders
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
      u1.email AS customerEmail,
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

// Update order status by deliveryman (mark as delivered)
app.put("/deliveryman/update-order/:orderId", (req, res) => {
  const orderId = req.params.orderId;
  const { status, deliverymanId } = req.body;

  if (!status || !["Delivered"].includes(status)) {
    return res.status(400).json({ message: "Invalid status. Deliveryman can only mark orders as Delivered." });
  }

  // Verify the order belongs to this deliveryman and get current status
  db.query("SELECT deliveryman_id, status FROM orders WHERE id = ?", [orderId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "Order not found" });
    if (results[0].deliveryman_id != deliverymanId) {
      return res.status(403).json({ message: "You are not assigned to this order" });
    }

    const previousStatus = results[0].status;
    const shouldUpdateEarnings = previousStatus !== "Delivered";

    db.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId], (err) => {
      if (err) return res.status(500).json({ message: "Failed to update order status" });
      
      // Update deliveryman earnings if order wasn't already delivered
      if (shouldUpdateEarnings) {
        updateDeliverymanEarnings(orderId, status, (earningsErr, earningsResult) => {
          if (earningsErr) {
            console.error("Earnings update error:", earningsErr);
            // Still return success for order update, but log the earnings error
          }
          res.json({ 
            message: "Order status updated successfully",
            earningsUpdated: !earningsErr
          });
        });
      } else {
        res.json({ 
          message: "Order status updated successfully",
          earningsUpdated: false,
          note: "Order was already delivered, earnings already credited"
        });
      }
    });
  });
});


// ========================
// ✅ Review Routes
// ========================

// Check if customer is eligible to review a product
app.get("/check-review-eligibility/:productId/:customerId", (req, res) => {
  const { productId, customerId } = req.params;

  // First, verify user is a Customer
  db.query("SELECT role FROM users WHERE id = ?", [customerId], (err, userResult) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (userResult.length === 0) {
      return res.json({ eligible: false, reason: "User not found" });
    }
    if (userResult[0].role !== "Customer") {
      return res.json({ eligible: false, reason: "Only customers can review products" });
    }

    // Check if customer has at least one delivered order containing this product
    const query = `
      SELECT COUNT(*) AS count
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_id = ?
        AND oi.product_id = ?
        AND o.status = 'Delivered'
    `;

    db.query(query, [customerId, productId], (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      const hasDeliveredOrder = result[0].count > 0;

      if (!hasDeliveredOrder) {
        return res.json({
          eligible: false,
          reason: "You can review this product after it is delivered.",
        });
      }

      // Check if user already has a review for this product
      db.query("SELECT id FROM reviews WHERE product_id = ? AND customer_id = ?", [productId, customerId], (err, reviewResult) => {
        if (err) return res.status(500).json({ message: "Database error" });
        const hasExistingReview = reviewResult.length > 0;

        res.json({
          eligible: true,
          hasExistingReview: hasExistingReview,
          existingReviewId: hasExistingReview ? reviewResult[0].id : null,
        });
      });
    });
  });
});

// Get all reviews for a product
app.get("/get-reviews/:productId", (req, res) => {
  const { productId } = req.params;

  const query = `
    SELECT 
      r.id,
      r.product_id,
      r.customer_id,
      r.rating,
      r.comment,
      r.created_at,
      r.updated_at,
      u.fullname AS customer_name
    FROM reviews r
    INNER JOIN users u ON r.customer_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(query, [productId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    // Mask customer names (show only first letter and last letter)
    const maskedResults = results.map((review) => {
      const name = review.customer_name || "";
      let maskedName = "";
      if (name.length <= 2) {
        maskedName = name.charAt(0) + "*";
      } else {
        maskedName = name.charAt(0) + "*".repeat(name.length - 2) + name.charAt(name.length - 1);
      }

      return {
        ...review,
        customer_name: maskedName,
      };
    });

    res.json(maskedResults);
  });
});

// Submit or update a review
app.post("/submit-review", (req, res) => {
  const { productId, customerId, rating, comment } = req.body;

  if (!productId || !customerId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Invalid review data. Rating must be between 1 and 5." });
  }

  // Verify user is a Customer
  db.query("SELECT role FROM users WHERE id = ?", [customerId], (err, userResult) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    if (userResult[0].role !== "Customer") {
      return res.status(403).json({ message: "Only customers can review products" });
    }

    // Verify eligibility: customer must have a delivered order with this product
    const eligibilityQuery = `
      SELECT COUNT(*) AS count
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_id = ?
        AND oi.product_id = ?
        AND o.status = 'Delivered'
    `;

    db.query(eligibilityQuery, [customerId, productId], (err, eligibilityResult) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (eligibilityResult[0].count === 0) {
        return res.status(403).json({ message: "You can review this product after it is delivered." });
      }

      // Check if review already exists
      db.query("SELECT id FROM reviews WHERE product_id = ? AND customer_id = ?", [productId, customerId], (err, existingResult) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (existingResult.length > 0) {
          // Update existing review
          const reviewId = existingResult[0].id;
          db.query(
            "UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?",
            [rating, comment || null, reviewId],
            (err) => {
              if (err) return res.status(500).json({ message: "Failed to update review" });
              res.json({ message: "Review updated successfully", reviewId });
            }
          );
        } else {
          // Create new review
          db.query(
            "INSERT INTO reviews (product_id, customer_id, rating, comment) VALUES (?, ?, ?, ?)",
            [productId, customerId, rating, comment || null],
            (err, result) => {
              if (err) return res.status(500).json({ message: "Failed to submit review" });
              res.json({ message: "Review submitted successfully", reviewId: result.insertId });
            }
          );
        }
      });
    });
  });
});

// ========================
// ✅ Server Listen
// ========================
app.listen(5000, () => console.log("🚀 Backend running at http://localhost:5000"));
