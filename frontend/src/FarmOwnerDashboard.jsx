import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function FarmOwnerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: null,
    description: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(5);

  // Auth + load user
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) navigate("/login");
        else setUser(storedUser);
      } catch {
        navigate("/login");
      }
    };
    loadUser();
    window.addEventListener("userUpdated", loadUser);
    return () => window.removeEventListener("userUpdated", loadUser);
  }, [navigate]);

  // Fetch products
  const fetchProducts = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`http://localhost:5000/get-my-products/${user.id}`);
      setProducts(res.data);
      setCurrentPage(1); // Reset to first page on fetch
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.id) fetchProducts();
  }, [user]);

  // Add product
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

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/delete-product/${id}`, { data: { userId: user.id } });
      setProducts(products.filter((p) => p.id !== id));
      alert("✅ Product deleted!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "❌ Failed to delete product");
    }
  };

  // Edit product
  const handleEditClick = (product) => {
    setEditProduct(product);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", editProduct.name);
      formData.append("price", editProduct.price);
      formData.append("description", editProduct.description);
      formData.append("userId", user.id);
      if (editProduct.image instanceof File) {
        formData.append("image", editProduct.image);
      }

      await axios.put(`http://localhost:5000/update-product/${editProduct.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Product updated!");
      setShowEditForm(false);
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update product");
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditProduct(null);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/hero");
  };

  // Button hover style
  const buttonStyle = {
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    transition: "0.3s",
  };
  const sidebarButtonHover = (e) => (e.target.style.backgroundColor = "#1B7A2E");
  const sidebarButtonLeave = (e) => (e.target.style.backgroundColor = "#38A169");

  // Pagination calculations
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = products.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(products.length / productsPerPage);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "250px",
          backgroundColor: "#0b6709ff",
          color: "#fff",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "30px" }}>🌾 AgroFarmBD</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={() => navigate("/farm-owner-dashboard")}
              style={{ ...buttonStyle, backgroundColor: "#1B5E20" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#154D1A")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#1B5E20")}
            >
              Dashboard
            </button>
            <button
              onClick={() => alert("Orders clicked")}
              style={{ ...buttonStyle, backgroundColor: "#38A169" }}
              onMouseEnter={sidebarButtonHover}
              onMouseLeave={sidebarButtonLeave}
            >
              Orders
            </button>
            <button
              onClick={() => alert("Delivery clicked")}
              style={{ ...buttonStyle, backgroundColor: "#38A169" }}
              onMouseEnter={sidebarButtonHover}
              onMouseLeave={sidebarButtonLeave}
            >
              Delivery
            </button>
            <button
              onClick={() => alert("Reports clicked")}
              style={{ ...buttonStyle, backgroundColor: "#38A169" }}
              onMouseEnter={sidebarButtonHover}
              onMouseLeave={sidebarButtonLeave}
            >
              Reports
            </button>
            <button
              onClick={() => navigate("/farm-owner-profile")}
              style={{ ...buttonStyle, backgroundColor: "#38A169" }}
              onMouseEnter={sidebarButtonHover}
              onMouseLeave={sidebarButtonLeave}
            >
              Profile
            </button>
          </div>
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
            transition: "0.3s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#C53030")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#E53E3E")}
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "30px", backgroundColor: "#F0FFF4" }}>
        <header
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}
        >
          <div>
            <h1 style={{ marginBottom: "10px" }}>Farm Owner Dashboard</h1>
            <p>
              Welcome back, <b>{user.fullName || user.fullname || "Farm Owner"}</b>
            </p>
          </div>
          <button
            onClick={() => navigate("/farm-owner-profile")}
            style={{
              backgroundColor: "#0b6709ff",
              color: "#fff",
              border: "none",
              padding: "10px 15px",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#2563A6")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#3182CE")}
          >
            View Profile
          </button>
        </header>

        {/* Add Product Form */}
        <section style={{ marginBottom: "30px" }}>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowEditForm(false);
            }}
            style={{
              marginRight: "10px",
              padding: "10px 15px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#0b6709ff",
              color: "#fff",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#2F855A")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#38A169")}
          >
            {showAddForm ? "Cancel" : "Add Product"}
          </button>

          {/* Add Form */}
          {showAddForm && (
            <section
              style={{
                marginTop: "20px",
                backgroundColor: "#ffffff",
                padding: "25px",
                borderRadius: "15px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              }}
            >
              <h2 style={{ marginBottom: "20px", color: "#2F855A" }}>Add New Product</h2>
              <form onSubmit={handleAddProduct} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  required
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E0" }}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Price (per KG)"
                  value={newProduct.price}
                  required
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E0" }}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                />
                <textarea
                  placeholder="Description"
                  value={newProduct.description}
                  required
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E0" }}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#38A169",
                    color: "#fff",
                    padding: "10px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "0.3s",
                  }}
                >
                  Add Product
                </button>
              </form>
            </section>
          )}

          {/* Edit Form */}
          {showEditForm && editProduct && (
            <section
              style={{
                marginTop: "20px",
                backgroundColor: "#ffffff",
                padding: "25px",
                borderRadius: "15px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              }}
            >
              <h2 style={{ marginBottom: "20px", color: "#2F855A" }}>Edit Product</h2>
              <form onSubmit={handleUpdateProduct} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={editProduct.name}
                  required
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E0" }}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Price (per KG)"
                  value={editProduct.price}
                  required
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E0" }}
                  onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditProduct({ ...editProduct, image: e.target.files[0] })}
                />
                <textarea
                  placeholder="Description"
                  value={editProduct.description}
                  required
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E0" }}
                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#3182CE",
                    color: "#fff",
                    padding: "10px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Update Product
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    backgroundColor: "#A0AEC0",
                    color: "#fff",
                    padding: "10px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </form>
            </section>
          )}
        </section>

        {/* Products Table */}
        <section
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ marginBottom: "15px" }}>My Products</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#E6FFFA" }}>
                <th>Image</th>
                <th>Product</th>
                <th>Price (per KG)</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #CBD5E0" }}>
                  <td style={{ padding: "10px" }}>
                    <img
                      src={`http://localhost:5000${p.image}`}
                      alt={p.name}
                      style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                    />
                  </td>
                  <td style={{ padding: "10px" }}>{p.name}</td>
                  <td style={{ padding: "10px" }}>{p.price}</td>
                  <td style={{ padding: "10px" }}>{p.description}</td>
                  <td style={{ padding: "10px", display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleEditClick(p)}
                      style={{
                        backgroundColor: "#3182CE",
                        color: "#fff",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      style={{
                        backgroundColor: "#E53E3E",
                        color: "#fff",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ marginTop: "15px", display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: "5px 10px",
                borderRadius: "5px",
                border: "none",
                backgroundColor: currentPage === 1 ? "#A0AEC0" : "#38A169",
                color: "#fff",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>
            <span style={{ alignSelf: "center" }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: "5px 10px",
                borderRadius: "5px",
                border: "none",
                backgroundColor: currentPage === totalPages ? "#A0AEC0" : "#38A169",
                color: "#fff",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
