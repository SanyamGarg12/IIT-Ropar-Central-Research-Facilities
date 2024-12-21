import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageFacilities.css';

const ManageFacilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [usageDetails, setUsageDetails] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // Fetch existing facilities
    axios.get('http://localhost:5000/api/facilities')
      .then((response) => {
        // Ensure that the response is an array before updating state
        if (Array.isArray(response.data)) {
          setFacilities(response.data);
        } else {
          console.error('Invalid response format:', response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching facilities:', error);
      });
  }, []);

  const handleAddFacility = (e) => {
    e.preventDefault();

    const newFacility = {
      name,
      description,
      specifications,
      usage_details: usageDetails,
      category_id: categoryId,
      image_url: imageUrl
    };

    axios.post('http://localhost:5000/api/facilities', newFacility)
      .then(() => {
        setFacilities([...facilities, newFacility]);
        // Clear form after submission
        setName('');
        setDescription('');
        setSpecifications('');
        setUsageDetails('');
        setCategoryId('');
        setImageUrl('');
      })
      .catch((error) => {
        console.error('Error adding facility:', error);
      });
  };

  const handleDeleteFacility = (facilityId) => {
    axios.delete(`http://localhost:5000/api/facilities/${facilityId}`)
      .then(() => {
        setFacilities(facilities.filter(facility => facility.facility_id !== facilityId));
      })
      .catch((error) => {
        console.error('Error deleting facility:', error);
      });
  };

  return (
    <div className="manage-facilities-container">
      <h2>Manage Facilities</h2>

      {/* Form to add new facility */}
      <div className="facility-form-container">
        <h3>Add New Facility</h3>
        <form onSubmit={handleAddFacility} className="facility-form">
          <input 
            type="text" 
            placeholder="Facility Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          <textarea 
            placeholder="Description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
          />
          <textarea 
            placeholder="Specifications" 
            value={specifications} 
            onChange={(e) => setSpecifications(e.target.value)} 
            required 
          />
          <textarea 
            placeholder="Usage Details" 
            value={usageDetails} 
            onChange={(e) => setUsageDetails(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Category ID" 
            value={categoryId} 
            onChange={(e) => setCategoryId(e.target.value)} 
            required 
          />
          <input 
            type="url" 
            placeholder="Image URL (Google Drive link)" 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)} 
            required 
          />
          <button type="submit">Add Facility</button>
        </form>
      </div>

      {/* Existing facilities list */}
      <div className="existing-facilities-container">
        <h3>Existing Facilities</h3>
        <ul>
          {facilities && facilities.length > 0 ? (
            facilities.map(facility => (
              <li key={facility.facility_id}>
                <div>
                  <h4>{facility.facility_name}</h4>
                  <p>{facility.description}</p>
                  <p>{facility.specifications}</p>
                  <p>{facility.usage_details}</p>
                  <img src={facility.image_url} alt={facility.facility_name} />
                </div>
                <button onClick={() => handleDeleteFacility(facility.facility_id)}>
                  Delete
                </button>
              </li>
            ))
          ) : (
            <p>No facilities available.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ManageFacilities;
