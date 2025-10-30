import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerDashboard.css";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // ✅ Auth check
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  // ✅ Fetch all products (public)
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/get-products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  // ✅ Fetch user's orders
  const fetchOrders = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`http://localhost:5000/get-my-orders/${user.id}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    if (user?.id) fetchOrders();
  }, [user]);

  // ✅ Place order
  const handleOrderProduct = async (product) => {
    if (!user?.id) return alert("User not found!");
    try {
      const payload = {
        userId: user.id,
        productId: product.id,
        quantity: 1,
        totalCost: product.price,
      };
      await axios.post("http://localhost:5000/place-order", payload);
      alert(`✅ Order placed for ${product.name}!`);
      fetchOrders(); // refresh orders
    } catch (err) {
      console.error("Failed to place order", err);
      alert("❌ Failed to place order");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((a, o) => a + o.totalCost, 0),
    delivered: orders.filter((o) => o.status === "Delivered").length,
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>🌽 AgroFarmBD</h2>
        <ul>
          <li className="active">Dashboard</li>
          <li style={{ cursor: "pointer" }} onClick={() => navigate("/products")}>Products</li>
          <li>Orders</li>
          <li>Statistics</li>
          <li style={{ cursor: "pointer" }} onClick={() => navigate("/customer-profile")}>Profile</li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>Customer Dashboard</h1>
            <p>Welcome back, <b>{user.fullName || "Customer"}</b> ({user.role || "Customer"})</p>
          </div>
          <button className="profile-btn" onClick={() => navigate("/customer-profile")}>View Profile</button>
        </header>

        {/* Statistics */}
        <section className="statistics">
          <div className="stat-item">
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
          </div>
          <div className="stat-item">
            <h3>Total Spent</h3>
            <p>৳{stats.totalSpent}</p>
          </div>
          <div className="stat-item">
            <h3>Delivered Orders</h3>
            <p>{stats.delivered}</p>
          </div>
        </section>

        {/* Products Section */}
        {/* <section className="products-section">
          <h2>Available Products</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Seller</th>
                <th>Price (৳)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.ownerName || "Unknown"}</td>
                  <td>{p.price}</td>
                  <td>
                    <button className="order-btn" onClick={() => handleOrderProduct(p)}>Order Now</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section> */}

        {/* Orders Section */}
        <section className="orders-section">
          <h2>My Orders</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Total Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.productName}</td>
                  <td>{o.quantity}</td>
                  <td>৳{o.totalCost}</td>
                  <td>
                    <span className={`status-badge ${o.status === "Delivered" ? "delivered" : "pending"}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
