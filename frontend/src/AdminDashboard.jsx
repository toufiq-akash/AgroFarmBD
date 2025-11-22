import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalReports: 0,
    restrictedUsers: 0,
  });

  const [userRoles, setUserRoles] = useState({ Customers: 0, Owners: 0, DeliveryMen: 0 });
  const [recentReports, setRecentReports] = useState([]);

  const [modalImage, setModalImage] = useState(null); // For proof modal

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const resUsers = await fetch("http://localhost:5000/admin/users");
      const users = await resUsers.json();

      const totalUsers = users.length;
      const restrictedUsers = users.filter((u) => u.status === "restricted").length;
      const Customers = users.filter((u) => u.role === "Customer").length;
      const Owners = users.filter((u) => u.role === "Owner").length;
      const DeliveryMen = users.filter((u) => u.role === "DeliveryMan").length;

      const resProducts = await fetch("http://localhost:5000/admin/products");
      const products = await resProducts.json();
      const totalProducts = products.length;

      const resOrders = await fetch("http://localhost:5000/admin/orders");
      const orders = await resOrders.json();
      const totalOrders = orders.length;

      const resReports = await fetch("http://localhost:5000/admin/reports");
      const reports = await resReports.json();
      const totalReports = reports.length;
      const recentReports = reports.slice(-5).reverse();

      setStats({ totalUsers, totalProducts, totalOrders, totalReports, restrictedUsers });
      setUserRoles({ Customers, Owners, DeliveryMen });
      setRecentReports(recentReports);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin-dashboard" },
    { name: "Manage Users", path: "/admin/users" },
    { name: "Manage Products", path: "/admin/products" },
    { name: "Manage Orders", path: "/admin/orders" },
    { name: "Reports", path: "/admin/reports" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: "250px", background: "#2e7d32", color: "#fff", padding: "30px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <h2>Admin Panel</h2>
          <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
            {menuItems.map((item) => (
              <li
                key={item.name}
                onClick={() => navigate(item.path)}
                style={{
                  padding: "10px 0",
                  cursor: "pointer",
                  fontWeight: location.pathname === item.path ? "bold" : "normal",
                  color: location.pathname === item.path ? "#a5d6a7" : "#fff",
                }}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => navigate("/login")}
          style={{ background: "#d32f2f", border: "none", color: "white", padding: "10px", borderRadius: "8px", cursor: "pointer", marginTop: "20px" }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px", background: "#f5f7fa" }}>
        <h1>Welcome, Admin</h1>

        {/* ------------------ STAT CARDS ------------------ */}
        <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
          <StatCard title="Total Users" count={stats.totalUsers} color="#1976d2" onClick={() => navigate("/admin/users")} />
          <StatCard title="Total Products" count={stats.totalProducts} color="#388e3c" onClick={() => navigate("/admin/products")} />
          <StatCard title="Total Orders" count={stats.totalOrders} color="#fbc02d" onClick={() => navigate("/admin/orders")} />
          <StatCard title="Total Reports" count={stats.totalReports} color="#d32f2f" onClick={() => navigate("/admin/reports")} />
          <StatCard title="Restricted Users" count={stats.restrictedUsers} color="#7b1fa2" onClick={() => navigate("/admin/users?status=restricted")} />
        </div>

        {/* ------------------ USER ROLES ------------------ */}
        <div style={{ marginTop: "40px" }}>
          <h2>User Roles</h2>
          <div style={{ display: "flex", gap: "20px", marginTop: "15px" }}>
            <StatCard title="Customers" count={userRoles.Customers} color="#64b5f6" onClick={() => navigate("/admin/users?role=Customer")} />
            <StatCard title="Owners" count={userRoles.Owners} color="#81c784" onClick={() => navigate("/admin/users?role=Owner")} />
            <StatCard title="DeliveryMen" count={userRoles.DeliveryMen} color="#ffb74d" onClick={() => navigate("/admin/users?role=DeliveryMan")} />
          </div>
        </div>

        {/* ------------------ RECENT REPORTS ------------------ */}
        <div style={{ marginTop: "40px" }}>
          <h2>Recent Reports</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Reported Owner</th>
                <th>Reporter</th>
                <th>Reason</th>
                <th>Proof</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>No recent reports</td>
                </tr>
              ) : (
                recentReports.map((r) => (
                  <tr key={r.id} style={{ cursor: "pointer" }}>
                    <td>{r.id}</td>
                    <td>{r.reportedFarmOwnerId}</td>
                    <td>{r.reporterCustomerId}</td>
                    <td>{r.reason}</td>
                    <td>
                      {r.proofUrl ? (
                        <button
                          onClick={() => setModalImage(`http://localhost:5000/uploads/${r.proofUrl}`)}
                          style={{ background: "none", border: "none", color: "#1976d2", cursor: "pointer" }}
                        >
                          View
                        </button>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ---------------- IMAGE MODAL ---------------- */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <img
            src={modalImage}
            alt="Report Proof"
            style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "12px", boxShadow: "0 5px 20px rgba(0,0,0,0.5)" }}
          />
        </div>
      )}
    </div>
  );
}

// ---------------- STAT CARD COMPONENT ----------------
const StatCard = ({ title, count, color, onClick }) => (
  <div
    onClick={onClick}
    style={{
      flex: 1,
      padding: "25px",
      borderRadius: "12px",
      background: color,
      color: "#fff",
      textAlign: "center",
      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
      cursor: "pointer",
    }}
  >
    <h3>{title}</h3>
    <p style={{ fontSize: "28px", fontWeight: "bold", marginTop: "10px" }}>{count}</p>
  </div>
);

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "15px",
  border: "1px solid #ccc",
  textAlign: "left",
};
