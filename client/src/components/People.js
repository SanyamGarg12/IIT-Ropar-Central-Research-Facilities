import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './People.css';

const People = () => {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch members from the backend
    axios.get('http://localhost:5000/api/members')
      .then((response) => {
        console.log('Fetched members:', response.data);
        setMembers(response.data);
      })
      .catch((error) => {
        console.error('Error fetching members:', error);
        setError('Failed to fetch members. Please try again later.');
      });
  }, []);

  // Group members by designation
  const chairman = members.find((member) => member.designation.toLowerCase() === 'chairman');
  const viceChairman = members.find((member) => member.designation.toLowerCase() === 'vice chairman');
  const others = members.filter(
    (member) =>
      member.designation.toLowerCase() !== 'chairman' &&
      member.designation.toLowerCase() !== 'vice chairman'
  );

  // // Function to construct image URL dynamically
  // const getImageUrl = (imagePath) => {
  //   if (!imagePath) return null; // No image available

  //   // If image is from the public/assets folder
  //   const assetImagePath = `${imagePath}`;

  //   // Check if the image exists in the assets folder first
  //   if (imagePath.startsWith('assets/')) {
  //     return assetImagePath; // Return path if found in assets folder
  //   }

  //   // Otherwise, return the URL pointing to the server's uploads folder
  //   return `http://localhost:5000/uploads/${imagePath}`;
  // };

  return (
    <div className="people-container">
      <h1>Core Committee Members</h1>
      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="hierarchy">
          {chairman && (
            <div className="chairman">
              <h2>Chairman</h2>
              <div className="person-card">
                <div className="person-image">
                  {chairman.image_path ? (
                    {/* <img
                      src={getImageUrl(chairman.image_path)} // Use dynamic image URL function
                      alt={chairman.name}
                    /> */}
                  ) : (
                    <div className="placeholder">No Image Available</div>
                  )}
                </div>
                <div className="person-info">
                  <h3>{chairman.name}</h3>
                  <p>{chairman.designation}</p>
                  {chairman.profile_link && (
                    <a 
                      href={chairman.profile_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Profile
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {viceChairman && (
            <div className="vice-chairman">
              <h2>Vice Chairman</h2>
              <div className="person-card">
                <div className="person-image">
                  {viceChairman.image_path ? (
                    {/* <img
                      src={getImageUrl(viceChairman.image_path)} // Use dynamic image URL function
                      alt={viceChairman.name}
                    /> */}
                  ) : (
                    <div className="placeholder">No Image Available</div>
                  )}
                </div>
                <div className="person-info">
                  <h3>{viceChairman.name}</h3>
                  <p>{viceChairman.designation}</p>
                  {viceChairman.profile_link && (
                    <a 
                      href={viceChairman.profile_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Profile
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div className="other-members">
              <h2>Other Members</h2>
              <div className="people-list">
                {others.map((member) => (
                  <div className="person-card" key={member.id}>
                    <div className="person-image">
                      {member.image_path ? (
                        {/* <img
                          src={getImageUrl(member.image_path)} // Use dynamic image URL function
                          alt={member.name}
                        /> */}
                      ) : (
                        <div className="placeholder">No Image Available</div>
                      )}
                    </div>
                    <div className="person-info">
                      <h3>{member.name}</h3>
                      <p>{member.designation}</p>
                      {member.profile_link && (
                        <a 
                          href={member.profile_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          View Profile
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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

export default People;
