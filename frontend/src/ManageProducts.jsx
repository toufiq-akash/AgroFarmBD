import React, { useEffect, useState } from "react";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    fetchReports();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/reports");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:5000/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleRestrictUser = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/users/restrict/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "block" }),
      });
      const data = await res.json();
      alert(data.message);
      fetchUsers();
    } catch (err) {
      console.error("Restrict failed:", err);
    }
  };

  const handleUnrestrictUser = async (userId) => {
    if (!window.confirm("Are you sure you want to unrestrict this user and delete their reports?")) return;
    try {
      const res1 = await fetch(`http://localhost:5000/admin/users/restrict/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unblock" }),
      });
      const data1 = await res1.json();
      alert(data1.message);

      const res2 = await fetch(`http://localhost:5000/admin/reports/delete/${userId}`, { method: "DELETE" });
      const data2 = await res2.json();
      console.log(data2.message);

      fetchUsers();
      fetchReports();
    } catch (err) {
      console.error("Unrestrict failed:", err);
    }
  };

  const getOwnerName = (userId) => {
    const owner = users.find((u) => u.id === userId);
    return owner ? owner.fullname : "N/A";
  };

  const getOwnerStatus = (userId) => {
    const owner = users.find((u) => u.id === userId);
    return owner ? owner.status : "active";
  };

  const getOwnerReports = (userId) => reports.filter((r) => r.reportedUserId === userId);

  const getStatusColor = (status) => {
    switch (status) {
      case "restricted":
        return "#d32f2f";
      case "active":
        return "#43a047";
      default:
        return "#fbc02d";
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "'Poppins', sans-serif" }}>
      <h1 style={{ marginBottom: "20px" }}>Manage Products</h1>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price (BDT)</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "12px" }}>No products found</td>
            </tr>
          ) : (
            products.map((p, i) => {
              const ownerStatus = getOwnerStatus(p.userId);
              const ownerReports = getOwnerReports(p.userId);
              return (
                <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? "#f9f9f9" : "#fff", transition: "0.3s", cursor: "default" }}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.price} BDT</td>
                  <td>{getOwnerName(p.userId)}</td>
                  <td>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      color: "#fff",
                      backgroundColor: getStatusColor(ownerStatus),
                      fontWeight: "bold",
                      fontSize: "13px"
                    }}>
                      {ownerStatus}
                    </span>
                  </td>
                  <td>
                    {ownerReports.length > 0 && ownerStatus !== "restricted" && (
                      <button style={restrictBtnStyle} onClick={() => handleRestrictUser(p.userId)}>Restrict Owner</button>
                    )}
                    {ownerStatus === "restricted" && (
                      <button style={unrestrictBtnStyle} onClick={() => handleUnrestrictUser(p.userId)}>Unrestrict Owner</button>
                    )}
                    <button style={deleteBtnStyle} onClick={() => handleDeleteProduct(p.id)}>Delete Product</button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------------- Styles ----------------
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  borderRadius: "8px",
  overflow: "hidden",
};

const deleteBtnStyle = {
  background: "#e53935",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  marginLeft: "5px",
  transition: "0.3s",
};
const restrictBtnStyle = {
  background: "#fbc02d",
  color: "#000",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "5px",
  transition: "0.3s",
};
const unrestrictBtnStyle = {
  background: "#43a047",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "5px",
  transition: "0.3s",
};
