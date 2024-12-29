import React, { useState, useEffect } from 'react';
import './About.css';
import axios from 'axios';

function About() {
  const [aboutContent, setAboutContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the about content from the backend API
    axios.get('http://localhost:5000/api/aboutContent')
      .then((response) => {
        setAboutContent(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching about content:', error);
        setError('Failed to load about content');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>{error}</div>;
  }
  
  if (!aboutContent) {
    return <div>No content available</div>;
  }

  return (
    // console.log(aboutContent),
    <section className="about">
      {/* Message from the Director */}
      <h2>{aboutContent.messageFromDirector.title}</h2>
      <div className="about-content">
        <img src="/assets/director.jpg" alt="Director" className="director-image" />
        <div className="about-text">
          {aboutContent.messageFromDirector.content.map((para, index) => (
            <p key={index}>{para}</p>
          ))}
        </div>
      </div>

      {/* Department Introduction */}
      <section className="department-intro">
        <h3>{aboutContent.departmentIntro.title}</h3>
        <div className="intro-content">
          <div className="intro-text">
            <p>{aboutContent.departmentIntro.content}</p>
          </div>
        <img src="/assets/DepartmentImage.jpg" alt="Department Building" className="department-image" />

        </div>
      </section>

      {/* Objectives of the Lab */}
      <section className="lab-objectives">
        <h3>{aboutContent.labObjectives.title}</h3>
        <ul>
          {aboutContent.labObjectives.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      {/* Vision and Mission */}
      <section className="vision-mission">
        <div className="vision">
          <h3>Vision</h3>
          <p>{aboutContent.visionMission.vision}</p>
        </div>
        <div className="mission">
          <h3>Mission</h3>
          <p>{aboutContent.visionMission.mission}</p>
        </div>
      </section>

      {/* Footer Section */}
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
    </section>
  );
}

export default About;
