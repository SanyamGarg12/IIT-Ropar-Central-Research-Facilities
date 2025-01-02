import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageFacilities.css";

const ManageFacilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [publications, setPublications] = useState([]);
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
  const [categoryId, setCategoryId] = useState(""); // Category name instead of ID
  const [priceInternal, setPriceInternal] = useState("0.00");
  const [priceExternal, setPriceExternal] = useState("0.00");
  const [priceRandD, setPriceRandD] = useState("0.00");
  const [priceIndustry, setPriceIndustry] = useState("0.00");
  const [imageFile, setImageFile] = useState(null);
  const [selectedPublications, setSelectedPublications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch existing facilities
    axios
      .get("http://localhost:5000/api/facilities")
      .then((response) => {
        setFacilities(response.data);
      })
      .catch((error) => {
        setError("Error fetching facilities.");
        console.error(error);
      });

    // Fetch publications for linking to facilities
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

  const handleAddFacility = (e) => {
    e.preventDefault();

    console.log("Hello from handleAddFacility");
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

    // Map category name to category_id (if necessary)
    const categoryIdMapping = {
      Laboratory: 1,
      Equipment: 2,
      Library: 3,
      Workshop: 4,
    };
    const categoryMappedId = categoryIdMapping[categoryId] || null;
    formData.append("category_id", categoryMappedId);

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

        // Associate the new facility with selected publications
        const associations = selectedPublications.map((publicationId) =>
          axios.post("http://localhost:5000/api/facility-publications", {
            facility_id: facilityId,
            publication_id: publicationId,
          })
        );

        Promise.all(associations)
          .then(() => {
            // Clear the form after successful submission
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

  const handleDeleteFacility = (facilityId) => {
    axios
      .delete(`http://localhost:5000/api/facilities/${facilityId}`)
      .then(() => {
        setFacilities(facilities.filter((facility) => facility.id !== facilityId));
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

          {/* Category Selection */}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Equipment">Equipment</option>
            <option value="Library">Library</option>
            <option value="Workshop">Workshop</option>
          </select>

          {/* Price Fields */}
          <input
            type="number"
            step="0.01"
            placeholder="Price for Internal Users"
            value={priceInternal}
            onChange={(e) => setPriceInternal(e.target.value)}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price for External Users"
            value={priceExternal}
            onChange={(e) => setPriceExternal(e.target.value)}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price for R&D"
            value={priceRandD}
            onChange={(e) => setPriceRandD(e.target.value)}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price for Industry"
            value={priceIndustry}
            onChange={(e) => setPriceIndustry(e.target.value)}
          />

          {/* Image Upload */}
          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files[0])}
          />

          {/* Publications */}
          <select
            multiple
            value={selectedPublications}
            onChange={(e) =>
              setSelectedPublications(Array.from(e.target.selectedOptions, (option) => option.value))
            }
          >
            {publications.map((publication) => (
              <option key={publication.id} value={publication.id}>
                {publication.title}
              </option>
            ))}
          </select>

          <button type="submit">Add Facility</button>
        </form>
      </div>

      <div className="facility-list">
        <h3>Existing Facilities</h3>
        <ul>
          {facilities.map((facility) => (
            <li key={facility.id}>
              <span>{facility.name}</span>
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
