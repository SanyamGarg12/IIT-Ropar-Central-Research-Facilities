import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageFacilities.css';

const ManageFacilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [publications, setPublications] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [usageDetails, setUsageDetails] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedPublications, setSelectedPublications] = useState([]); // Array to hold selected publication IDs
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch existing facilities
    axios.get('http://localhost:5000/api/facilities')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setFacilities(response.data);
        } else {
          setError('Failed to fetch facilities: Invalid data format.');
        }
      })
      .catch((error) => {
        setError('Error fetching facilities.');
        console.error(error);
      });

    // Fetch existing publications
    axios.get('http://localhost:5000/api/publications')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setPublications(response.data);
        } else {
          setError('Failed to fetch publications: Invalid data format.');
        }
      })
      .catch((error) => {
        setError('Error fetching publications.');
        console.error(error);
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

    // Send POST request to add a new facility
    axios.post('http://localhost:5000/api/facilities', newFacility)
      .then((response) => {
        const facilityId = response.data.facility_id;
        setFacilities([...facilities, response.data]);
        
        // Now associate the new facility with selected publications
        selectedPublications.forEach((publicationId) => {
          axios.post('http://localhost:5000/api/facility-publications', {
            facility_id: facilityId,
            publication_id: publicationId
          }).catch((error) => {
            setError('Error associating facility with publication.');
            console.error(error);
          });
        });

        setName('');
        setDescription('');
        setSpecifications('');
        setUsageDetails('');
        setCategoryId('');
        setImageUrl('');
        setSelectedPublications([]);
      })
      .catch((error) => {
        setError('Error adding facility.');
        console.error(error);
      });
  };

  const handleDeleteFacility = (facilityId) => {
    axios.delete(`http://localhost:5000/api/facilities/${facilityId}`)
      .then(() => {
        setFacilities(facilities.filter((facility) => facility.facility_id !== facilityId));
      })
      .catch((error) => {
        setError('Error deleting facility.');
        console.error(error);
      });
  };

  return (
    <div className="manage-facilities-container">
      <h2>Manage Facilities</h2>

      {error && <p className="error-message">{error}</p>}

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
          <select 
            multiple 
            value={selectedPublications} 
            onChange={(e) => setSelectedPublications([...e.target.selectedOptions].map(option => option.value))}
          >
            {publications.map(pub => (
              <option key={pub.publication_id} value={pub.publication_id}>
                {pub.title} {/* Assume 'title' is the property in the publication */}
              </option>
            ))}
          </select>
          <button type="submit">Add Facility</button>
        </form>
      </div>

      <div className="existing-facilities-container">
        <h3>Existing Facilities</h3>
        <ul>
          {facilities.length > 0 ? (
            facilities.map(facility => (
              <li key={facility.facility_id}>
                <div>
                  <h4>{facility.name}</h4>
                  <p>{facility.description}</p>
                  <p><strong>Specifications:</strong> {facility.specifications}</p>
                  <p><strong>Usage Details:</strong> {facility.usage_details}</p>
                  {facility.image_url && <img src={facility.image_url} alt={facility.name} />}
                </div>
                <button onClick={() => handleDeleteFacility(facility.facility_id)}>Delete</button>
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
