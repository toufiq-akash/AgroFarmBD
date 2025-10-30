import React, { useEffect, useState } from "react";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchReports();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Fetch all reports
  const fetchReports = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/reports");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`http://localhost:5000/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      alert(data.message);
      fetchUsers();
      fetchReports();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Restrict user
  const handleRestrict = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/users/restrict/${id}`, {
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

  // Unrestrict user and delete their reports
  const handleUnrestrict = async (id) => {
    if (!window.confirm("Are you sure you want to unrestrict this user and delete their reports?")) return;

    try {
      // 1️⃣ Unrestrict user
      const res1 = await fetch(`http://localhost:5000/admin/users/restrict/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unblock" }),
      });
      const data1 = await res1.json();
      alert(data1.message);

      // 2️⃣ Delete all reports of this user
      const res2 = await fetch(`http://localhost:5000/admin/reports/delete/${id}`, {
        method: "DELETE",
      });
      const data2 = await res2.json();
      console.log(data2.message);

      // Refresh users and reports
      fetchUsers();
      fetchReports();
    } catch (err) {
      console.error("Unrestrict failed:", err);
    }
  };

  // Get reports for a specific user
  const getUserReports = (userId) => reports.filter((r) => r.reportedUserId === userId);

  return (
    <div style={{ padding: "30px", fontFamily: "'Poppins', sans-serif" }}>
      <h1>Manage Users</h1>
      <table style={tableStyle}>
        <thead>
          <tr style={headerStyle}>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Reports</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const userReports = getUserReports(user.id);
            return (
              <tr key={user.id} style={rowStyle}>
                <td>{user.id}</td>
                <td>{user.fullname || user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status || "active"}</td>
                <td>
                  {userReports.length > 0
                    ? userReports.map((r) => (
                        <div key={r.id}>
                          {r.reason} - <b>{r.reporterName}</b>
                        </div>
                      ))
                    : "No Reports"}
                </td>
                <td>
                  {userReports.length > 0 && user.status !== "restricted" && (
                    <button style={restrictBtnStyle} onClick={() => handleRestrict(user.id)}>
                      Restrict
                    </button>
                  )}
                  {user.status === "restricted" && (
                    <button style={unrestrictBtnStyle} onClick={() => handleUnrestrict(user.id)}>
                      Unrestrict
                    </button>
                  )}
                  <button style={deleteBtnStyle} onClick={() => handleDelete(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Styles
const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "20px" };
const headerStyle = { borderBottom: "2px solid #ccc" };
const rowStyle = { borderBottom: "1px solid #eee" };
const deleteBtnStyle = {
  background: "#d32f2f",
  color: "#fff",
  border: "none",
  padding: "5px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  marginLeft: "5px",
};
const restrictBtnStyle = {
  background: "#fbc02d",
  color: "#000",
  border: "none",
  padding: "5px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "5px",
};
const unrestrictBtnStyle = {
  background: "#388e3c",
  color: "#fff",
  border: "none",
  padding: "5px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "5px",
};
