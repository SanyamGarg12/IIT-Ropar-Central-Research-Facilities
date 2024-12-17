import React from 'react';
import './About.css';

function About() {
  return (
    <section className="about">
      <h2>Message from the Director</h2>
      <div className="about-content">
        <img src="/assets/director.jpg" alt="Director" className="director-image" />
        <div className="about-text">
          <p>
            Welcome to the IITRPR Central Research Facility, a premier research hub dedicated to fostering innovation 
            and cutting-edge technological advancements. Our facility serves as a platform for students, researchers, 
            and professionals to collaborate and achieve excellence in their respective fields.
          </p>
          <p>
            Under the leadership of our esteemed Director, we strive to empower the research community 
            with state-of-the-art infrastructure and facilities. Together, we are committed to advancing 
            knowledge and contributing to the growth of society.
          </p>
        </div>
      </div>

      {/* Department Introduction */}
      <section className="department-intro">
        <h3>About the Department</h3>
        <div className="intro-content">
          <div className="intro-text">
            <p>
              The Department of Computer Science and Engineering at NITK is committed to providing an innovative 
              learning environment, fostering research, and preparing students for the challenges of the future. 
              Our department is at the forefront of technological advancements, offering cutting-edge education 
              and conducting impactful research in various domains of computer science.
            </p>
          </div>
          <img src="/assets/department-building.jpg" alt="Department Building" className="department-image" />
        </div>
      </section>

      {/* Objectives of the Lab */}
      <section className="lab-objectives">
        <h3>Objectives of the Lab</h3>
        <ul>
          <li>To conduct high-quality research in the fields of AI, Machine Learning, and Data Science.</li>
          <li>To promote interdisciplinary research and collaboration with industry partners.</li>
          <li>To provide students with hands-on experience in real-world applications of computer science.</li>
          <li>To develop innovative solutions that address current societal and technological challenges.</li>
        </ul>
      </section>

      {/* Vision and Mission */}
      <section className="vision-mission">
        <div className="vision">
          <h3>Vision</h3>
          <p>
            Our vision is to be a global leader in computer science education and research, producing innovative 
            solutions that drive societal progress and technological transformation.
          </p>
        </div>
        <div className="mission">
          <h3>Mission</h3>
          <p>
            Our mission is to foster a creative and collaborative research environment that encourages intellectual 
            curiosity, develops cutting-edge technologies, and produces well-rounded professionals who are ready 
            to meet the challenges of the modern world.
          </p>
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
