import React from 'react';
import Navbar from './Components/Navbar/Navbar.jsx';
import Hero from './Components/Navbar/Hero/Hero.jsx';
import About from './Components/About/About.jsx';
import Services from './Components/Services/Services.jsx';
import Contact from './Components/Contact/Contact.jsx';

const Homepage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <div className="container">
        <About />
        <Services />
        <Contact />
      </div>
    </>
  );
};

export default Homepage;
