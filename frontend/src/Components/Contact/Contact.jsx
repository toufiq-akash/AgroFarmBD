import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Send formData to backend here if needed

    // Show success message
    setSuccess(true);

    // Reset all fields
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });

    // Hide success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <section id="contact" className="contact-section">
      <h2>Contact Us</h2>
      <p>Have questions or suggestions? Reach out to us and we’ll respond as soon as possible.</p>
      <div className="contact-container">
        {/* Contact info */}
        <div className="contact-info">
          <p><strong>Email:</strong> support@agrofarming.bd</p>
          <p><strong>Phone:</strong> +880 123 456 789</p>
          <p><strong>Address:</strong> FarmGate, Dhaka, Bangladesh</p>
        </div>

        {/* Contact form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
          />
          <button type="submit">Send Message</button>
          {success && <p className="success-message">Your message has been sent!</p>}
        </form>
      </div>
    </section>
  );
};

export default Contact;
