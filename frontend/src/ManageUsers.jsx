import React, { useEffect, useState } from "react";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchReports();
  }, []);

  // ---------------- FETCH ----------------
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

  // ---------------- ACTIONS ----------------
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

  const handleUnrestrict = async (id) => {
    if (!window.confirm("Unrestrict this user and delete their reports?")) return;
    try {
      const res1 = await fetch(`http://localhost:5000/admin/users/restrict/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unblock" }),
      });
      const data1 = await res1.json();
      alert(data1.message);

      await fetch(`http://localhost:5000/admin/reports/delete/${id}`, { method: "DELETE" });

      fetchUsers();
      fetchReports();
    } catch (err) {
      console.error("Unrestrict failed:", err);
    }
  };

  // ---------------- REPORT FILTER ----------------
  const getUserReports = (userId) =>
    reports.filter((r) => r.reportedFarmOwnerId === userId);

  // ---------------- USERS BY ROLE ----------------
  const customers = users.filter((u) => u.role === "Customer");
  const owners = users.filter((u) => u.role === "Owner");
  const deliverymen = users.filter((u) => u.role === "DeliveryMan");

  return (
    <div style={{ padding: "30px", fontFamily: "'Poppins', sans-serif" }}>
      <h1 style={titleStyle}>Manage Users & Reports</h1>

      <h2 style={sectionTitle}>Customers</h2>
      <UserTable
        users={customers}
        getUserReports={getUserReports}
        handleDelete={handleDelete}
        handleRestrict={handleRestrict}
        handleUnrestrict={handleUnrestrict}
      />

      <h2 style={sectionTitle}>Owners</h2>
      <UserTable
        users={owners}
        getUserReports={getUserReports}
        handleDelete={handleDelete}
        handleRestrict={handleRestrict}
        handleUnrestrict={handleUnrestrict}
      />

      <h2 style={sectionTitle}>Deliverymen</h2>
      <UserTable
        users={deliverymen}
        getUserReports={getUserReports}
        handleDelete={handleDelete}
        handleRestrict={handleRestrict}
        handleUnrestrict={handleUnrestrict}
      />
    </div>
  );
}

// ---------------------- USER TABLE ----------------------
function UserTable({ users, getUserReports, handleDelete, handleRestrict, handleUnrestrict }) {
  return (
    <div style={card}>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>ID</th>
            <th style={th}>Name</th>
            <th style={th}>Email</th>
            <th style={th}>Role</th>
            <th style={th}>Status</th>
            <th style={th}>Reports</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "15px" }}>
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => {
              const userReports = getUserReports(user.id);

              return (
                <tr key={user.id} style={row}>
                  <td style={td}>{user.id}</td>
                  <td style={td}>{user.fullname || user.fullName}</td>
                  <td style={td}>{user.email}</td>
                  <td style={td}>{user.role}</td>

                  {/* STATUS BADGE */}
                  <td style={td}>
                    <span
                      style={{
                        ...badge,
                        backgroundColor:
                          user.status === "restricted" ? "#e53935" : "#43a047",
                        color: "#fff",
                      }}
                    >
                      {user.status || "Active"}
                    </span>
                  </td>

                  {/* REPORTS BADGE */}
                  <td style={td}>
                    {userReports.length > 0 ? (
                      <span style={{ ...badge, backgroundColor: "#fdd835", color: "#000" }}>
                        {userReports.length} Report{userReports.length > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span style={{ ...badge, backgroundColor: "#c8e6c9", color: "#2e7d32" }}>
                        No Reports
                      </span>
                    )}
                  </td>

                  {/* ACTION BUTTONS */}
                  <td style={td}>
                    {userReports.length > 0 && user.status !== "restricted" && (
                      <button style={btnWarning} onClick={() => handleRestrict(user.id)}>
                        Restrict
                      </button>
                    )}

                    {user.status === "restricted" && (
                      <button style={btnSuccess} onClick={() => handleUnrestrict(user.id)}>
                        Unrestrict
                      </button>
                    )}

                    <button style={btnDanger} onClick={() => handleDelete(user.id)}>
                      Delete
                    </button>
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

// ---------------------- STYLES ----------------------

const titleStyle = {
  marginBottom: "20px",
  fontSize: "28px",
  fontWeight: "600",
  color: "#2e7d32",
};

const sectionTitle = {
  marginTop: "30px",
  marginBottom: "10px",
  fontSize: "22px",
  color: "#388e3c",
};

const card = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0px 4px 12px rgba(56, 142, 60, 0.15)",
  marginBottom: "25px",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
};

const th = {
  textAlign: "left",
  padding: "12px",
  background: "#e8f5e9",
  fontWeight: "600",
  color: "#2e7d32",
};

const td = {
  padding: "12px",
  verticalAlign: "top",
  color: "#333",
};

const row = {
  borderBottom: "1px solid #dcedc8",
  transition: "background 0.2s",
};

const badge = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: "500",
  textAlign: "center",
};

const btnDanger = {
  background: "#e53935",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "8px",
  transition: "background 0.2s",
};
const btnWarning = {
  background: "#fdd835",
  color: "#000",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "8px",
  transition: "background 0.2s",
};
const btnSuccess = {
  background: "#43a047",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "8px",
  transition: "background 0.2s",
};
