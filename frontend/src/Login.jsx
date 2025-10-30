import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroBg from "./assets/About2.jpeg"; // path thik ache kina check kor

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        // ✅ Backend must return full user info including 'id'
        const userInfo = data.user;
        if (!userInfo || !userInfo.id) {
          setMessage("⚠️ Login failed: User ID missing");
          setLoading(false);
          return;
        }

        // ✅ Save user to localStorage for dashboard & profile update
        localStorage.setItem("user", JSON.stringify(userInfo));

        // ✅ Navigate based on role
        const role = userInfo.role?.toLowerCase();
        setTimeout(() => {
          if (role === "customer") navigate("/customer-dashboard");
          else if (role === "owner") navigate("/farm-owner-dashboard");
          else if (role === "admin") navigate("/admin-dashboard");
          else navigate("/"); // fallback
        }, 500);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: `linear-gradient(rgba(8,0,58,0.6), rgba(8,0,58,0.6)), url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(3px)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          padding: "40px 50px",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          width: "400px",
          textAlign: "center",
          transition: "all 0.3s ease",
        }}
      >
        <h1 style={{ color: "#2e7d32", marginBottom: "8px" }}>🌿 AgroFarmBD</h1>
        <p style={{ color: "#666", marginBottom: "25px" }}>Login to your account</p>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />

          <label style={labelStyle}>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required style={inputStyle} />

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && <p style={{ color: message.includes("failed") ? "#d32f2f" : "#388e3c", marginTop: "15px", fontWeight: "500" }}>{message}</p>}

        <p style={{ marginTop: "25px", color: "#555" }}>
          Don’t have an account?{" "}
          <span onClick={() => navigate("/signup")} style={{ color: "#1b5e20", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px 12px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px", outline: "none", transition: "0.3s" };
const labelStyle = { display: "block", textAlign: "left", fontWeight: "600", color: "#2e7d32", marginBottom: "5px" };
const buttonStyle = { width: "100%", padding: "12px", background: "#2e7d32", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", marginTop: "20px", cursor: "pointer", transition: "0.3s" };
