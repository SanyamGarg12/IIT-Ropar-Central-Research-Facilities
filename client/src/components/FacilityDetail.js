import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './FacilityDetail.css';

function FacilityDetail() {
  const { id } = useParams(); // Get facility ID from the URL
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // useNavigate hook

  // Fetch facility details from the API
  useEffect(() => {
    const fetchFacilityDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/facility/${id}`);
        const data = await response.json();

        if (data) {
          setFacility(data); // Set the facility's details
        } else {
          // Handle the case where no facility was found
          alert('Facility not found');
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
      <h1>{facility.name}</h1>
      <img src={facility.image_url} alt={facility.name} className="facility-image" />
      <div className="facility-info">
        <h2>Description:</h2>
        <p>{facility.description}</p>
        <h2>Specifications:</h2>
        <p>{facility.specifications}</p>
        <h2>Usage Details:</h2>
        <p>{facility.usage_details}</p>
        <h2>Category:</h2>
        <p>{facility.category_name}</p>
        <h2>Make Year:</h2>
        <p>{facility.make_year}</p>
        <h2>Model:</h2>
        <p>{facility.model}</p>
        <h2>Faculty In-Charge:</h2>
        <p>{facility.faculty_in_charge}</p>
        <h2>Faculty Contact:</h2>
        <p>{facility.faculty_contact}</p>
        <h2>Faculty Email:</h2>
        <p>{facility.faculty_email}</p>
        <h2>Operator Name:</h2>
        <p>{facility.operator_name}</p>
        <h2>Operator Contact:</h2>
        <p>{facility.operator_contact}</p>
        <h2>Operator Email:</h2>
        <p>{facility.operator_email}</p>
        {facility.publications && facility.publications.length > 0 && (
          <>
            <h2>Publications:</h2>
            <ul>
              {facility.publications.map((publication, index) => (
                <li key={index}>
                  <a
                    href={publication.publication_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {publication.publication_title}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default FacilityDetail;
