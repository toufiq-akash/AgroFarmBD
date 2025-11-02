import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";

const Hero = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // ✅ Detect changes in localStorage automatically
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    // Listen for changes to localStorage (logout/login)
    window.addEventListener("storage", handleStorageChange);

    // Also check periodically (in case of same tab logout)
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleExplore = () => {
    navigate("/products");
  };

  const handleBackToDashboard = () => {
    if (!user) return;
    if (user.role === "Customer") navigate("/customer-dashboard");
    else if (user.role === "Owner") navigate("/farm-owner-dashboard");
    else if (user.role === "Admin") navigate("/admin-dashboard");
  };

  return (
    <div className="hero" id="home">
      <div className="hero-text">
        <h1>Welcome to AgroFarmingBD</h1>
        <p>Your trusted partner in modern agriculture</p>

        <div className="hero-buttons">
          <button className="btn explore-btn" onClick={handleExplore}>
            Explore Here
          </button>

          {user && (
            <button className="btn dashboard-btn" onClick={handleBackToDashboard}>
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
