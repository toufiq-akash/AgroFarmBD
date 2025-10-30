import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CustomerProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ id: "", fullname: "", email: "", role: "Customer" });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) navigate("/login");
    else setUser({ id: parseInt(storedUser.id, 10) || "", ...storedUser });
  }, [navigate]);

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!user.id) {
      setMessage("⚠️ User ID missing, cannot update profile.");
      setLoading(false);
      return;
    }

    const updateData = {};
    if (user.fullname.trim() !== "") updateData.fullname = user.fullname;
    if (user.email.trim() !== "") updateData.email = user.email;
    if (oldPassword && newPassword) {
      updateData.oldPassword = oldPassword;
      updateData.newPassword = newPassword;
    }

    if (Object.keys(updateData).length === 0) {
      setMessage("Nothing to update");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        const updatedUser = { ...user };
        if (updateData.fullname) updatedUser.fullname = updateData.fullname;
        if (updateData.email) updatedUser.email = updateData.email;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Update failed. Please try again.");
    } finally {
      setLoading(false);
      setOldPassword("");
      setNewPassword("");
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>My Profile</h2>
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            name="fullname"
            value={user.fullname}
            onChange={handleChange}
            placeholder="Full Name"
            style={inputStyle}
          />
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            placeholder="Email"
            style={inputStyle}
          />
          <input
            type="password"
            name="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Old Password"
            style={inputStyle}
          />
          <input
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            style={inputStyle}
          />
          <input
            type="text"
            name="role"
            value={user.role}
            readOnly
            style={{ ...inputStyle, background: "#f0f0f0", cursor: "not-allowed" }}
          />
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
        {message && <p style={{ ...messageStyle, color: message.includes("failed") ? "#d32f2f" : "#388e3c" }}>{message}</p>}
        <p style={backStyle} onClick={() => navigate("/customer-dashboard")}>
          ← Back to Dashboard
        </p>
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
