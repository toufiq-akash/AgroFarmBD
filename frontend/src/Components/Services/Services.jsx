// src/Components/Services/Services.jsx
import React from 'react';
import './Services.css';

// Placeholder icons (replace with your own images if needed)
import inventoryIcon from '../../assets/inventory.png';
import alertIcon from '../../assets/alert.png';
import usageIcon from '../../assets/usage.png';
import supplierIcon from '../../assets/supplier.png';
import reportIcon from '../../assets/report.jpg';

const servicesData = [
  {
    icon: inventoryIcon,
    title: 'Inventory Management',
    description: 'Add, update, and track all farm resources.'
  },
  {
    icon: alertIcon,
    title: 'Stock Alerts',
    description: 'Get notified when stock is low to prevent shortages.'
  },
  {
    icon: usageIcon,
    title: 'Usage Logs',
    description: 'Track resource usage for each crop and field.'
  },
  {
    icon: supplierIcon,
    title: 'Supplier Management',
    description: 'Maintain supplier details and order history.'
  },
  {
    icon: reportIcon,
    title: 'Reports & Analytics',
    description: 'Generate insights for better farm decisions.'
  }
];

const Services = () => {
  return (
    <section id="services" className="services-section">
      <h2>Our Services</h2>
      <div className="services-grid">
        {servicesData.map((service, index) => (
          <div key={index} className="service-card">
            <img src={service.icon} alt={service.title} className="service-icon"/>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
