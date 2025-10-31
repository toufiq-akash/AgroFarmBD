import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// -------------------- OrderForm Modal --------------------
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

  const updateQuantity = (dir) => {
    setQuantity((q) => Math.max(1, q + (dir === "inc" ? 1 : -1)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setError("You must log in.");
    if (!phone.trim()) return setError("Phone is required.");
    if (!address.trim()) return setError("Address is required.");

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
      await axios.post("http://localhost:5000/place-order", payload);
      setLoading(false);
      onOrderSuccess?.();
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError(err.response?.data?.message || "Failed to place order.");
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeader}>
          <h3>Complete your order</h3>
          <button style={closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 15, flexWrap: "wrap" }}>
          <div style={{ flex: "1 0 200px", minWidth: 200 }}>
            <img
              src={`http://localhost:5000${product.image}`}
              alt={product.name}
              style={{ width: "100%", borderRadius: 10, objectFit: "cover", height: 150 }}
            />
            <h4 style={{ margin: "10px 0 4px", color: "#1b5e20" }}>{product.name}</h4>
            <div style={{ color: "#555" }}>Seller: {product.ownerName || "Unknown"}</div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>৳{unitPrice}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button type="button" onClick={() => updateQuantity("dec")} style={qtyBtnStyle}>−</button>
              <div style={qtyBoxStyle}>{quantity}</div>
              <button type="button" onClick={() => updateQuantity("inc")} style={qtyBtnStyle}>+</button>
            </div>
          </div>
          <form onSubmit={handleSubmit} style={{ flex: "2 0 300px", minWidth: 300 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={labelStyle}>Buyer</label>
              <input style={inputStyle} type="text" value={user?.fullName || ""} disabled />
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={user?.email || ""} disabled />
              <label style={labelStyle}>Phone *</label>
              <input
                style={inputStyle}
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
              />
              <label style={labelStyle}>Shipping Address *</label>
              <textarea
                style={{ ...inputStyle, resize: "vertical" }}
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House, Road, Area, City, Postal"
              />
              <label style={labelStyle}>Payment Method</label>
              <select style={inputStyle} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="cod">Cash on Delivery</option>
                <option value="bkash">bKash</option>
                <option value="card">Credit / Debit Card</option>
              </select>
              <label style={labelStyle}>Note</label>
              <input
                style={inputStyle}
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div style={summaryBox}>
              <div style={summaryRow}><span>Subtotal</span><b>৳{subtotal}</b></div>
              <div style={summaryRow}><span>Shipping</span><b>৳{shipping}</b></div>
              <div style={{ ...summaryRow, fontSize: 18 }}><span>Total</span><b>৳{total}</b></div>
            </div>

            {error && <div style={errorStyle}>{error}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button type="submit" style={submitBtn} disabled={loading}>
                {loading ? "Placing..." : `Place Order • ৳${total}`}
              </button>
              <button type="button" style={cancelBtn} onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// -------------------- Cart Modal --------------------
function CartModal({ cart, setCart, user, onClose, onOrderSuccess }) {
  const navigate = useNavigate();

  const updateQuantity = (productId, dir) => {
    const newCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + (dir === "inc" ? 1 : -1)) } : item
    );
    setCart(newCart);
    saveCartToStorage(newCart, user);
  };

  const removeItem = (productId) => {
    const newCart = cart.filter((item) => item.id !== productId);
    setCart(newCart);
    saveCartToStorage(newCart, user);
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePlaceOrder = () => {
    if (!user) {
      alert("You must log in to place order!");
      navigate("/login");
      return;
    }
    if (cart.length > 0) {
      onOrderSuccess(cart[0]);
      onClose();
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, maxWidth: "700px" }}>
        <div style={modalHeader}>
          <h3>Your Cart</h3>
          <button style={closeBtn} onClick={onClose}>✕</button>
        </div>
        {cart.length === 0 ? (
          <p style={{ padding: 20 }}>Your cart is empty.</p>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Product</th>
                  <th style={thStyle}>Price</th>
                  <th style={thStyle}>Qty(KG)</th>
                  <th style={thStyle}>Subtotal</th>
                  <th style={thStyle}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>{item.name}</td>
                    <td style={tdStyle}>৳{item.price}</td>
                    <td style={tdStyle}>
                      <button style={qtyBtnStyle} onClick={() => updateQuantity(item.id, "dec")}>−</button>
                      <span style={{ margin: "0 8px" }}>{item.quantity}</span>
                      <button style={qtyBtnStyle} onClick={() => updateQuantity(item.id, "inc")}>+</button>
                    </td>
                    <td style={tdStyle}>৳{(item.price * item.quantity).toFixed(2)}</td>
                    <td style={tdStyle}>
                      <button style={{ ...qtyBtnStyle, background: "#e53935", color: "#fff" }} onClick={() => removeItem(item.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 15, textAlign: "right", fontWeight: 600, fontSize: 16 }}>
              Total: ৳{totalPrice.toFixed(2)}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
              <button style={submitBtn} onClick={handlePlaceOrder}>Place Order</button>
              <button style={cancelBtn} onClick={onClose}>Add More Products</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// -------------------- Helper --------------------
const saveCartToStorage = (cart, user) => {
  const key = user ? `cart_user_${user.id}` : "cart_guest";
  localStorage.setItem(key, JSON.stringify(cart));
};

const getCartFromStorage = (user) => {
  const key = user ? `cart_user_${user.id}` : "cart_guest";
  return JSON.parse(localStorage.getItem(key) || "[]");
};

// -------------------- ProductsPage --------------------
export default function ProductsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    setCart(getCartFromStorage(user));
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (user?.role === "farmowner") {
          const res = await axios.get(`http://localhost:5000/get-my-products/${user.id}`);
          setProducts(res.data);
        } else {
          const res = await axios.get("http://localhost:5000/get-products");
          setProducts(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, [user]);

  const handleOrder = (product) => {
    if (!user) return alert("❌ You must log in first to order!");
    if (user.role === "farmowner") return alert("Farmowners cannot order products.");
    setSelectedProduct(product);
    setShowOrderModal(true);
  };

  const handleAddToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    setCart(newCart);
    saveCartToStorage(newCart, user);
  };

  const onOrderSuccess = (product) => {
    setShowOrderModal(false);
    setSelectedProduct(null);
    setOrderMessage("✅ Order placed successfully!");
    setCart([]);
    saveCartToStorage([], user);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/delete-product/${id}`, { data: { userId: user.id } });
      setProducts(products.filter((p) => p.id !== id));
      alert("✅ Product deleted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "❌ Failed to delete product");
    }
  };

  // Pagination calculations
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = products.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(products.length / productsPerPage);

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <div style={styles.titleBox}>
          <h1 style={styles.title}>🌿 AgroFarm Products</h1>
          <p style={styles.subtitle}>Welcome, {user?.fullName || "Customer"}</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <div style={{ position: "relative" }}>
            <button style={styles.addCartBtn} onClick={() => setShowCartModal(true)}>
              🛒
              {cart.length > 0 && <span style={styles.cartCount}>{cart.length}</span>}
            </button>
          </div>

          {!user && (
            <>
              <button style={styles.loginBtn} onClick={() => navigate("/login")}>Login</button>
              <button style={styles.signupBtn} onClick={() => navigate("/signup")}>Sign Up</button>
            </>
          )}
        </div>
      </header>

      {orderMessage && <div style={{ color: "green", margin: "10px 0" }}>{orderMessage}</div>}

      <div style={styles.grid}>
        {currentProducts.length === 0 ? (
          <div style={styles.noProducts}>No products available.</div>
        ) : (
          currentProducts.map((product) => (
            <div key={product.id} style={styles.card}>
              <div style={styles.imageBox}>
                <img src={`http://localhost:5000${product.image}`} alt={product.name} style={styles.image} />
              </div>
              <h3 style={styles.name}>{product.name}</h3>
              <p style={styles.desc}>{product.description}</p>
              <div style={styles.price}>৳{product.price}</div>
              <div style={styles.owner}>Seller: {product.ownerName || "Unknown"}</div>
              <div style={styles.buttonGroup}>
                {user?.role !== "farmowner" && (
                  <>
                    <button style={styles.orderBtn} onClick={() => handleOrder(product)}>Order Now</button>
                    <button style={styles.addCartBtn} onClick={() => handleAddToCart(product)}>Add to Cart</button>
                  </>
                )}
                {user?.role === "farmowner" && (
                  <button style={styles.deleteBtn} onClick={() => handleDelete(product.id)}>Delete</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Buttons */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20, gap: 10 }}>
          <button
            style={paginationBtnStyle}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              style={{
                ...paginationBtnStyle,
                background: i + 1 === currentPage ? "#4caf50" : "#fff",
                color: i + 1 === currentPage ? "#fff" : "#000",
                border: i + 1 === currentPage ? "2px solid #2e7d32" : "1px solid #ccc",
              }}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            style={paginationBtnStyle}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {showOrderModal && selectedProduct && (
        <OrderForm product={selectedProduct} user={user} onClose={() => setShowOrderModal(false)} onOrderSuccess={onOrderSuccess} />
      )}

      {showCartModal && (
        <CartModal cart={cart} setCart={setCart} user={user} onClose={() => setShowCartModal(false)} onOrderSuccess={handleOrder} />
      )}
    </div>
  );
}

// -------------------- Styles --------------------
const styles = {
  wrapper: { padding: 20 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  titleBox: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%" }, // centered
  title: { fontSize: 28, color: "#1b5e20", margin: 0 },
  subtitle: { fontSize: 16, color: "#555", margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 },
  card: { padding: 15, border: "1px solid #eee", borderRadius: 10, background: "#fff", transition: "all 0.3s" },
  imageBox: { width: "100%", height: 150, overflow: "hidden", borderRadius: 10, marginBottom: 10 },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  name: { fontSize: 18, fontWeight: 600 },
  desc: { fontSize: 14, color: "#666" },
  price: { fontWeight: 700, marginTop: 6 },
  owner: { fontSize: 12, color: "#333" },
  orderBtn: { marginTop: 8, padding: "6px 12px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
  addCartBtn: { marginTop: 5, padding: "6px 12px", background: "#4caf50", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
  deleteBtn: { marginTop: 5, padding: "6px 12px", background: "#e53935", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
  noProducts: { textAlign: "center", color: "#777", marginTop: 50 },
  cartCount: { position: "absolute", top: -5, right: -8, background: "#e53935", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" },
  buttonGroup: { display: "flex", gap: 10 },
  loginBtn: { padding: "6px 12px", borderRadius: 6, border: "1px solid #2e7d32", background: "#fff", color: "#2e7d32", cursor: "pointer" },
  signupBtn: { padding: "6px 12px", borderRadius: 6, border: "none", background: "#2e7d32", color: "#fff", cursor: "pointer" },
};

// -------------------- Modal Styles --------------------
const overlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalStyle = { background: "#fff", padding: 20, borderRadius: 10, maxHeight: "90vh", overflowY: "auto", width: "90%", maxWidth: 800 };
const modalHeader = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const closeBtn = { background: "none", border: "none", fontSize: 18, cursor: "pointer" };
const inputStyle = { padding: 8, borderRadius: 6, border: "1px solid #ccc", width: "100%" };
const labelStyle = { fontWeight: 500 };
const qtyBtnStyle = { padding: "2px 6px", cursor: "pointer" };
const qtyBoxStyle = { display: "inline-block", minWidth: 24, textAlign: "center" };
const summaryBox = { marginTop: 15, padding: 10, border: "1px solid #eee", borderRadius: 8 };
const summaryRow = { display: "flex", justifyContent: "space-between", marginTop: 6 };
const errorStyle = { color: "red", marginTop: 10 };
const submitBtn = { padding: "8px 16px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };
const cancelBtn = { padding: "8px 16px", background: "#aaa", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };
const thStyle = { borderBottom: "1px solid #ccc", padding: 6, textAlign: "left" };
const tdStyle = { borderBottom: "1px solid #eee", padding: 6 };
const paginationBtnStyle = { padding: "6px 12px", borderRadius: 6, cursor: "pointer" };
