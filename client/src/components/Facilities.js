import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Facilities.css';

const Facilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/facilities');
        setFacilities(response.data);
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="facilities">
      {facilities.map((facility) => (
        <div key={facility.facility_id} className="facility-item">
          <h3>
            <Link to={`/facility/${facility.facility_id}`}>{facility.facility_name}</Link>
          </h3>
          <p>{facility.description}</p>
          {facility.image_url ? (
            <img 
              src={facility.image_url} 
              alt={facility.facility_name} 
              className="facility-image" 
            />
          ) : (
            <p>No image available</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Facilities;
