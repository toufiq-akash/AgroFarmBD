import React, { useEffect, useState } from "react";

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/admin/feedbacks")
      .then((res) => res.json())
      .then((data) => setFeedbacks(data))
      .catch((err) => console.error("Error fetching feedbacks:", err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;

    try {
      const res = await fetch(`http://localhost:5000/admin/feedbacks/${id}`, { method: "DELETE" });
      if (res.ok) setFeedbacks(feedbacks.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div>
      <h1>Feedbacks</h1>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Message</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((f) => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.user || "N/A"}</td>
              <td>{f.message}</td>
              <td>
                <button style={deleteBtnStyle} onClick={() => handleDelete(f.id)}>Delete</button>
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
