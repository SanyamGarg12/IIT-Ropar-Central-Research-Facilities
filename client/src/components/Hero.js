import React, { useState } from "react";
import Videos from "./Videos"; // Import the Videos component
import "./Hero.css";

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    {
      src: "/assets/sample.jpeg",
      title: "Dr. John Doe",
      subtitle: "Director of IITRPR",
    },
    {
      src: "/assets/sample.jpeg",
      title: "Prof. Jane Smith",
      subtitle: "Head of Research",
    },
    {
      src: "/assets/sample.jpeg",
      title: "Dr. Michael Lee",
      subtitle: "Dean of Facilities",
    },
  ];

  // Handle image switching
  const handleScroll = (direction) => {
    if (direction === "left") {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    } else {
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }
  };

  return (
    <div className="hero-container">
      {/* Image Slider Section */}
      <div className="image-slider">
        {/* Left Scroll Button */}
        <button className="scroll-btn left-btn" onClick={() => handleScroll("left")}>
          &#9664;
        </button>

        {/* Image Display */}
        <div className="image-container">
          <img src={images[currentIndex].src} alt={`Slide ${currentIndex + 1}`} className="hero-image" />
          <div className="image-overlay">
            <h2>{images[currentIndex].title}</h2>
            <p>{images[currentIndex].subtitle}</p>
          </div>
        </div>

        {/* Right Scroll Button */}
        <button className="scroll-btn right-btn" onClick={() => handleScroll("right")}>
          &#9654;
        </button>
      </div>

      {/* Videos Section */}
      <div className="videos-section">
        <h2>Featured Videos</h2>
        <Videos />
      </div>

      {/* Recent Publications Section */}
      <div className="publications-section">
        <h2>Recent Publications</h2>
        <ul>
          <li>Title of Publication 1</li>
          <li>Title of Publication 2</li>
          <li>Title of Publication 3</li>
          {/* Add more publication titles as needed */}
        </ul>
      </div>

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
              <p>Email: info@iiitd.ac.in</p>
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

export default Hero;
