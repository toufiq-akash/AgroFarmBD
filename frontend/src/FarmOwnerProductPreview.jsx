import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function FarmOwnerProductPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || (storedUser.role !== "Owner" && storedUser.role !== "farmowner")) {
      navigate("/login");
      return;
    }
    setUser(storedUser);
  }, [navigate]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/get-product/${id}`);
        setProduct(res.data);

        // Fetch orders for this product
        if (user?.id) {
          const ordersRes = await axios.get(`http://localhost:5000/get-farmowner-orders/${user.id}`);
          const productOrders = ordersRes.data.filter((order) =>
            order.productName?.includes(res.data.name)
          );
          setOrders(productOrders);
        }
      } catch (err) {
        console.error(err);
        alert("Product not found");
        navigate("/farm-owner-dashboard");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProduct();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Loading product preview...</p>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button style={backBtnStyle} onClick={() => navigate("/farm-owner-dashboard")}>
          ← Back to Dashboard
        </button>
        <h1 style={titleStyle}>Product Preview</h1>
      </div>

      <div style={detailContainer}>
        <div style={imageSection}>
          <img
            src={`http://localhost:5000${product.image}`}
            alt={product.name}
            style={imageStyle}
          />
        </div>

        <div style={infoSection}>
          <h1 style={productTitleStyle}>{product.name}</h1>
          <div style={priceStyle}>৳{product.price} per KG</div>

          <div style={descriptionBox}>
            <h3 style={descTitle}>Description</h3>
            <p style={descText}>{product.description || "No description available"}</p>
          </div>

          <div style={statsBox}>
            <h3 style={statsTitle}>Product Statistics</h3>
            <div style={statItem}>
              <span>Total Orders:</span>
              <strong>{orders.length}</strong>
            </div>
            <div style={statItem}>
              <span>Pending Orders:</span>
              <strong>{orders.filter((o) => o.status === "Pending").length}</strong>
            </div>
            <div style={statItem}>
              <span>Approved Orders:</span>
              <strong>{orders.filter((o) => o.status === "Approved").length}</strong>
            </div>
            <div style={statItem}>
              <span>Delivered Orders:</span>
              <strong>{orders.filter((o) => o.status === "Delivered").length}</strong>
            </div>
          </div>

          <div style={buttonGroup}>
            <button
              style={editBtnStyle}
              onClick={() => navigate("/farm-owner-dashboard")}
            >
              Edit Product
            </button>
            <button
              style={deleteBtnStyle}
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete this product?")) {
                  try {
                    await axios.delete(`http://localhost:5000/delete-product/${id}`);
                    alert("Product deleted successfully!");
                    navigate("/farm-owner-dashboard");
                  } catch (err) {
                    alert("Failed to delete product");
                  }
                }
              }}
            >
              Delete Product
            </button>
          </div>
        </div>
      </div>

      {orders.length > 0 && (
        <div style={ordersSection}>
          <h2 style={ordersTitle}>Orders for this Product</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customerName || "N/A"}</td>
                  <td>{order.quantity || "N/A"}</td>
                  <td>৳{order.totalCost}</td>
                  <td>
                    <span
                      style={{
                        ...statusBadge,
                        background:
                          order.status === "Delivered"
                            ? "#4caf50"
                            : order.status === "Approved"
                            ? "#2196f3"
                            : order.status === "Cancelled"
                            ? "#f44336"
                            : "#ff9800",
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Styles
const containerStyle = {
  padding: "40px",
  fontFamily: "Arial, sans-serif",
  maxWidth: "1200px",
  margin: "0 auto",
  background: "#F0FFF4",
  minHeight: "100vh",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
  marginBottom: "30px",
};

const backBtnStyle = {
  padding: "10px 20px",
  background: "#0b6709ff",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const titleStyle = {
  fontSize: "28px",
  color: "#2F855A",
  margin: 0,
};

const detailContainer = {
  display: "flex",
  gap: "40px",
  flexWrap: "wrap",
  background: "#fff",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  marginBottom: "30px",
};

const imageSection = {
  flex: "1",
  minWidth: "300px",
};

const imageStyle = {
  width: "100%",
  maxWidth: "500px",
  height: "auto",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const infoSection = {
  flex: "1",
  minWidth: "300px",
};

const productTitleStyle = {
  fontSize: "32px",
  color: "#1b5e20",
  marginBottom: "10px",
};

const priceStyle = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#2e7d32",
  marginBottom: "20px",
};

const descriptionBox = {
  background: "#f5f5f5",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "20px",
};

const descTitle = {
  margin: "0 0 10px",
  color: "#333",
};

const descText = {
  margin: 0,
  lineHeight: "1.6",
  color: "#555",
};

const statsBox = {
  background: "#e8f5e9",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "20px",
};

const statsTitle = {
  margin: "0 0 15px",
  color: "#2e7d32",
};

const statItem = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid #c8e6c9",
};

const buttonGroup = {
  display: "flex",
  gap: "10px",
  marginTop: "20px",
};

const editBtnStyle = {
  padding: "12px 24px",
  background: "#3182CE",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
};

const deleteBtnStyle = {
  padding: "12px 24px",
  background: "#E53E3E",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
};

const ordersSection = {
  background: "#fff",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const ordersTitle = {
  marginBottom: "20px",
  color: "#2F855A",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const statusBadge = {
  padding: "4px 12px",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "12px",
  fontWeight: "600",
};

