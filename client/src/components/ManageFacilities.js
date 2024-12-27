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
  const [imageFile, setImageFile] = useState(null);
  const [selectedPublications, setSelectedPublications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch and normalize facilities
    axios.get('http://localhost:5000/api/facilities')
      .then((response) => {
        const facilitiesData = response.data;

        if (facilitiesData && typeof facilitiesData === 'object') {
          // Flatten the facilities grouped by categories
          const normalizedFacilities = Object.values(facilitiesData).flat();
          setFacilities(normalizedFacilities);
        } else {
          setError('Invalid facilities data format.');
        }
      })
      .catch((error) => {
        setError('Error fetching facilities.');
        console.error(error);
      });

    // Fetch publications
    axios.get('http://localhost:5000/api/publications')
      .then((response) => {
        const publicationsData = response.data;
        if (Array.isArray(publicationsData)) {
          setPublications(publicationsData); // Set publications directly
        } else {
          setError('Invalid publications data format.');
        }
      })
      .catch((error) => {
        setError('Error fetching publications.');
        console.error(error);
      });
  }, []);

  const handleAddFacility = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('specifications', specifications);
    formData.append('usage_details', usageDetails);
    formData.append('category_id', categoryId);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    axios.post('http://localhost:5000/api/facilities', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((response) => {
        const facilityId = response.data.facility_id;
        setFacilities([...facilities, response.data]);

        const associations = selectedPublications.map((publicationId) =>
          axios.post('http://localhost:5000/api/facility-publications', {
            facility_id: facilityId,
            publication_id: publicationId,
          })
        );

        Promise.all(associations)
          .then(() => {
            setName('');
            setDescription('');
            setSpecifications('');
            setUsageDetails('');
            setCategoryId('');
            setImageFile(null);
            setSelectedPublications([]);
          })
          .catch((error) => {
            setError('Error associating facility with publications.');
            console.error(error);
          });
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
            type="file"
            onChange={(e) => setImageFile(e.target.files[0])}
            accept="image/*"
            required
          />
          <select
            multiple
            value={selectedPublications}
            onChange={(e) =>
              setSelectedPublications([...e.target.selectedOptions].map((option) => option.value))
            }
          >
            {publications.map((pub) => (
              <option key={pub.id} value={pub.id}>
                {pub.title}
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
            facilities.map((facility) => (
              <li key={facility.facility_id}>
                <div>
                  <h4>{facility.facility_name}</h4>
                  <p>{facility.description}</p>
                  <p><strong>Specifications:</strong> {facility.specifications}</p>
                  <p><strong>Usage Details:</strong> {facility.usage_details}</p>
                  {facility.image_url && <img src={facility.image_url} alt={facility.facility_name} />}
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
