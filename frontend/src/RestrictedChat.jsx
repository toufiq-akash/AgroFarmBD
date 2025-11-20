import React, { useEffect, useState } from "react";
import axios from "axios";

export default function RestrictedChat() {
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get logged-in user info from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return;
    setUser(storedUser);
  }, []);

  // Fetch messages between restricted user and admin
  const fetchMessages = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`http://localhost:5000/messages/${user.id}`);
      setChatMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // refresh every 3s
    return () => clearInterval(interval);
  }, [user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    try {
      await axios.post("http://localhost:5000/messages", {
        senderId: user.id,
        receiverId: 1, // admin id
        message: newMessage,
      });
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", fontFamily: "sans-serif" }}>
      <h2>Chat with Admin</h2>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "400px",
          overflowY: "auto",
          marginBottom: "10px",
          backgroundColor: "#f9f9f9",
        }}
      >
        {chatMessages.map((msg) => (
          <p key={msg.id} style={{ margin: "5px 0" }}>
            <strong>{msg.senderName}:</strong> {msg.message}
          </p>
        ))}
      </div>
      <textarea
        rows={3}
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
        style={{ width: "100%", padding: "8px", marginBottom: "5px", borderRadius: "6px", border: "1px solid #ccc" }}
      />
      <button
        onClick={handleSendMessage}
        style={{
          width: "100%",
          padding: "12px",
          background: "#2e7d32",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        Send
      </button>
    </div>
  );
}
