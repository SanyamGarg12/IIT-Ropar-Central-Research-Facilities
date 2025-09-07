import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageFacilities.css";
import { API_BASED_URL } from '../config.js';
import { 
  sanitizeInput, 
  validateFile,
  secureFetch,
  createRateLimiter,
  escapeHtml 
} from '../utils/security';
import RichTextEditor from './RichTextEditor';

import {
  fetchFacilities,
  fetchPublications,
  addFacility,
  updateFacility,
  deleteFacility,
} from "./facilityAPI";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${API_BASED_URL}${cleanPath}`;
};

const ManageFacilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [publications, setPublications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    make_year: "",
    model: "",
    manufacturer: "",
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
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedPublications, setSelectedPublications] = useState([]);
  const [error, setError] = useState(null);
  const [editingFacilityId, setEditingFacilityId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // Create rate limiter for facility operations
  const rateLimiter = createRateLimiter(1000, 60 * 1000); // 10 operations per minute

  useEffect(() => {
    loadFacilities();
    loadPublications();
    loadCategories();
  }, []);

  const loadFacilities = async () => {
    try {
      setIsLoading(true);
      const data = await fetchFacilities();
      setFacilities(data);
    } catch (error) {
      setError("Error fetching facilities.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPublications = async () => {
    try {
      setIsLoading(true);
      const data = await fetchPublications();
      setPublications(data);
    } catch (error) {
      setError("Error fetching publications.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASED_URL}api/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError("Error fetching categories.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Validate numeric fields
    if (name.includes('price_') || name === 'make_year') {
      if (value === '' || (!isNaN(value) && value >= 0)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError("Please upload an image file");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Check rate limit
    if (!rateLimiter.check('facility_operation')) {
      setErrorMessage("Too many operations. Please wait a moment.");
      return;
    }

    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Append image file if present
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      // Append selected publications
      if (selectedPublications.length > 0) {
        formDataToSend.append('publications', JSON.stringify(selectedPublications));
      }

      // Log the form data being sent
      console.log('Form data being sent:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const url = editMode 
        ? `${API_BASED_URL}api/facilities/${selectedFacility.id}`
        : `${API_BASED_URL}api/facilities`;
      
      const response = await fetch(url, {
        method: editMode ? "PUT" : "POST",
        headers: {
          'Authorization': localStorage.getItem('authToken')
        },
        body: formDataToSend
      });

      console.log('Server response:', response);

      if (response.ok) {
        const data = await response.json();
        console.log('Server response data:', data);
        await loadFacilities();
        resetForm();
      } else {
        const data = await response.json();
        console.log('Error response:', data);
        setErrorMessage(data.message || "Operation failed");
      }
    } catch (error) {
      console.error('Submit error:', error);
      setErrorMessage("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFacility = async (facilityId) => {
    if (window.confirm("Are you sure you want to delete this facility? This action cannot be undone.")) {
      // Check rate limit
      if (!rateLimiter.check('facility_operation')) {
        setErrorMessage("Too many operations. Please wait a moment.");
        return;
      }

      try {
        setIsLoading(true);
        await deleteFacility(facilityId);
        setFacilities(facilities.filter((facility) => facility.id !== facilityId));
        alert("Facility deleted successfully");
      } catch (error) {
        setErrorMessage("Error deleting facility.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditFacility = (facility) => {
    resetForm();
    setEditingFacilityId(facility.id);
    setFormData({
      name: facility.name || "",
      make_year: facility.make_year || "",
      model: facility.model || "",
      manufacturer: facility.manufacturer || "",
      faculty_in_charge: facility.faculty_in_charge || "",
      faculty_contact: facility.faculty_contact || "",
      faculty_email: facility.faculty_email || "",
      operator_name: facility.operator_name || "",
      operator_contact: facility.operator_contact || "",
      operator_email: facility.operator_email || "",
      description: facility.description || "",
      specifications: facility.specifications || "",
      usage_details: facility.usage_details || "",
      category_id: facility.category_id || "",
    });
    setImagePreview(facility.image_url ? getImageUrl(facility.image_url) : null);
    setSelectedPublications(facility.publications?.map(p => p.id) || []);
    setEditMode(true);
    setSelectedFacility(facility);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      make_year: "",
      model: "",
      manufacturer: "",
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
    });
    setImageFile(null);
    setImagePreview(null);
    setSelectedPublications([]);
    setEditingFacilityId(null);
    setError(null);
    setEditMode(false);
    setSelectedFacility(null);
  };

  const handlePublicationChange = (pubId) => {
    setSelectedPublications(prev => 
      prev.includes(pubId) 
        ? prev.filter(id => id !== pubId) 
        : [...prev, pubId]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Manage Facilities</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      )}

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h3 className="text-xl font-semibold mb-4">{editMode ? "Edit Facility" : "Add New Facility"}</h3>
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
              disabled={isLoading}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              placeholder="Make Year"
              name="make_year"
              value={formData.make_year}
              onChange={handleInputChange}
              min="1900"
              max={new Date().getFullYear()}
              disabled={isLoading}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Faculty In Charge"
              name="faculty_in_charge"
              value={formData.faculty_in_charge}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Faculty Contact"
              name="faculty_contact"
              value={formData.faculty_contact}
              onChange={handleInputChange}
              // pattern="[0-9]{10}"
              title="Please enter a valid 10-digit phone number"
              disabled={isLoading}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="email"
              placeholder="Faculty Email"
              name="faculty_email"
              value={formData.faculty_email}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Operator Name"
              name="operator_name"
              value={formData.operator_name}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Operator Contact"
              name="operator_contact"
              value={formData.operator_contact}
              onChange={handleInputChange}
              
              title="Please enter a valid 10-digit phone number"
              disabled={isLoading}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="email"
              placeholder="Operator Email"
              name="operator_email"
              value={formData.operator_email}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter facility description..."
              name="description"
              disabled={isLoading}
              height="150px"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Specifications
            </label>
            <RichTextEditor
              value={formData.specifications}
              onChange={handleInputChange}
              placeholder="Enter facility specifications..."
              name="specifications"
              disabled={isLoading}
              height="200px"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Usage Details
            </label>
            <RichTextEditor
              value={formData.usage_details}
              onChange={handleInputChange}
              placeholder="Enter usage details..."
              name="usage_details"
              disabled={isLoading}
              height="200px"
            />
          </div>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {escapeHtml(category.name)}
              </option>
            ))}
          </select>
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Facility Image
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isLoading}
            />
            {imagePreview && (
              <div className="mt-2 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-xs rounded shadow-lg"
                  onError={() => setImageError(true)}
                />
                {imageError && (
                  <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Failed to load image</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">Associated Publications</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2">
              {publications.map((publication) => (
                <div key={publication.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`pub-${publication.id}`}
                    checked={selectedPublications.includes(publication.id)}
                    onChange={() => handlePublicationChange(publication.id)}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <label htmlFor={`pub-${publication.id}`} className="text-sm text-gray-700">
                    {escapeHtml(publication.title)}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="flex space-x-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : editMode ? "Update Facility" : "Add Facility"}
            </button>
            {editMode && (
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={resetForm}
                type="button"
                disabled={isLoading}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h3 className="text-xl font-semibold mb-4">Existing Facilities</h3>
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading facilities...</p>
          </div>
        ) : facilities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No facilities found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {facilities.map((facility) => (
              <li key={facility.id} className="py-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {facility.image_url && (
                    <div className="relative w-16 h-16">
                      <img
                        src={getImageUrl(facility.image_url)}
                        alt={facility.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={() => setImageError(true)}
                      />
                      {imageError && (
                        <div className="absolute inset-0 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-500 text-xs">Failed to load</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <span className="text-lg font-medium text-gray-900">{escapeHtml(facility.name || 'Unnamed Facility')}</span>
                    <p className="text-sm text-gray-500">{escapeHtml(facility.category_name || 'No Category')}</p>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => handleEditFacility(facility)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2"
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteFacility(facility.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageFacilities;