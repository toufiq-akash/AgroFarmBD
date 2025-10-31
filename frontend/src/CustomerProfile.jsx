import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CustomerProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) navigate("/login");
    else {
      setUser(storedUser);
      setFormData({
        fullName: storedUser.fullName || storedUser.fullname || "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setMessage("");

    // Password validation
    if ((formData.newPassword || formData.confirmPassword) && formData.newPassword !== formData.confirmPassword) {
      return setMessage("❌ New password and confirm password do not match!");
    }
    if ((formData.newPassword || formData.confirmPassword) && !formData.oldPassword) {
      return setMessage("❌ Please enter your old password to change it.");
    }

    try {
      setLoading(true);

      const payload = { fullName: formData.fullName };

      if (formData.oldPassword && formData.newPassword) {
        payload.oldPassword = formData.oldPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await axios.put(`http://localhost:5000/users/${user.id}`, payload);

      setMessage("✅ Profile updated successfully!");
      const updatedUser = { ...user, fullName: formData.fullName };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setFormData((prev) => ({ ...prev, oldPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>My Profile</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Full Name"
            style={inputStyle}
            required
          />
          <input
            type="email"
            value={user.email}
            disabled
            style={{ ...inputStyle, background: "#f0f0f0", cursor: "not-allowed" }}
          />
          <input
            type="text"
            value={user.role || "Customer"}
            disabled
            style={{ ...inputStyle, background: "#f0f0f0", cursor: "not-allowed" }}
          />

          <h3 style={{ color: "#2e7d32", marginBottom: "10px", marginTop: "20px" }}>Change Password (optional)</h3>
          <input
            type="password"
            placeholder="Old Password"
            value={formData.oldPassword}
            onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="New Password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            style={inputStyle}
          />

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
        {message && (
          <p style={{ ...messageStyle, color: message.includes("failed") ? "#d32f2f" : "#388e3c" }}>{message}</p>
        )}
        <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button
          onClick={() => navigate("/customer-dashboard")}
          style={{
            backgroundColor: "#078ee2ff",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
      </div>
    </div>
  );
}

// ----- Styles -----
const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #e0f2f1, #ffffff)",
  fontFamily: "'Poppins', sans-serif",
  padding: "20px",
};

const card = {
  background: "#fff",
  padding: "40px 30px",
  borderRadius: "20px",
  width: "400px",
  boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
  textAlign: "center",
  transition: "0.3s",
};

const title = {
  color: "#2e7d32",
  marginBottom: "25px",
  fontSize: "28px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 15px",
  marginBottom: "20px",
  borderRadius: "12px",
  border: "1px solid #ccc",
  fontSize: "14px",
  outline: "none",
  boxShadow: "inset 0 2px 5px rgba(0,0,0,0.05)",
  transition: "0.3s",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  background: "linear-gradient(90deg, #2e7d32, #66bb6a)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "0.3s",
};

const messageStyle = {
  marginTop: "15px",
  fontWeight: "500",
};

const backStyle = {
  marginTop: "20px",
  color: "#555",
  fontSize: "14px",
  cursor: "pointer",
  textDecoration: "underline",
};
