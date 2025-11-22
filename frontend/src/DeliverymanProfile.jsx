import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function DeliverymanProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [deliverymanProfile, setDeliverymanProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    status: "active",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [message, setMessage] = useState("");

  // Load user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  // Fetch deliveryman profile when user is available
  useEffect(() => {
    if (user?.id) {
      fetchDeliverymanProfile(user.id);
    }
  }, [user]);

  // Fetch deliveryman profile from deliverymen table
  const fetchDeliverymanProfile = async (deliverymanId) => {
    try {
      setLoadingProfile(true);
      const res = await axios.get(`http://localhost:5000/deliveryman/profile/${deliverymanId}`);
      setDeliverymanProfile(res.data);
      const currentUser = JSON.parse(localStorage.getItem("user")) || user;
      setFormData({
        fullName: res.data.fullname || currentUser?.fullName || currentUser?.fullname || "",
        phone: res.data.phone || "",
        email: res.data.email || currentUser?.email || "",
        status: res.data.status || "active",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Failed to load deliveryman profile:", err);
      // Set defaults if profile doesn't exist
      const currentUser = JSON.parse(localStorage.getItem("user")) || user;
      setFormData({
        fullName: currentUser?.fullName || currentUser?.fullname || "",
        phone: "",
        email: currentUser?.email || "",
        status: "active",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

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

      // Update user account (fullName and password)
      const userPayload = { fullName: formData.fullName };
      if (formData.oldPassword && formData.newPassword) {
        userPayload.oldPassword = formData.oldPassword;
        userPayload.newPassword = formData.newPassword;
      }

      await axios.put(`http://localhost:5000/users/${user.id}`, userPayload);

      // Update deliveryman profile in deliverymen table
      const deliverymanPayload = {
        fullname: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        status: formData.status,
      };

      await axios.put(`http://localhost:5000/deliveryman/profile/${user.id}`, deliverymanPayload);

      setMessage("✅ Profile updated successfully!");
      const updatedUser = { ...user, fullName: formData.fullName };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Refresh deliveryman profile
      await fetchDeliverymanProfile(user.id);

      setFormData((prev) => ({ ...prev, oldPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user || loadingProfile) {
    return (
      <div style={container}>
        <div style={card}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>My Profile</h2>
        {deliverymanProfile && (
          <div style={{ marginBottom: "20px", padding: "15px", background: "#e8f5e9", borderRadius: "8px" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#2e7d32" }}>💰 Total Earnings</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "#1b5e20", margin: 0 }}>
              ৳{deliverymanProfile.earnings || "0.00"}
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <h3 style={{ color: "#2e7d32", marginBottom: "10px", marginTop: "20px" }}>Personal Information</h3>
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
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Phone Number"
            style={inputStyle}
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email"
            style={inputStyle}
            required
          />
          <select
            name="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            style={inputStyle}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input
            type="text"
            value={user.role || "DeliveryMan"}
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
            onClick={() => navigate("/deliveryman-dashboard")}
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
  width: "450px",
  maxWidth: "90vw",
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

