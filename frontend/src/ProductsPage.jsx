import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// -------------------- OrderForm Modal --------------------
function OrderForm({ product, products, user, onClose, onOrderSuccess }) {
  const isCartOrder = Array.isArray(products);
  const items = isCartOrder ? products : [product];

  const [quantities, setQuantities] = useState(items.map((p) => p.quantity || 1));
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateQuantity = (index, dir) => {
    setQuantities((prev) =>
      prev.map((q, i) => (i === index ? Math.max(1, q + (dir === "inc" ? 1 : -1)) : q))
    );
  };

  const subtotal = items.reduce((acc, p, i) => acc + Number(p.price) * quantities[i], 0);
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = +(subtotal + shipping).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setError("You must log in.");
    if (!phone.trim()) return setError("Phone is required.");
    if (!address.trim()) return setError("Address is required.");

    const orderItems = items.map((p, i) => ({
      productId: p.id,
      quantity: quantities[i],
      unitPrice: Number(p.price),
      subtotal: +(Number(p.price) * quantities[i]).toFixed(2),
    }));

    const payload = {
      userId: user.id,
      items: orderItems,
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
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 15 }}>
            {items.map((p, index) => (
              <div key={p.id} style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <img
                  src={`http://localhost:5000${p.image}`}
                  alt={p.name}
                  style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 10 }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 4px", color: "#1b5e20", fontSize: 18 }}>{p.name}</h4>
                  <div>Seller: {p.ownerName || "Unknown"}</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>৳{p.price}</div>
                </div>
                <div>
                  <button type="button" style={qtyBtnStyle} onClick={() => updateQuantity(index, "dec")}>−</button>
                  <span style={qtyBoxStyle}>{quantities[index]}</span>
                  <button type="button" style={qtyBtnStyle} onClick={() => updateQuantity(index, "inc")}>+</button>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={labelStyle}>Buyer</label>
              <input style={inputStyle} type="text" value={user?.fullName || ""} disabled />
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={user?.email || ""} disabled />
              <label style={labelStyle}>Phone *</label>
              <input style={inputStyle} type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
              <label style={labelStyle}>Shipping Address *</label>
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House, Road, Area, City, Postal" />
              <label style={labelStyle}>Payment Method</label>
              <select style={inputStyle} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="cod">Cash on Delivery</option>
                <option value="bkash">bKash</option>
                <option value="card">Credit / Debit Card</option>
              </select>
              <label style={labelStyle}>Note</label>
              <input style={inputStyle} type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
            </div>

            <div style={summaryBox}>
              <div style={summaryRow}><span>Subtotal</span><b>৳{subtotal.toFixed(2)}</b></div>
              <div style={summaryRow}><span>Shipping</span><b>৳{shipping}</b></div>
              <div style={{ ...summaryRow, fontSize: 18 }}><span>Total</span><b>৳{total}</b></div>
            </div>

            {error && <div style={errorStyle}>{error}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button type="submit" style={submitBtn} disabled={loading}>{loading ? "Placing..." : `Place Order • ৳${total}`}</button>
              <button type="button" style={cancelBtn} onClick={onClose}>Cancel</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------- Cart Modal --------------------
function CartModal({ cart, setCart, user, onClose, onOpenOrderForm }) {
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
      alert("❌You must log in to place order!");
      navigate("/login");
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    onOpenOrderForm(cart);
    onClose();
  };

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, maxWidth: "800px", width: "750px" }}>
        <div style={modalHeader}>
          <h3>Your Cart</h3>
          <button style={closeBtn} onClick={onClose}>✕</button>
        </div>
        {cart.length === 0 ? (
          <p style={{ padding: 20 }}>Your cart is empty.</p>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 16 }}>
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

// -------------------- Helper Functions --------------------
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
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [notification, setNotification] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

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
        let res;
        if (user?.role === "farmowner") {
          res = await axios.get(`http://localhost:5000/get-my-products/${user.id}`);
        } else {
          res = await axios.get(`http://localhost:5000/get-products?sort=${sortOption}`);
        }
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, [user, sortOption]);

  const handleOrder = (product) => {
  if (!user) {
    alert("❌ You must log in first to order!");
    navigate("/login"); // redirect to login
    return;
  }
  
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

    setNotification(`✅ "${product.name}" added to cart`);
    setTimeout(() => setNotification(""), 2000);
  };

  const openOrderFormWithCart = (cartItems) => {
    setSelectedProduct(null);
    setShowOrderModal(true);
  };

  const onOrderSuccess = () => {
    setShowOrderModal(false);
    setSelectedProduct(null);
    setCart([]);
    saveCartToStorage([], user);
    setNotification("✅ Order placed successfully!");
    setTimeout(() => setNotification(""), 3000);
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

  // Filtered products based on search
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div style={styles.wrapper}>
      <header style={{ ...styles.header, flexDirection: "column", alignItems: "stretch", gap: 10 }}>
  {/* Centered Title */}
  <div style={{ textAlign: "center" }}>
    <h1 style={styles.title}>🌿 AgroFarm Products</h1>
    <p style={styles.subtitle}>Welcome, {user?.fullName || "Customer"}</p>
  </div>

  {/* Controls under the title, aligned right */}
  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 15, flexWrap: "wrap" }}>
    <input
      type="text"
      placeholder="Search products..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc" }}
    />

    <select
      style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc" }}
      value={sortOption}
      onChange={(e) => setSortOption(e.target.value)}
    >
      <option value="newest">Newest First</option>
      <option value="oldest">Oldest First</option>
      <option value="price_low">Price: Low → High</option>
      <option value="price_high">Price: High → Low</option>
    </select>

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




      {notification && (
        <div style={notificationStyle}>
          {notification}
        </div>
      )}

      <div style={styles.grid}>
        {currentProducts.length === 0 ? (
          <div style={styles.noProducts}>No products found.</div>
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

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20, gap: 10 }}>
          <button
            style={paginationBtnStyle}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >Previous</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              style={{ ...paginationBtnStyle, fontWeight: num === currentPage ? "bold" : "normal" }}
              onClick={() => setCurrentPage(num)}
            >{num}</button>
          ))}
          <button
            style={paginationBtnStyle}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >Next</button>
        </div>
      )}

      {showOrderModal && (
        <OrderForm
          product={selectedProduct}
          products={selectedProduct ? null : cart}
          user={user}
          onClose={() => setShowOrderModal(false)}
          onOrderSuccess={onOrderSuccess}
        />
      )}

      {showCartModal && (
        <CartModal
          cart={cart}
          setCart={setCart}
          user={user}
          onClose={() => setShowCartModal(false)}
          onOpenOrderForm={openOrderFormWithCart}
        />
      )}
    </div>
  );
}

