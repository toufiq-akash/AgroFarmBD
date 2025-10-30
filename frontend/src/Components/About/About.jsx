import React from 'react';
import './About.css';
import about_img from '../../assets/about1.jpg';
import play_icon from '../../assets/about_icon.png';

const About = () => {
  return (
    <section id="about" className='about'>
      <div className="about-left">
        <img src={about_img} alt="" className='about-img'/>
        <img src={play_icon} alt="" className='play-icon'/>
      </div>
      <div className="about-right">
        <h3>About Us</h3>
        <h2>To simplify sales and purchase tracking for better financial management</h2>
        <p>
          AgroFarmBD is a modern platform designed to help farmers and 
          farm managers efficiently manage their agricultural resources. With this 
          system, you can easily track seeds, fertilizers, pesticides, tools, and 
          equipment, ensuring nothing goes to waste. It allows you to monitor stock 
          levels, generate reports, and keep records of resource usage for each field 
          or crop. By organizing farm operations digitally, it saves time, reduces 
          errors, and helps make informed decisions for better productivity. Whether 
          managing a small farm or multiple fields, Agrofarming Inventory provides 
          the tools to streamline operations, improve efficiency, and support 
          sustainable farming practices.
        </p>
        
        <p>
          AgroFarmBD is designed to empower farmers and farm managers
          by providing an easy-to-use platform to efficiently manage farm resources. 
          From tracking seeds, fertilizers, and tools to monitoring usage and stock levels, 
          our system helps reduce waste, save time, and make informed decisions 
          for a more productive and sustainable farm. With Agrofarming Inventory, 
          managing your farm has never been easier.
        </p>
      </div>
    </section>
  )
}

export default About;
