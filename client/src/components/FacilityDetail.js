import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './FacilityDetail.css';

function FacilityDetail() {
  const { id } = useParams(); // Get facility ID from the URL
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // useNavigate hook instead of useHistory

  // Fetch facility details from the API
  useEffect(() => {
    const fetchFacilityDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/facility/${id}`);
        const data = await response.json();

        if (data.length > 0) {
          setFacility(data[0]); // Set the first (and only) facility's details
        } else {
          // Handle the case where no facility was found
          alert("Facility not found");
          navigate('/'); // Redirect to home page if facility not found
        }
      } catch (error) {
        console.error('Error fetching facility details:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchFacilityDetails();
  }, [id, navigate]);

  // Handle loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!facility) {
    return <div>No facility data available.</div>;
  }

  return (
    <div className="facility-detail">
      <h1>{facility.facility_name}</h1>
      <img src={facility.image_url} alt={facility.facility_name} className="facility-image" />
      <div className="facility-info">
        <h2>Description:</h2>
        <p>{facility.description}</p>
        <h2>Specifications:</h2>
        <p>{facility.specifications}</p>
        <h2>Usage Details:</h2>
        <p>{facility.usage_details}</p>
        <h2>Category:</h2>
        <p>{facility.category_name}</p>
        {facility.publication_title && (
          <>
            <h2>Publications:</h2>
            <p>
              <a href={facility.publication_link} target="_blank" rel="noopener noreferrer">
                {facility.publication_title}
              </a>
            </p>
          </>
        )}
      </div>
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
}

export default FacilityDetail;
