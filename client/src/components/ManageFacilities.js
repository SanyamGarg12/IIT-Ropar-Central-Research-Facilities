import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageFacilities.css';

const ManageFacilities = () => {
  // State for facilities and publications
  const [facilities, setFacilities] = useState([]);
  const [publications, setPublications] = useState([]);

  // State for form inputs
  const [name, setName] = useState('');
  const [makeYear, setMakeYear] = useState('');
  const [model, setModel] = useState('');
  const [facultyInCharge, setFacultyInCharge] = useState('');
  const [contactPersonContact, setContactPersonContact] = useState('');
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [usageDetails, setUsageDetails] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [selectedPublications, setSelectedPublications] = useState([]);

  // Error handling
  const [error, setError] = useState(null);

  // Fetch facilities and publications on component mount
  useEffect(() => {
    // Fetch facilities
    axios.get('http://localhost:5000/api/facilities')
      .then((response) => {
        const facilitiesData = response.data;

        if (facilitiesData && typeof facilitiesData === 'object') {
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
          setPublications(publicationsData);
        } else {
          setError('Invalid publications data format.');
        }
      })
      .catch((error) => {
        setError('Error fetching publications.');
        console.error(error);
      });
  }, []);

  // Add a new facility
  const handleAddFacility = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('make_year', makeYear);
    formData.append('model', model);
    formData.append('faculty_in_charge', facultyInCharge);
    formData.append('contact_person_contact', contactPersonContact);
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
        const facilityId = response.data.id;
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
            setMakeYear('');
            setModel('');
            setFacultyInCharge('');
            setContactPersonContact('');
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

  // Delete a facility
  const handleDeleteFacility = (id) => {
    axios.delete(`http://localhost:5000/api/facilities/${id}`)
      .then(() => {
        setFacilities(facilities.filter((facility) => facility.id !== id));
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
          <input
            type="text"
            placeholder="Make Year"
            value={makeYear}
            onChange={(e) => setMakeYear(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Faculty In Charge"
            value={facultyInCharge}
            onChange={(e) => setFacultyInCharge(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Contact Person Contact"
            value={contactPersonContact}
            onChange={(e) => setContactPersonContact(e.target.value)}
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
              <li key={facility.id}>
                <div>
                  <h4>{facility.name}</h4>
                  <p><strong>Make Year:</strong> {facility.make_year}</p>
                  <p><strong>Model:</strong> {facility.model}</p>
                  <p><strong>Faculty In Charge:</strong> {facility.faculty_in_charge}</p>
                  <p><strong>Contact:</strong> {facility.contact_person_contact}</p>
                  <p><strong>Description:</strong> {facility.description}</p>
                  <p><strong>Specifications:</strong> {facility.specifications}</p>
                  <p><strong>Usage Details:</strong> {facility.usage_details}</p>
                  {facility.image_url && <img src={facility.image_url} alt={facility.name} />}
                </div>
                <button onClick={() => handleDeleteFacility(facility.id)}>Delete</button>
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
