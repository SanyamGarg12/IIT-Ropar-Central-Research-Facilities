import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageFacilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [publications, setPublications] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    make_year: "",
    model: "",
    faculty_in_charge: "",
    faculty_contact: "",
    faculty_email: "",
    operator_name: "",
    operator_contact: "",
    operator_email: "",
    description: "",
    specifications: "",
    usage_details: "",
    category_id: "",
    price_internal: "0.00",
    price_external: "0.00",
    price_r_and_d: "0.00",
    price_industry: "0.00",
  });
  const [imageFile, setImageFile] = useState(null);
  const [selectedPublications, setSelectedPublications] = useState([]);
  const [error, setError] = useState(null);
  const [editingFacilityId, setEditingFacilityId] = useState(null);

  useEffect(() => {
    fetchFacilities();
    fetchPublications();
  }, []);

  const fetchFacilities = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/facilities");
      setFacilities(response.data);
    } catch (error) {
      setError("Error fetching facilities.");
      console.error(error);
    }
  };

  const fetchPublications = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/publications");
      setPublications(response.data);
    } catch (error) {
      setError("Error fetching publications.");
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });

    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    try {
      if (editingFacilityId) {
        await axios.put(`http://localhost:5000/api/facilities/${editingFacilityId}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Facility updated successfully");
      } else {
        const response = await axios.post("http://localhost:5000/api/facilities", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setFacilities([...facilities, response.data]);
        alert("Facility added successfully");
      }
      resetForm();
      fetchFacilities();
    } catch (error) {
      setError(editingFacilityId ? "Error updating facility." : "Error adding facility.");
      console.error(error);
    }
  };

  const handleDeleteFacility = async (facilityId) => {
    if (window.confirm("Are you sure you want to delete this facility?")) {
      try {
        await axios.delete(`http://localhost:5000/api/facilities/${facilityId}`);
        setFacilities(facilities.filter((facility) => facility.id !== facilityId));
      } catch (error) {
        setError("Error deleting facility.");
        console.error(error);
      }
    }
  };

  const handleEditFacility = (facility) => {
    setEditingFacilityId(facility.id);
    setFormData({
      name: facility.name,
      make_year: facility.make_year,
      model: facility.model,
      faculty_in_charge: facility.faculty_in_charge,
      faculty_contact: facility.faculty_contact,
      faculty_email: facility.faculty_email,
      operator_name: facility.operator_name,
      operator_contact: facility.operator_contact,
      operator_email: facility.operator_email,
      description: facility.description,
      specifications: facility.specifications,
      usage_details: facility.usage_details,
      category_id: facility.category_id,
      price_internal: facility.price_internal,
      price_external: facility.price_external,
      price_r_and_d: facility.price_r_and_d,
      price_industry: facility.price_industry,
    });
    setSelectedPublications(facility.publications.map(pub => pub.id));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      make_year: "",
      model: "",
      faculty_in_charge: "",
      faculty_contact: "",
      faculty_email: "",
      operator_name: "",
      operator_contact: "",
      operator_email: "",
      description: "",
      specifications: "",
      usage_details: "",
      category_id: "",
      price_internal: "0.00",
      price_external: "0.00",
      price_r_and_d: "0.00",
      price_industry: "0.00",
    });
    setImageFile(null);
    setSelectedPublications([]);
    setEditingFacilityId(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Manage Facilities</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h3 className="text-xl font-semibold mb-4">{editingFacilityId ? "Edit Facility" : "Add New Facility"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Facility Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              placeholder="Make Year"
              name="make_year"
              value={formData.make_year}
              onChange={handleInputChange}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Faculty In Charge"
              name="faculty_in_charge"
              value={formData.faculty_in_charge}
              onChange={handleInputChange}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Faculty Contact"
              name="faculty_contact"
              value={formData.faculty_contact}
              onChange={handleInputChange}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="email"
              placeholder="Faculty Email"
              name="faculty_email"
              value={formData.faculty_email}
              onChange={handleInputChange}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Operator Name"
              name="operator_name"
              value={formData.operator_name}
              onChange={handleInputChange}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Operator Contact"
              name="operator_contact"
              value={formData.operator_contact}
              onChange={handleInputChange}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="email"
              placeholder="Operator Email"
              name="operator_email"
              value={formData.operator_email}
              onChange={handleInputChange}
            />
          </div>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Specifications"
            name="specifications"
            value={formData.specifications}
            onChange={handleInputChange}
          />
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Usage Details"
            name="usage_details"
            value={formData.usage_details}
            onChange={handleInputChange}
          />
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Category</option>
            <option value="1">Laboratory</option>
            <option value="2">Equipment</option>
            <option value="3">Library</option>
            <option value="4">Workshop</option>
          </select>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              step="0.01"
              placeholder="Price for Internal Users"
              name="price_internal"
              value={formData.price_internal}
              onChange={handleInputChange}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              step="0.01"
              placeholder="Price for External Users"
              name="price_external"
              value={formData.price_external}
              onChange={handleInputChange}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              step="0.01"
              placeholder="Price for R&D"
              name="price_r_and_d"
              value={formData.price_r_and_d}
              onChange={handleInputChange}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              step="0.01"
              placeholder="Price for Industry"
              name="price_industry"
              value={formData.price_industry}
              onChange={handleInputChange}
            />
          </div>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="file"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            {editingFacilityId ? "Update Facility" : "Add Facility"}
          </button>
          {editingFacilityId && (
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h3 className="text-xl font-semibold mb-4">Existing Facilities</h3>
        <ul className="divide-y divide-gray-200">
          {facilities.map((facility) => (
            <li key={facility.id} className="py-4 flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">{facility.name}</span>
              <div>
                <button
                  onClick={() => handleEditFacility(facility)}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteFacility(facility.id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManageFacilities;

