import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function FarmOwnerProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // ✅ success / warning / error

  // ✅ Load user info
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

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if ((formData.newPassword || formData.confirmPassword) && formData.newPassword !== formData.confirmPassword) {
      return setMessage({ text: "⚠️ New password and confirm password do not match!", type: "warning" });
    }
    if ((formData.newPassword || formData.confirmPassword) && !formData.oldPassword) {
      return setMessage({ text: "⚠️ Please enter your old password to change it.", type: "warning" });
    }

    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      const payload = { fullName: formData.fullName };
      if (formData.oldPassword && formData.newPassword) {
        payload.oldPassword = formData.oldPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await axios.put(`http://localhost:5000/users/${user.id}`, payload);

      // ✅ Success message
      setMessage({ text: "✅ Profile updated successfully!", type: "success" });

      const returnedUser = res?.data?.user || res?.data || null;
      const updatedUser =
        returnedUser && typeof returnedUser === "object" && returnedUser.id
          ? { ...returnedUser }
          : { ...user, fullName: formData.fullName };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Notify other components (like dashboard)
      window.dispatchEvent(new Event("userUpdated"));

      setFormData((prev) => ({ ...prev, oldPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err) {
      console.error(err);
      setMessage({
        text: `❌ Failed to update profile: ${err.response?.data?.message || "Server error"}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
        background: "#F0FFF4",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#2F855A",
          marginBottom: "30px",
        }}
      >
        🌾 Farm Owner Profile
      </h1>

      {/* 🧩 Message Box */}
      {message.text && (
        <div
          style={{
            padding: "12px",
            borderRadius: "5px",
            marginBottom: "20px",
            color:
              message.type === "success"
                ? "#155724"
                : message.type === "error"
                ? "#721c24"
                : "#856404",
            backgroundColor:
              message.type === "success"
                ? "#d4edda"
                : message.type === "error"
                ? "#f8d7da"
                : "#fff3cd",
            border:
              message.type === "success"
                ? "1px solid #c3e6cb"
                : message.type === "error"
                ? "1px solid #f5c6cb"
                : "1px solid #ffeeba",
          }}
        >
          {message.text}
        </div>
      )}

      {/* 📝 Update Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <h2 style={{ color: "#2e7d32" }}>Account Info</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={formData.fullName}
          required
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #CBD5E0",
          }}
        />

        <input
          type="email"
          value={user.email}
          disabled
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #CBD5E0",
            backgroundColor: "#E2E8F0",
          }}
        />

        <input
          type="text"
          value={user.role}
          disabled
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #CBD5E0",
            backgroundColor: "#E2E8F0",
          }}
        />

        <h2 style={{ color: "#2e7d32", marginTop: "20px" }}>Change Password (optional)</h2>

        <input
          type="password"
          placeholder="Old Password"
          value={formData.oldPassword}
          onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #CBD5E0",
          }}
        />

        <input
          type="password"
          placeholder="New Password"
          value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #CBD5E0",
          }}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #CBD5E0",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px",
            backgroundColor: "#38A169",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>

      {/* ✅ Back to Dashboard Button (Same as Customer) */}
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button
          onClick={() => navigate("/farm-owner-dashboard")}
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
  );
}
