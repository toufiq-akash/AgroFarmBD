import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({ userCount: 0, productCount: 0, orderCount: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  const menuItems = [
    { name: "Dashboard", path: "/admin-dashboard" },
    { name: "Manage Users", path: "/admin/users" },
    { name: "Manage Products", path: "/admin/products" },
    { name: "Manage Orders", path: "/admin/orders" },
    { name: "Feedbacks", path: "/admin/feedbacks" },
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
        <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
          <StatCard title="Users" count={stats.userCount} />
          <StatCard title="Products" count={stats.productCount} />
          <StatCard title="Orders" count={stats.orderCount} />
        </div>
      </main>
    </div>
  );
}

const StatCard = ({ title, count }) => (
  <div style={{ flex: 1, padding: "25px", background: "white", borderRadius: "12px", boxShadow: "0 5px 15px rgba(0,0,0,0.1)", textAlign: "center" }}>
    <h3>{title}</h3>
    <p style={{ fontSize: "28px", fontWeight: "bold", marginTop: "10px" }}>{count}</p>
  </div>
);
