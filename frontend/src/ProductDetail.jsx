import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/get-product/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        alert("Product not found");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleOrder = () => {
    if (!user) {
      alert("You must log in first to order!");
      navigate("/login");
      return;
    }
    setShowOrderModal(true);
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Product not found</p>
        <button onClick={() => navigate("/products")}>Back to Products</button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <button style={backBtnStyle} onClick={() => navigate("/products")}>
        ← Back to Products
      </button>

      <div style={detailContainer}>
        <div style={imageSection}>
          <img
            src={`http://localhost:5000${product.image}`}
            alt={product.name}
            style={imageStyle}
          />
        </div>

        <div style={infoSection}>
          <h1 style={titleStyle}>{product.name}</h1>
          <div style={priceStyle}>৳{product.price} per KG</div>
          <div style={ownerStyle}>Seller: {product.ownerName || "Unknown"}</div>
          {product.ownerEmail && (
            <div style={emailStyle}>Email: {product.ownerEmail}</div>
          )}

          <div style={descriptionBox}>
            <h3 style={descTitle}>Description</h3>
            <p style={descText}>{product.description || "No description available"}</p>
          </div>

          <div style={buttonGroup}>
            {user?.role !== "farmowner" && (
              <>
                <button style={orderBtnStyle} onClick={handleOrder}>
                  Order Now
                </button>
                <button
                  style={cartBtnStyle}
                  onClick={() => {
                    const cart = JSON.parse(localStorage.getItem(`cart_user_${user?.id}`) || "[]");
                    const existing = cart.find((item) => item.id === product.id);
                    let newCart;
                    if (existing) {
                      newCart = cart.map((item) =>
                        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                      );
                    } else {
                      newCart = [...cart, { ...product, quantity: 1 }];
                    }
                    localStorage.setItem(`cart_user_${user?.id}`, JSON.stringify(newCart));
                    alert("Added to cart!");
                  }}
                >
                  Add to Cart
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showOrderModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeader}>
              <h3>Complete your order</h3>
              <button style={closeBtn} onClick={() => setShowOrderModal(false)}>✕</button>
            </div>
            <OrderForm
              product={product}
              user={user}
              onClose={() => setShowOrderModal(false)}
              onOrderSuccess={() => {
                setShowOrderModal(false);
                alert("Order placed successfully!");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Order Form Component
function OrderForm({ product, user, onClose, onOrderSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const unitPrice = Number(product?.price || 0);
  const subtotal = +(unitPrice * quantity).toFixed(2);
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = +(subtotal + shipping).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !address.trim()) {
      return setError("Phone and address are required");
    }

    const payload = {
      userId: user.id,
      items: [
        {
          productId: product.id,
          quantity: quantity,
          unitPrice: unitPrice,
          subtotal: subtotal,
        },
      ],
      shipping: shipping,
      totalCost: total,
      phone: phone,
      address: address,
      paymentMethod: paymentMethod,
      note: note,
    };

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/place-order", payload);
      onOrderSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <img
          src={`http://localhost:5000${product.image}`}
          alt={product.name}
          style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 10 }}
        />
        <div>
          <h4>{product.name}</h4>
          <div>৳{unitPrice} per KG</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
            <span style={{ padding: "4px 12px" }}>{quantity}</span>
            <button type="button" onClick={() => setQuantity((q) => q + 1)}>+</button>
          </div>
        </div>
      </div>

      <input
        type="text"
        placeholder="Phone *"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        style={inputStyle}
      />
      <textarea
        placeholder="Shipping Address *"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
        rows={3}
        style={inputStyle}
      />
      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={inputStyle}>
        <option value="cod">Cash on Delivery</option>
        <option value="bkash">bKash</option>
        <option value="card">Credit / Debit Card</option>
      </select>
      <input
        type="text"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={inputStyle}
      />

      <div style={summaryBox}>
        <div style={summaryRow}><span>Subtotal</span><b>৳{subtotal}</b></div>
        <div style={summaryRow}><span>Shipping</span><b>৳{shipping}</b></div>
        <div style={{ ...summaryRow, fontSize: 18 }}><span>Total</span><b>৳{total}</b></div>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={loading} style={submitBtn}>
          {loading ? "Placing..." : `Place Order • ৳${total}`}
        </button>
        <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
      </div>
    </form>
  );
}

// Styles
const containerStyle = {
  padding: "40px",
  fontFamily: "Arial, sans-serif",
  maxWidth: "1200px",
  margin: "0 auto",
};

const backBtnStyle = {
  padding: "10px 20px",
  background: "#666",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "20px",
};

const detailContainer = {
  display: "flex",
  gap: "40px",
  flexWrap: "wrap",
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

const titleStyle = {
  fontSize: "32px",
  color: "#1b5e20",
  marginBottom: "10px",
};

const priceStyle = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#2e7d32",
  marginBottom: "10px",
};

const ownerStyle = {
  fontSize: "16px",
  color: "#666",
  marginBottom: "5px",
};

const emailStyle = {
  fontSize: "14px",
  color: "#888",
  marginBottom: "20px",
};

const descriptionBox = {
  background: "#f5f5f5",
  padding: "20px",
  borderRadius: "8px",
  marginTop: "20px",
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

const buttonGroup = {
  display: "flex",
  gap: "10px",
  marginTop: "20px",
};

const orderBtnStyle = {
  padding: "12px 24px",
  background: "#04880dff",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
};

const cartBtnStyle = {
  padding: "12px 24px",
  background: "#f57f17",
  color: "#000",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#fff",
  borderRadius: "12px",
  padding: "30px",
  maxWidth: "600px",
  width: "90%",
  maxHeight: "90vh",
  overflowY: "auto",
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const closeBtn = {
  background: "transparent",
  border: "none",
  fontSize: "24px",
  cursor: "pointer",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
  boxSizing: "border-box",
};

const summaryBox = {
  borderTop: "1px solid #ccc",
  paddingTop: "10px",
  marginTop: "10px",
};

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
};

const submitBtn = {
  padding: "12px 24px",
  background: "#1b5e20",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
};

const cancelBtn = {
  padding: "12px 24px",
  background: "#ccc",
  color: "#333",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
};

