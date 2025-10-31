// src/components/OrderForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function OrderForm({ product, user, onClose, onOrderSuccess }) {
  // product: { id, name, price, image, ownerName }
  // user: logged-in user object
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod, bkash, card
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPhone(user?.phone || "");
    setAddress(user?.address || "");
  }, [user]);

  const unitPrice = Number(product?.price || 0);
  const subtotal = +(unitPrice * quantity).toFixed(2);
  const shipping = subtotal > 1000 ? 0 : 50; // example: free shipping over 1000
  const total = +(subtotal + shipping).toFixed(2);

  const updateQuantity = (dir) => {
    setQuantity((q) => Math.max(1, q + (dir === "inc" ? 1 : -1)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("You must be logged in to place order.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (!address.trim()) {
      setError("Please enter a shipping address.");
      return;
    }

    const payload = {
      userId: user.id,
      productId: product.id,
      quantity,
      unitPrice,
      subtotal,
      shipping,
      totalCost: total,
      phone,
      address,
      paymentMethod,
      note,
    };

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/place-order", payload);
      // Expect server returns created order object or success
      setLoading(false);
      onOrderSuccess?.(res.data || { success: true });
    } catch (err) {
      console.error("Place order error:", err);
      setLoading(false);
      setError(err.response?.data?.message || "Failed to place order. Try again.");
    }
  };

  if (!product) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0 }}>Complete your order</h3>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginTop: 15 }}>
          {/* Left: product summary */}
          <div style={{ width: 160, flexShrink: 0 }}>
            <div style={{ width: 160, height: 120, overflow: "hidden", borderRadius: 10 }}>
              <img
                src={`http://localhost:5000${product.image}`}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <h4 style={{ margin: "10px 0 4px", color: "#1b5e20" }}>{product.name}</h4>
            <div style={{ color: "#555" }}>Seller: {product.ownerName || "Unknown"}</div>
            <div style={{ marginTop: 8, fontWeight: 700 }}>৳{unitPrice}</div>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button type="button" onClick={() => updateQuantity("dec")} style={qtyBtnStyle}>−</button>
              <div style={{ padding: "8px 12px", borderRadius: 8, background: "#f7f7f7", minWidth: 40, textAlign: "center" }}>{quantity}</div>
              <button type="button" onClick={() => updateQuantity("inc")} style={qtyBtnStyle}>+</button>
            </div>
          </div>

          {/* Right: order form */}
          <form onSubmit={handleSubmit} style={{ flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Buyer</label>
                <input type="text" value={user?.fullName || ""} disabled style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={user?.email || ""} disabled style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Phone <span style={{ color: "#c0392b" }}>*</span></label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" style={inputStyle} />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Shipping Address <span style={{ color: "#c0392b" }}>*</span></label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="House, Road, Area, City, Postal code" />
              </div>

              <div>
                <label style={labelStyle}>Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={inputStyle}>
                  <option value="cod">Cash on Delivery</option>
                  <option value="bkash">bKash (Mobile)</option>
                  <option value="card">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Optional Note</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} style={inputStyle} placeholder="Delivery note / instructions" />
              </div>
            </div>

            {/* Price summary */}
            <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#fafafa", border: "1px solid #eee" }}>
              <div style={summaryRowStyle}><span>Subtotal</span><strong>৳{subtotal}</strong></div>
              <div style={summaryRowStyle}><span>Shipping</span><strong>৳{shipping}</strong></div>
              <div style={{ ...summaryRowStyle, marginTop: 8, fontSize: 18 }}><span>Total</span><strong>৳{total}</strong></div>
            </div>

            {error && <div style={{ color: "#721c24", background: "#f8d7da", padding: 8, borderRadius: 6, marginTop: 12 }}>{error}</div>}

            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              <button type="submit" disabled={loading} style={submitBtnStyle}>
                {loading ? "Placing..." : `Place Order • ৳${total}`}
              </button>
              <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ---------- inline styles (simple) ---------- */
const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  padding: 20,
};

const modalStyle = {
  width: "min(980px, 98%)",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: 12,
  padding: 18,
  boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
};

const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const closeBtnStyle = { background: "transparent", border: "none", fontSize: 18, cursor: "pointer" };
const qtyBtnStyle = { padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" };
const labelStyle = { display: "block", fontSize: 13, color: "#333", marginBottom: 6 };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e0e0", outline: "none", fontSize: 14, boxSizing: "border-box" };
const summaryRowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 };
const submitBtnStyle = { background: "#1b5e20", color: "#fff", border: "none", padding: "12px 18px", borderRadius: 10, cursor: "pointer", fontWeight: 600 };
const cancelBtnStyle = { background: "#fff", color: "#444", border: "1px solid #ddd", padding: "10px 16px", borderRadius: 10, cursor: "pointer" };