// -------------------- Styles --------------------
const styles = {
  wrapper: { padding: 20, fontFamily: "Arial, sans-serif" },
  header: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 10 },
  title: { fontSize: 32, margin: 0, color: "#2e7d32" },
  subtitle: { margin: 0, color: "#555" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 },
  card: { border: "1px solid #ccc", borderRadius: 10, padding: 15, display: "flex", flexDirection: "column", gap: 10 },
  imageBox: { width: "100%", height: 150, overflow: "hidden", borderRadius: 10 },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  name: { margin: 0, fontSize: 18, color: "#1b5e20" },
  desc: { margin: 0, fontSize: 14, color: "#555", minHeight: 40 },
  price: { fontWeight: 700, color: "#2e7d32" },
  owner: { fontSize: 12, color: "#888" },
  buttonGroup: { display: "flex", gap: 8, flexWrap: "wrap" },
  orderBtn: { flex: 1, padding: "6px 8px", background: "#04880dff", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
  addCartBtn: { flex: 1, padding: "6px 8px", background: "#f57f17", color: "#000000ff", border: "none", borderRadius: 6, cursor: "pointer", position: "relative" },
  deleteBtn: { flex: 1, padding: "6px 8px", background: "#e53935", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
  cartCount: { position: "absolute", top: -6, right: -6, background: "red", color: "#fff", borderRadius: "50%", padding: "2px 6px", fontSize: 12 },
  loginBtn: { padding: "6px 12px", borderRadius: 6, border: "1px solid #2e7d32", background: "#fff", color: "#2e7d32", cursor: "pointer" },
  signupBtn: { padding: "6px 12px", borderRadius: 6, border: "1px solid #2e7d32", background: "#2e7d32", color: "#fff", cursor: "pointer" },
  noProducts: { textAlign: "center", fontSize: 18, color: "#888", gridColumn: "1/-1" }
};

// -------------------- Modal Styles --------------------
const overlayStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };
const modalStyle = { background: "#fff", borderRadius: 10, padding: 20, maxHeight: "90vh", overflowY: "auto", width: "90%", maxWidth: "600px" };
const modalHeader = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const closeBtn = { border: "none", background: "transparent", fontSize: 20, cursor: "pointer" };
const qtyBtnStyle = { padding: "2px 8px", margin: "0 2px", border: "1px solid #ccc", borderRadius: 4, cursor: "pointer", background: "#eee" };
const qtyBoxStyle = { padding: "2px 6px", minWidth: 30, display: "inline-block", textAlign: "center" };
const labelStyle = { fontWeight: 600 };
const inputStyle = { padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", width: "100%" };
const summaryBox = { borderTop: "1px solid #ccc", paddingTop: 10 };
const summaryRow = { display: "flex", justifyContent: "space-between", marginTop: 4 };
const submitBtn = { padding: "8px 16px", background: "#1b5e20", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };
const cancelBtn = { padding: "8px 16px", background: "#ccc", color: "#333", border: "none", borderRadius: 6, cursor: "pointer" };
const errorStyle = { color: "red", fontWeight: 600 };
const thStyle = { textAlign: "left", borderBottom: "1px solid #ccc", padding: "6px 8px" };
const tdStyle = { padding: "6px 8px", borderBottom: "1px solid #eee" };
const notificationStyle = { position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#4caf50", color: "#fff", padding: "10px 20px", borderRadius: 6, zIndex: 10000 };
const paginationBtnStyle = { padding: "6px 10px", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer", background: "#fff" };
