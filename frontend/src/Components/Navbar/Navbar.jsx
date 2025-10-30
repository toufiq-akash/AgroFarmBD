import React, { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "../../assets/logo1.png";

const Navbar = () => {
  const [sticky, setSticky] = useState(false);
  const [active, setActive] = useState("home");

  const handleScroll = () => {
    const sections = ["home", "about", "services", "contact"];
    let current = "home";

    sections.forEach((id) => {
      const section = document.getElementById(id);
      if (section && window.scrollY >= section.offsetTop - 60) current = id;
    });

    setActive(current);
    window.scrollY > 500 ? setSticky(true) : setSticky(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={`container ${sticky ? "dark-nav" : ""}`}>
      <img src={logo} alt="logo" className="logo" />
      <ul>
        <li onClick={() => scrollTo("home")} className={active === "home" ? "active" : ""}>Home</li>
        <li onClick={() => scrollTo("about")} className={active === "about" ? "active" : ""}>About</li>
        <li onClick={() => scrollTo("services")} className={active === "services" ? "active" : ""}>Services</li>
        <li onClick={() => scrollTo("contact")} className={active === "contact" ? "active" : ""}>Contact</li>
        <li><button className="btn" onClick={() => window.location.href="/login"}>Login</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;
