import React, { useEffect, useState } from "react";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/admin/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`http://localhost:5000/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div>
      <h1>Manage Products</h1>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Owner</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>${p.price}</td>
              <td>{p.owner || "N/A"}</td>
              <td>
                <button style={deleteBtnStyle} onClick={() => handleDelete(p.id)}>Delete</button>
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
