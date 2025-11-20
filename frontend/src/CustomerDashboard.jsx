import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerDashboard.css";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reportingOrder, setReportingOrder] = useState(null); // holds order to report
  const [reportText, setReportText] = useState("");
  const [reportMessage, setReportMessage] = useState("");

  // Auth check
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/get-products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  // Fetch user's orders
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

  // Place order
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
      alert(`Order placed for ${product.name}!`);
      fetchOrders(); // refresh orders
    } catch (err) {
      console.error("Failed to place order", err);
      alert("Failed to place order");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/hero");
  };

  // ✅ Handle Report Submission
  const handleReportSubmit = async () => {
    if (!reportText.trim()) {
      setReportMessage("Reason cannot be empty!");
      return;
    }

    // Make sure ownerId exists in your order object
    const ownerId = reportingOrder?.farmowner_id || reportingOrder?.ownerId;
    if (!ownerId) {
      setReportMessage("Cannot find owner ID for this order!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/report", {
        reportedFarmOwnerId: ownerId,
        reporterCustomerId: user.id,
        reason: reportText.trim(),
      });

      setReportMessage(res.data.message || "Report submitted!");
      setReportText("");
      setTimeout(() => setReportingOrder(null), 1500);
    } catch (err) {
      console.error(err);
      setReportMessage(err.response?.data?.message || "Failed to submit report");
    }
  };

  const stats = {
  totalOrders: orders.length,
  totalSpent: orders.reduce(
  (sum, o) => sum + parseFloat(o.totalCost ?? o.totalPrice ?? 0),
  0
),

  delivered: orders.filter((o) => o.status === "Pending").length,
};


  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>🌽 AgroFarmBD</h2>
        <ul>
          <li className="active">Dashboard</li>
          <li style={{ cursor: "pointer" }} onClick={() => navigate("/products")}>Products</li>
          <li style={{ cursor: "pointer" }} onClick={() => navigate("/delivery-management")}>Orders</li>
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
            <p>৳{stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>


          </div>
          <div className="stat-item">
            <h3>Delivered Orders</h3>
            <p>{stats.delivered}</p>
          </div>
        </section>

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
                <th>Report</th>
              </tr>
            </thead>
            <tbody>
  {orders.map((o) => (
    <tr key={o.id}>
      <td>{o.productName}</td>
      <td>{o.quantity ?? o.totalQuantity ?? 0}</td>
<td>৳{o.totalCost ?? o.totalPrice ?? 0}</td>

      <td>
        <span
          className={`status-badge ${
            o.status === "Delivered"
              ? "delivered"
              : o.status === "Approved"
              ? "approved"
              : o.status === "Cancelled"
              ? "cancelled"
              : "pending"
          }`}
        >
          {o.status || "Pending"}
        </span>
      </td>
      <td>
        <button
          className="report-btn"
          onClick={() => {
            setReportingOrder(o);
            setReportMessage("");
          }}
          disabled={o.status === "Delivered"}
        >
          Report Owner
        </button>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </section>

        {/* ReportForm Overlay */}
        {reportingOrder && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>Report Owner for Order #{reportingOrder.id}</h3>

              <textarea
                className="report-textarea"
                placeholder="Write your report details here..."
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
              />

              <div className="modal-actions">
                <button className="submit-btn" onClick={handleReportSubmit}>
                  Submit Report
                </button>

                <button className="cancel-btn" onClick={() => setReportingOrder(null)}>
                  Cancel
                </button>
              </div>

              {reportMessage && <p className="report-message">{reportMessage}</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
