import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DeliverymanDashboard.css";

export default function DeliverymanDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingDeliveries: 0,
    deliveredOrders: 0,
    earnings: 0.00,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, approved, delivered

  // Auth check
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  // Fetch stats and orders
  useEffect(() => {
    if (user?.id) {
      fetchStats();
      fetchOrders();
    }
  }, [user, filter]);

  const fetchStats = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`http://localhost:5000/deliveryman/stats/${user.id}`);
      const statsData = res.data;
      // Calculate earnings: 50.00 per delivered order
      const calculatedEarnings = (statsData.deliveredOrders || 0) * 50.00;
      setStats({
        ...statsData,
        earnings: calculatedEarnings.toFixed(2),
      });
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  };

  const fetchOrders = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/get-delivery-orders/${user.id}`);
      let filteredOrders = res.data;
      if (filter === "approved") {
        filteredOrders = res.data.filter((order) => order.status === "Approved");
      } else if (filter === "delivered") {
        filteredOrders = res.data.filter((order) => order.status === "Delivered");
      }
      setOrders(filteredOrders);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    if (!window.confirm("Mark this order as delivered?")) return;
    try {
      await axios.put(`http://localhost:5000/deliveryman/update-order/${orderId}`, {
        status: "Delivered",
        deliverymanId: user.id,
      });
      alert("Order marked as delivered!");
      fetchOrders();
      fetchStats();
    } catch (err) {
      console.error("Failed to update order", err);
      alert(err.response?.data?.message || "Failed to update order");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#4caf50";
      case "Approved":
        return "#2196f3";
      case "Cancelled":
        return "#f44336";
      default:
        return "#ff9800";
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>🚚 Delivery Dashboard</h2>
        <ul>
          <li className="active">Dashboard</li>
          <li style={{ cursor: "pointer" }} onClick={() => navigate("/deliveryman-profile")}>
            Profile
          </li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>Deliveryman Dashboard</h1>
            <p>
              Welcome back, <b>{user.fullName || "Deliveryman"}</b>
            </p>
          </div>
          <button className="profile-btn" onClick={() => navigate("/deliveryman-profile")}>
            View Profile
          </button>
        </header>

        {/* Statistics */}
        <section className="statistics">
          <div className="stat-item">
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
          </div>
          <div className="stat-item">
            <h3>Pending Deliveries</h3>
            <p>{stats.pendingDeliveries}</p>
          </div>
          <div className="stat-item">
            <h3>Delivered</h3>
            <p>{stats.deliveredOrders}</p>
          </div>
          <div className="stat-item" style={{ color: "#fff" }}>
            <h3>Total Earnings</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>৳{stats.earnings || "0.00"}</p>
          </div>
        </section>

        {/* Filter Section */}
        <div style={filterSection}>
          <button
            style={{ ...filterBtn, ...(filter === "all" ? activeFilterBtn : {}) }}
            onClick={() => setFilter("all")}
          >
            All Orders
          </button>
          <button
            style={{ ...filterBtn, ...(filter === "approved" ? activeFilterBtn : {}) }}
            onClick={() => setFilter("approved")}
          >
            Pending Delivery
          </button>
          <button
            style={{ ...filterBtn, ...(filter === "delivered" ? activeFilterBtn : {}) }}
            onClick={() => setFilter("delivered")}
          >
            Delivered
          </button>
        </div>

        {/* Orders Section */}
        <section className="orders-section">
          <h2>My Delivery Orders</h2>
          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div style={noOrdersStyle}>
              <p>No orders assigned yet</p>
            </div>
          ) : (
            <div style={ordersGrid}>
              {orders.map((order) => (
                <div key={order.id} style={orderCard}>
                  <div style={orderHeader}>
                    <h3 style={orderIdStyle}>Order #{order.id}</h3>
                    <span
                      style={{
                        ...statusBadge,
                        background: getStatusColor(order.status),
                      }}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div style={orderInfo}>
                    <div style={infoRow}>
                      <strong>Customer:</strong> {order.customerName || "N/A"}
                    </div>
                    <div style={infoRow}>
                      <strong>Customer Email:</strong> {order.customerEmail || "N/A"}
                    </div>
                    <div style={infoRow}>
                      <strong>Farm Owner:</strong> {order.farmownerName || "N/A"}
                    </div>
                    <div style={infoRow}>
                      <strong>Products:</strong> {order.productList || "N/A"}
                    </div>
                    <div style={infoRow}>
                      <strong>Total Quantity:</strong> {order.totalQuantity || 0} KG
                    </div>
                    <div style={infoRow}>
                      <strong>Total Cost:</strong> ৳{order.totalCost || 0}
                    </div>
                    <div style={infoRow}>
                      <strong>Delivery Address:</strong> {order.address || "N/A"}
                    </div>
                    <div style={infoRow}>
                      <strong>Contact Number:</strong> {order.phone || "N/A"}
                    </div>
                    <div style={infoRow}>
                      <strong>Date:</strong> {order.createdAt || new Date(order.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div style={actionButtons}>
                    {order.status === "Approved" && (
                      <button
                        style={{ ...actionBtn, background: "#4caf50" }}
                        onClick={() => handleMarkDelivered(order.id)}
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// Styles
const filterSection = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
  flexWrap: "wrap",
};

const filterBtn = {
  padding: "10px 20px",
  background: "#fff",
  border: "1px solid #ccc",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
};

const activeFilterBtn = {
  background: "#2e7d32",
  color: "#fff",
  border: "1px solid #2e7d32",
};

const noOrdersStyle = {
  textAlign: "center",
  padding: "40px",
  background: "#fff",
  borderRadius: "8px",
  color: "#666",
};

const ordersGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
  gap: "20px",
};

const orderCard = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const orderHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
  paddingBottom: "15px",
  borderBottom: "1px solid #eee",
};

const orderIdStyle = {
  margin: 0,
  fontSize: "18px",
  color: "#333",
};

const statusBadge = {
  padding: "6px 12px",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "12px",
  fontWeight: "600",
};

const orderInfo = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginBottom: "15px",
};

const infoRow = {
  fontSize: "14px",
  color: "#555",
};

const actionButtons = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const actionBtn = {
  padding: "8px 16px",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
};

