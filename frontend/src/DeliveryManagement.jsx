import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function DeliveryManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [deliverymen, setDeliverymen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, approved, delivered
  const [selectedDeliveryman, setSelectedDeliveryman] = useState({}); // orderId -> deliverymanId

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(storedUser);
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      if (user.role === "Owner" || user.role === "farmowner") {
        fetchDeliverymen();
      }
    }
  }, [user, filter]);

  const fetchDeliverymen = async () => {
    try {
      const res = await axios.get("http://localhost:5000/get-deliverymen");
      setDeliverymen(res.data);
    } catch (err) {
      console.error("Failed to fetch deliverymen:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let res;
      if (user.role === "Customer") {
        res = await axios.get(`http://localhost:5000/get-my-orders/${user.id}`);
      } else if (user.role === "Owner" || user.role === "farmowner") {
        res = await axios.get(`http://localhost:5000/get-farmowner-orders/${user.id}`);
      } else {
        setLoading(false);
        return;
      }

      let filteredOrders = res.data;
      if (filter !== "all") {
        filteredOrders = res.data.filter((order) => order.status.toLowerCase() === filter.toLowerCase());
      }
      setOrders(filteredOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus, deliverymanId = null) => {
    try {
      await axios.put(`http://localhost:5000/update-order-status/${orderId}`, {
        status: newStatus,
        deliverymanId: deliverymanId,
      });
      alert(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status");
    }
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

  if (loading) {
    return (
      <div style={containerStyle}>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button style={backBtnStyle} onClick={() => navigate(user.role === "Customer" ? "/customer-dashboard" : "/farm-owner-dashboard")}>
          ← Back to Dashboard
        </button>
        <h1 style={titleStyle}>Delivery Management</h1>
      </div>

      <div style={filterSection}>
        <button
          style={{ ...filterBtn, ...(filter === "all" ? activeFilterBtn : {}) }}
          onClick={() => setFilter("all")}
        >
          All Orders
        </button>
        <button
          style={{ ...filterBtn, ...(filter === "pending" ? activeFilterBtn : {}) }}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button
          style={{ ...filterBtn, ...(filter === "approved" ? activeFilterBtn : {}) }}
          onClick={() => setFilter("approved")}
        >
          Approved
        </button>
        <button
          style={{ ...filterBtn, ...(filter === "delivered" ? activeFilterBtn : {}) }}
          onClick={() => setFilter("delivered")}
        >
          Delivered
        </button>
      </div>

      {orders.length === 0 ? (
        <div style={noOrdersStyle}>
          <p>No orders found</p>
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
                {(user.role === "Owner" || user.role === "farmowner") && (
                  <div style={infoRow}>
                    <strong>Customer:</strong> {order.customerName || "N/A"}
                  </div>
                )}
                {user.role === "Customer" && (
                  <div style={infoRow}>
                    <strong>Seller:</strong> {order.farmownerName || "N/A"}
                  </div>
                )}
                {user.role === "Customer" && order.deliverymanName && (
                  <div style={infoRow}>
                    <strong>🚚 Deliveryman:</strong> {order.deliverymanName} ({order.deliverymanEmail || "N/A"})
                  </div>
                )}
                {(user.role === "Owner" || user.role === "farmowner") && order.deliverymanName && (
                  <div style={infoRow}>
                    <strong>🚚 Assigned Deliveryman:</strong> {order.deliverymanName} ({order.deliverymanEmail || "N/A"})
                  </div>
                )}
                <div style={infoRow}>
                  <strong>Products:</strong> {order.productName || "N/A"}
                </div>
                <div style={infoRow}>
                  <strong>Quantity:</strong> {order.totalQuantity || 0} KG
                </div>
                <div style={infoRow}>
                  <strong>Total:</strong> ৳{order.totalPrice || 0}
                </div>
                <div style={infoRow}>
                  <strong>Address:</strong> {order.address || "N/A"}
                </div>
                <div style={infoRow}>
                  <strong>Phone:</strong> {order.phone || "N/A"}
                </div>
                <div style={infoRow}>
                  <strong>Date:</strong> {order.created_at ? new Date(order.created_at).toLocaleDateString() : "N/A"}
                </div>
              </div>

              <div style={actionButtons}>
                {(user.role === "Owner" || user.role === "farmowner") && order.status === "Pending" && (
                  <>
                    {deliverymen.length > 0 ? (
                      <div style={{ width: "100%", marginBottom: "10px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600" }}>
                          Assign Deliveryman:
                        </label>
                        <select
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            fontSize: "14px",
                            marginBottom: "10px",
                          }}
                          value={selectedDeliveryman[order.id] || ""}
                          onChange={(e) => {
                            setSelectedDeliveryman({ ...selectedDeliveryman, [order.id]: e.target.value });
                          }}
                        >
                          <option value="">Select Deliveryman</option>
                          {deliverymen.map((dm) => (
                            <option key={dm.id} value={dm.id}>
                              {dm.fullname} ({dm.email})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
                        No deliverymen available
                      </p>
                    )}
                    <button
                      style={{ ...actionBtn, background: "#4caf50" }}
                      onClick={() => {
                        const deliverymanId = selectedDeliveryman[order.id];
                        if (!deliverymanId && deliverymen.length > 0) {
                          alert("Please select a deliveryman first");
                          return;
                        }
                        if (window.confirm("Approve this order and assign deliveryman?")) {
                          handleStatusUpdate(order.id, "Approved", deliverymanId || null);
                        }
                      }}
                    >
                      Approve & Assign
                    </button>
                    <button
                      style={{ ...actionBtn, background: "#f44336" }}
                      onClick={() => {
                        if (window.confirm("Cancel this order?")) {
                          handleStatusUpdate(order.id, "Cancelled");
                        }
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
                {(user.role === "Owner" || user.role === "farmowner") && order.status === "Approved" && (
                  <button
                    style={{ ...actionBtn, background: "#4caf50" }}
                    onClick={() => {
                      if (window.confirm("Mark this order as delivered?")) {
                        handleStatusUpdate(order.id, "Delivered");
                      }
                    }}
                  >
                    Mark as Delivered
                  </button>
                )}
                {user.role === "Customer" && order.status === "Pending" && (
                  <button
                    style={{ ...actionBtn, background: "#f44336" }}
                    onClick={() => {
                      if (window.confirm("Cancel this order?")) {
                        handleStatusUpdate(order.id, "Cancelled");
                      }
                    }}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Styles
const containerStyle = {
  padding: "40px",
  fontFamily: "Arial, sans-serif",
  maxWidth: "1400px",
  margin: "0 auto",
  minHeight: "100vh",
  background: "#f5f5f5",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
  marginBottom: "30px",
};

const backBtnStyle = {
  padding: "10px 20px",
  background: "#2e7d32",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const titleStyle = {
  fontSize: "28px",
  color: "#2e7d32",
  margin: 0,
};

const filterSection = {
  display: "flex",
  gap: "10px",
  marginBottom: "30px",
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

