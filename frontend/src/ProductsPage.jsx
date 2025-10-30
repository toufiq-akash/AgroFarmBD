import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);

  // Check user authentication
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (user?.role === "farmowner") {
          // FarmOwner sees only their products
          const res = await axios.get(`http://localhost:5000/get-my-products/${user.id}`);
          setProducts(res.data);
        } else {
          // Customer or unauthorized sees all products
          const res = await axios.get("http://localhost:5000/get-products");
          setProducts(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, [user]);

  // Handle ordering a product
  const handleOrder = (product) => {
    if (!user) {
      alert("❌ You must log in first to order!");
      return;
    }
    alert(`✅ Order placed for ${product.name}!`);
  };

  // Handle deleting a product (FarmOwner)
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/delete-product/${id}`, {
          data: { userId: user.id } // send logged-in user's ID
        });
        setProducts(products.filter((p) => p.id !== id));
        alert("✅ Product deleted successfully!");
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "❌ Failed to delete product");
      }
    }
  };

  // Inline styling
  const styles = {
    wrapper: { minHeight: "100vh", background: "linear-gradient(135deg, #e8f5e9, #f1f8e9)", padding: "30px 10%", fontFamily: "'Poppins', sans-serif", color: "#333" },
    header: { textAlign: "center", marginBottom: "40px" },
    title: { fontSize: "2.5rem", color: "#2e7d32", fontWeight: "700" },
    subtitle: { color: "#666", fontSize: "1rem", marginTop: "5px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "25px" },
    card: { background: "#fff", borderRadius: "15px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", overflow: "hidden", transition: "transform 0.3s, box-shadow 0.3s", cursor: "pointer" },
    image: { width: "100%", height: "180px", objectFit: "cover", transition: "transform 0.3s ease" },
    name: { fontSize: "1.3rem", fontWeight: "600", margin: "15px", color: "#2e7d32" },
    desc: { fontSize: "0.95rem", color: "#555", margin: "0 15px 10px", height: "50px", overflow: "hidden" },
    price: { fontSize: "1.1rem", fontWeight: "600", color: "#1b5e20", margin: "0 15px 5px" },
    owner: { fontSize: "0.85rem", color: "#555", margin: "0 15px 10px" },
    orderBtn: { display: "block", margin: "0 auto 15px", padding: "10px 20px", backgroundColor: "#66bb6a", color: "#fff", border: "none", borderRadius: "25px", fontSize: "1rem", cursor: "pointer", transition: "background 0.3s" },
    deleteBtn: { display: "block", margin: "0 auto 15px", padding: "10px 20px", backgroundColor: "#E53E3E", color: "#fff", border: "none", borderRadius: "25px", fontSize: "1rem", cursor: "pointer", transition: "background 0.3s" },
    loginSignupWrapper: { display: "flex", justifyContent: "center", gap: "15px", marginBottom: "20px" },
    loginBtn: { padding: "8px 20px", borderRadius: "25px", border: "none", backgroundColor: "#3182CE", color: "#fff", cursor: "pointer" },
    signupBtn: { padding: "8px 20px", borderRadius: "25px", border: "none", backgroundColor: "#38A169", color: "#fff", cursor: "pointer" },
    noProducts: { textAlign: "center", fontSize: "1.1rem", color: "#777", marginTop: "40px" },
  };

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.title}>🌿 AgroFarm Products</h1>
        <p style={styles.subtitle}>Welcome, {user?.fullName || "Customer"}</p>
      </header>

      {!user && (
        <div style={styles.loginSignupWrapper}>
          <button style={styles.loginBtn} onClick={() => navigate("/login")}>Log In</button>
          <button style={styles.signupBtn} onClick={() => navigate("/signup")}>Sign Up</button>
        </div>
      )}

      <div style={styles.grid}>
        {products.length > 0 ? (
          products.map((p) => (
            <div
              style={styles.card}
              key={p.id}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)"; }}
            >
              <img
                src={`http://localhost:5000${p.image}`}
                alt={p.name}
                style={styles.image}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
              <h3 style={styles.name}>{p.name}</h3>
              <p style={styles.desc}>{p.description}</p>
              <p style={styles.price}>৳{p.price}</p>
              {user?.role !== "farmowner" && (
                <p style={styles.owner}>Seller: <b>{p.ownerName || "Unknown"}</b></p>
              )}
              <button
                style={styles.orderBtn}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#43a047")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#66bb6a")}
                onClick={() => handleOrder(p)}
              >
                Order Now
              </button>

              {user?.role === "farmowner" && (
                <button
                  style={styles.deleteBtn}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#C53030")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#E53E3E")}
                  onClick={() => handleDelete(p.id)}
                >
                  Delete Product
                </button>
              )}
            </div>
          ))
        ) : (
          <p style={styles.noProducts}>No products available yet.</p>
        )}
      </div>
    </div>
  );
}
