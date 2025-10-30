import React, { useEffect, useState } from "react";

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/admin/reports")
      .then((res) => res.json())
      .then((data) => setReports(data))
      .catch((err) => console.error("Error fetching reports:", err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;

    try {
      const res = await fetch(`http://localhost:5000/admin/reports/${id}`, { method: "DELETE" });
      if (res.ok) setReports(reports.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div>
      <h1>Reports</h1>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.title}</td>
              <td>{r.description}</td>
              <td>
                <button style={deleteBtnStyle} onClick={() => handleDelete(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "20px" };
const deleteBtnStyle = { background: "#d32f2f", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" };
