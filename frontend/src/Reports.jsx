import React, { useEffect, useState } from "react";

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/reports");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;

    try {
      const res = await fetch(`http://localhost:5000/admin/reports/${id}`, {
        method: "DELETE",
      });
      if (res.ok) setReports(reports.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Reports</h1>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Reported Owner ID</th>
            <th>Reporter Customer ID</th>
            <th>Reason</th>
            <th>Proof URL</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.reportedFarmOwnerId}</td>
              <td>{r.reporterCustomerId}</td>
              <td>{r.reason}</td>
              <td>
                {r.proofUrl ? (
                  <a href={r.proofUrl} target="_blank" rel="noopener noreferrer">
                    View Proof
                  </a>
                ) : (
                  "N/A"
                )}
              </td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
              <td>
                <button style={deleteBtnStyle} onClick={() => handleDelete(r.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
  textAlign: "left",
};

const deleteBtnStyle = {
  background: "#d32f2f",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
};
