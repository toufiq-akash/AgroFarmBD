import React, { useEffect, useState } from "react";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch orders
    fetch("http://localhost:5000/admin/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error fetching orders:", err));

    // Fetch users
    fetch("http://localhost:5000/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const res = await fetch(`http://localhost:5000/admin/orders/${id}`, { method: "DELETE" });
      if (res.ok) setOrders(orders.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const getUserName = (id) => {
    const user = users.find((u) => u.id === id);
    return user ? user.fullname : "N/A";
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "#43a047"; // green
      case "cancelled":
        return "#e53935"; // red
      default:
        return "#fbc02d"; // yellow for pending
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "'Poppins', sans-serif" }}>
      <h1>Manage Orders</h1>
      <table style={tableStyle}>
        <thead>
          <tr style={headerStyle}>
            <th>ID</th>
            <th>Owner</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "12px" }}>No orders found</td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.id} style={rowStyle}>
                <td>{o.id}</td>
                <td>{getUserName(o.farmowner_id)}</td>
                <td>{getUserName(o.customer_id)}</td>
                <td>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      color: "#fff",
                      backgroundColor: getStatusColor(o.status),
                      fontWeight: "bold",
                      fontSize: "13px",
                    }}
                  >
                    {o.status || "Pending"}
                  </span>
                </td>
                <td>
                  <button style={deleteBtnStyle} onClick={() => handleDelete(o.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------------- Styles ----------------
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
  border: "1px solid #ccc",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const headerStyle = {
  backgroundColor: "#1976d2",
  color: "#fff",
  padding: "10px",
  textAlign: "left",
};

const rowStyle = {
  borderBottom: "1px solid #eee",
  transition: "background 0.3s",
  cursor: "pointer",
};

const deleteBtnStyle = {
  background: "#d32f2f",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
};
