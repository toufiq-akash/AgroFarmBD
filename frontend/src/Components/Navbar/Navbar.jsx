import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/logo1.png";

const Navbar = () => {
  const [sticky, setSticky] = useState(false);
  const [active, setActive] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleScroll = () => {
    const sections = ["home", "about", "services", "contact"];
    let current = "home";
    sections.forEach((id) => {
      const section = document.getElementById(id);
      if (section && window.scrollY >= section.offsetTop - 60) current = id;
    });
    setActive(current);
    window.scrollY > 80 ? setSticky(true) : setSticky(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    // Check login state
    const storedUser = localStorage.getItem("user");
    setIsLoggedIn(!!storedUser);

    // Monitor logout/login in same tab
    const interval = setInterval(() => {
      const storedUser = localStorage.getItem("user");
      setIsLoggedIn(!!storedUser);
    }, 500);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, [location]);

  const handleLoginLogout = () => {
    if (isLoggedIn) {
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      navigate("/"); // Stay on Hero after logout
    } else {
      navigate("/login");
    }
  };

  const scrollTo = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={sticky ? "dark-nav" : ""}>
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
        
      </div>

      <ul>
        <li onClick={() => scrollTo("home")} className={active === "home" ? "active" : ""}>Home</li>
        <li onClick={() => scrollTo("about")} className={active === "about" ? "active" : ""}>About</li>
        <li onClick={() => scrollTo("services")} className={active === "services" ? "active" : ""}>Services</li>
        <li onClick={() => scrollTo("contact")} className={active === "contact" ? "active" : ""}>Contact</li>
        <li>
          <button
            className={`btn ${isLoggedIn ? "logout-btn" : "login-btn"}`}
            onClick={handleLoginLogout}
          >
            {isLoggedIn ? "Logout" : "Login"}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
