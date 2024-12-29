import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Facilities.css';

const Facilities = () => {
  const [facilitiesByCategory, setFacilitiesByCategory] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch facilities grouped by categories
    axios
      .get('http://localhost:5000/api/facilities')
      .then((response) => {
        const facilities = response.data;

        // Group facilities by category
        const groupedFacilities = facilities.reduce((grouped, facility) => {
          const categoryName = facility.category_name;
          if (!grouped[categoryName]) {
            grouped[categoryName] = [];
          }
          grouped[categoryName].push(facility);
          return grouped;
        }, {});

        setFacilitiesByCategory(groupedFacilities);
      })
      .catch((err) => {
        console.error(err);
        setError('Error fetching facilities.');
      });
  }, []);

  return (
    <div className="facilities-container">
      <h2>Facilities</h2>
      {error && <p className="error-message">{error}</p>}
      {Object.keys(facilitiesByCategory).length > 0 ? (
        Object.entries(facilitiesByCategory).map(([categoryName, facilities]) => (
          <div key={categoryName} className="category-section">
            <h3>{categoryName}</h3>
            <p className="category-description">{facilities[0].category_description}</p>
            <ul>
              {facilities.map((facility) => (
                <li key={facility.id}>
                  <Link to={`/facility/${facility.id}`}>
                    {facility.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No facilities available.</p>
      )}
    </div>
  );
};

export default Facilities;
