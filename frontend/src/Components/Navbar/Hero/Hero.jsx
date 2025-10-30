import React from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="hero" id="home">
      <div className="hero-text">
        <h1>Welcome to AgroFarmingBD</h1>
        <p>Your trusted partner in modern agriculture</p>
        <button
          className="btn"
          onClick={() => navigate("/products")} // Redirect to products page
        >
          Explore Here
        </button>
      </div>
    </div>
  );
};

export default Hero;
