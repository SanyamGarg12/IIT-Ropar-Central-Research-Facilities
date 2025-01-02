import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageFacilities.css";

const ManageFacilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [publications, setPublications] = useState([]);

  // State for form inputs
  const [name, setName] = useState("");
  const [makeYear, setMakeYear] = useState("");
  const [model, setModel] = useState("");
  const [facultyInCharge, setFacultyInCharge] = useState("");
  const [facultyContact, setFacultyContact] = useState("");
  const [facultyEmail, setFacultyEmail] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [operatorContact, setOperatorContact] = useState("");
  const [operatorEmail, setOperatorEmail] = useState("");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [usageDetails, setUsageDetails] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priceInternal, setPriceInternal] = useState("0.00");
  const [priceExternal, setPriceExternal] = useState("0.00");
  const [priceRandD, setPriceRandD] = useState("0.00");
  const [priceIndustry, setPriceIndustry] = useState("0.00");
  const [imageFile, setImageFile] = useState(null);
  const [selectedPublications, setSelectedPublications] = useState([]);

  const [error, setError] = useState(null);

  // Fetch facilities and publications
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/facilities")
      .then((response) => {
        setFacilities(response.data);
      })
      .catch((error) => {
        setError("Error fetching facilities.");
        console.error(error);
      });

    axios
      .get("http://localhost:5000/api/publications")
      .then((response) => {
        setPublications(response.data);
      })
      .catch((error) => {
        setError("Error fetching publications.");
        console.error(error);
      });
  }, []);

  // Add a new facility
  const handleAddFacility = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("make_year", makeYear);
    formData.append("model", model);
    formData.append("faculty_in_charge", facultyInCharge);
    formData.append("faculty_contact", facultyContact);
    formData.append("faculty_email", facultyEmail);
    formData.append("operator_name", operatorName);
    formData.append("operator_contact", operatorContact);
    formData.append("operator_email", operatorEmail);
    formData.append("description", description);
    formData.append("specifications", specifications);
    formData.append("usage_details", usageDetails);
    formData.append("category_id", categoryId);
    formData.append("price_internal", priceInternal);
    formData.append("price_external", priceExternal);
    formData.append("price_r_and_d", priceRandD);
    formData.append("price_industry", priceIndustry);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    axios
      .post("http://localhost:5000/api/facilities", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        const facilityId = response.data.id;
        setFacilities([...facilities, response.data]);

        const associations = selectedPublications.map((publicationId) =>
          axios.post("http://localhost:5000/api/facility-publications", {
            facility_id: facilityId,
            publication_id: publicationId,
          })
        );

        Promise.all(associations)
          .then(() => {
            // Clear the form
            setName("");
            setMakeYear("");
            setModel("");
            setFacultyInCharge("");
            setFacultyContact("");
            setFacultyEmail("");
            setOperatorName("");
            setOperatorContact("");
            setOperatorEmail("");
            setDescription("");
            setSpecifications("");
            setUsageDetails("");
            setCategoryId("");
            setPriceInternal("0.00");
            setPriceExternal("0.00");
            setPriceRandD("0.00");
            setPriceIndustry("0.00");
            setImageFile(null);
            setSelectedPublications([]);
          })
          .catch((error) => {
            setError("Error associating facility with publications.");
            console.error(error);
          });
      })
      .catch((error) => {
        setError("Error adding facility.");
        console.error(error);
      });
  };

  // Delete a facility
  const handleDeleteFacility = (id) => {
    axios
      .delete(`http://localhost:5000/api/facilities/${id}`)
      .then(() => {
        setFacilities(facilities.filter((facility) => facility.id !== id));
      })
      .catch((error) => {
        setError("Error deleting facility.");
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
          {/* Facility Details */}
          <input
            type="text"
            placeholder="Facility Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Make Year"
            value={makeYear}
            onChange={(e) => setMakeYear(e.target.value)}
          />
          <input
            type="text"
            placeholder="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          <input
            type="text"
            placeholder="Faculty In Charge"
            value={facultyInCharge}
            onChange={(e) => setFacultyInCharge(e.target.value)}
          />
          <input
            type="text"
            placeholder="Faculty Contact"
            value={facultyContact}
            onChange={(e) => setFacultyContact(e.target.value)}
          />
          <input
            type="email"
            placeholder="Faculty Email"
            value={facultyEmail}
            onChange={(e) => setFacultyEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Operator Name"
            value={operatorName}
            onChange={(e) => setOperatorName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Operator Contact"
            value={operatorContact}
            onChange={(e) => setOperatorContact(e.target.value)}
          />
          <input
            type="email"
            placeholder="Operator Email"
            value={operatorEmail}
            onChange={(e) => setOperatorEmail(e.target.value)}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <textarea
            placeholder="Specifications"
            value={specifications}
            onChange={(e) => setSpecifications(e.target.value)}
          />
          <textarea
            placeholder="Usage Details"
            value={usageDetails}
            onChange={(e) => setUsageDetails(e.target.value)}
          />
          <input
            type="text"
            placeholder="Category ID"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          />
          <input
            type="number"
            placeholder="Price (Internal)"
            value={priceInternal}
            onChange={(e) => setPriceInternal(e.target.value)}
          />
          <input
            type="number"
            placeholder="Price (External)"
            value={priceExternal}
            onChange={(e) => setPriceExternal(e.target.value)}
          />
          <input
            type="number"
            placeholder="Price (R&D)"
            value={priceRandD}
            onChange={(e) => setPriceRandD(e.target.value)}
          />
          <input
            type="number"
            placeholder="Price (Industry)"
            value={priceIndustry}
            onChange={(e) => setPriceIndustry(e.target.value)}
          />
          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files[0])}
            accept="image/*"
          />
          <select
            multiple
            value={selectedPublications}
            onChange={(e) =>
              setSelectedPublications(
                [...e.target.selectedOptions].map((option) => option.value)
              )
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
          {facilities.map((facility) => (
            <li key={facility.id}>
              <h4>{facility.name}</h4>
              <button onClick={() => handleDeleteFacility(facility.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManageFacilities;
