import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Facilities.css";  // Import the CSS for facilities page

const Facilities = () => {
  const [facilities, setFacilities] = useState({});

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/facilities')
      .then((response) => {
        setFacilities(response.data); 
      })
      .catch((error) => {
        console.error('Error fetching facilities:', error);
      });
  }, []);

  return (
    <div className="facilities-container">
      <h2>Our Facilities</h2>
      {Object.keys(facilities).length === 0 ? (
        <div>Loading...</div>
      ) : (
        Object.keys(facilities).map((category) => (
          <div key={category}>
            <h3>{category}</h3>
            <div className="facility-list">
              {facilities[category].map((facility) => (
                <div key={facility.facility_id} className="facility-item">
                  <h4>{facility.facility_name}</h4>
                  <img src={facility.image_url} alt={facility.facility_name} />
                  <p>{facility.description}</p>
                  <Link to={`/facility/${facility.facility_id}`}>View Details</Link>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact-us">Contact Us</a></li>
              <li><a href="/publications">Publications</a></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Contact</h4>
            <p>Email: info@iitrpr.ac.in</p>
            <p>Phone: +91-12345-67890</p>
          </div>
          <div className="footer-social">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    
  );
};

export default Facilities;
