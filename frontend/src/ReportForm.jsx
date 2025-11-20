// ReportForm.jsx
import React, { useState } from "react";
import axios from "axios";

export default function ReportForm({ reportedOwnerId, orderId, reporterCustomerId }) {
  const [reason, setReason] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [message, setMessage] = useState("");

 const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Submitting report...", { reportedOwnerId, orderId, reporterCustomerId, reason, proofUrl });

  try {
   const res = await axios.post("http://localhost:5000/report", {
  reportedFarmOwnerId,
  reporterCustomerId,
  reason,
  proofUrl,
});

    console.log("Response:", res.data);
    setMessage(res.data.message);
    setReason("");
    setProofUrl("");
  } catch (err) {
    console.error("Axios error:", err);
    setMessage(err.response?.data?.message || "Failed to submit report");
  }
};


  return (
    <form onSubmit={handleSubmit} className="report-form">
      <textarea
        placeholder="Reason for report"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Proof URL (optional)"
        value={proofUrl}
        onChange={(e) => setProofUrl(e.target.value)}
      />
      <button type="submit">Submit Report</button>
      {message && <p>{message}</p>}
    </form>
  );
}
