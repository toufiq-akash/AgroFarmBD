import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function FarmOwnerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: null,
    description: "",
  });

  // ✅ Auth check
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) navigate("/login");
    else setUser(storedUser);
  }, [navigate]);

  // ✅ Fetch farmowner's products
  const fetchProducts = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`http://localhost:5000/get-my-products/${user.id}`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.id) fetchProducts();
  }, [user]);

  // ✅ Add product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("price", newProduct.price);
      formData.append("description", newProduct.description);
      formData.append("userId", user.id);
      formData.append("image", newProduct.image);

      await axios.post("http://localhost:5000/add-product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Product added!");
      setNewProduct({ name: "", price: "", image: null, description: "" });
      setShowAddForm(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add product");
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ✅ View Products Page
  const handleViewProductsPage = () => {
    navigate("/products"); // user info is already in localStorage
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "250px",
          backgroundColor: "#2F855A",
          color: "#fff",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "30px" }}>🌾 AmarAgroBD</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "15px", fontWeight: "bold" }}>Dashboard</li>
            <li style={{ marginBottom: "15px" }}>Orders</li>
            <li style={{ marginBottom: "15px" }}>Delivery</li>
            <li style={{ marginBottom: "15px" }}>Reports</li>
            <li style={{ marginBottom: "15px" }}>Profile</li>
          </ul>
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#E53E3E",
            border: "none",
            color: "#fff",
            padding: "10px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "30px", backgroundColor: "#F0FFF4" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1 style={{ marginBottom: "10px" }}>Farm Owner Dashboard</h1>
            <p>
              Welcome back, <b>{user.fullName || "Farm Owner"}</b>
            </p>
          </div>
          <button
            onClick={() => alert("Profile coming soon!")}
            style={{
              backgroundColor: "#3182CE",
              color: "#fff",
              border: "none",
              padding: "10px 15px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            View Profile
          </button>
        </header>

        <section style={{ marginBottom: "30px" }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              marginRight: "10px",
              padding: "10px 15px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#38A169",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {showAddForm ? "Cancel" : "Add Product"}
          </button>

          {/* <button
            onClick={handleViewProductsPage}
            style={{
              padding: "10px 15px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#3182CE",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            View Products Page
          </button> */}
        </section>

        {/* Add Product Form */}
        {showAddForm && (
          <section
            style={{
              marginBottom: "30px",
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ marginBottom: "15px" }}>Add New Product</h2>
            <form
              onSubmit={handleAddProduct}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                required
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                style={{ padding: "10px", borderRadius: "5px", border: "1px solid #CBD5E0" }}
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                required
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                style={{ padding: "10px", borderRadius: "5px", border: "1px solid #CBD5E0" }}
              />
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                style={{ padding: "10px", borderRadius: "5px", border: "1px solid #CBD5E0" }}
              />
              <textarea
                placeholder="Description"
                value={newProduct.description}
                required
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                style={{ padding: "10px", borderRadius: "5px", border: "1px solid #CBD5E0" }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: "#38A169",
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Add Product
              </button>
            </form>
          </section>
        )}

        {/* Products Table */}
        <section style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
          <h2 style={{ marginBottom: "15px" }}>My Products</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#E6FFFA" }}>
                <th>Image</th>
                <th>Product</th>
                <th>Price (৳)</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #CBD5E0" }}>
                  <td style={{ padding: "10px" }}>
                    <img
                      src={`http://localhost:5000${p.image}`}
                      alt={p.name}
                      style={{ width: "60px", height: "60px", objectFit: "cover" }}
                    />
                  </td>
                  <td style={{ padding: "10px" }}>{p.name}</td>
                  <td style={{ padding: "10px" }}>{p.price}</td>
                  <td style={{ padding: "10px" }}>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
