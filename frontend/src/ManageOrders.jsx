import React, { useEffect, useState } from "react";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/admin/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error fetching orders:", err));
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

  return (
    <div>
      <h1>Manage Orders</h1>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.product || "N/A"}</td>
              <td>{o.customer || "N/A"}</td>
              <td>{o.status || "Pending"}</td>
              <td>
                <button style={deleteBtnStyle} onClick={() => handleDelete(o.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "20px" };
const deleteBtnStyle = { background: "#d32f2f", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" };
