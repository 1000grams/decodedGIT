import React, { useState } from 'react';
import { FaInstagram, FaYoutube, FaDiscord } from 'react-icons/fa';

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add logic to send form data to your backend or email service
  };

  return (
    <div className="contact-form" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#111' }}>Get in Touch</h1>
      <p style={{ marginBottom: '1.5rem', color: '#555' }}>
        We'd love to hear from you! Whether you have a question, feedback, or just want to connect, feel free to reach out.
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontSize: '1rem',
            }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontSize: '1rem',
            }}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Message:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              height: '100px',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: '#00FF84',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '5px',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Send Message
        </button>
      </form>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>Other Ways to Connect</h2>
        <p style={{ marginBottom: '1rem', color: '#555' }}>Follow us on social media or send us a direct message:</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <a
            href="https://www.instagram.com/kaiserinstreetwear/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#E1306C', fontSize: '2rem' }}
          >
            <FaInstagram />
          </a>
          <a
            href="https://www.youtube.com/@ruedevivre/releases"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#FF0000', fontSize: '2rem' }}
          >
            <FaYoutube />
          </a>
          <a
            href="https://discord.com/invite/6Txu7wUW"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#7289DA', fontSize: '2rem' }}
          >
            <FaDiscord />
          </a>
        </div>
      </div>

      <p style={{ color: '#555' }}>
        Or tap into our <a href="https://open.spotify.com/playlist/4BFQN83x5VenHywmXIUC9X" target="_blank" rel="noopener noreferrer" style={{ color: '#00FF84', textDecoration: 'underline' }}>Spotify Playlist</a> to vibe with us!
      </p>
    </div>
  );
};

export default ContactForm;