import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageAbout.css';
import {API_BASED_URL} from '../config.js'; 

const ManageAbout = () => {
  const [aboutContent, setAboutContent] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch the current about content from the backend
    axios.get(`${API_BASED_URL}api/aboutContent`)
      .then(response => {
        setAboutContent(response.data);
        if (response.data.departmentIntro.image) {
          setImagePreview(response.data.departmentIntro.image);
        }
      })
      .catch(error => {
        console.error('Error fetching about content:', error);
      });
  }, []);

  const handleInputChange = (key, subKey, value) => {
    setAboutContent(prevContent => ({
      ...prevContent,
      [key]: subKey
        ? { ...prevContent[key], [subKey]: value }
        : value
    }));
  };

  const handleArrayChange = (key, subKey, index, value) => {
    const updatedArray = [...aboutContent[key][subKey]];
    updatedArray[index] = value;
    setAboutContent(prevContent => ({
      ...prevContent,
      [key]: {
        ...prevContent[key],
        [subKey]: updatedArray
      }
    }));
  };

  const addArrayItem = (key, subKey) => {
    setAboutContent(prevContent => ({
      ...prevContent,
      [key]: {
        ...prevContent[key],
        [subKey]: [...prevContent[key][subKey], '']
      }
    }));
  };

  const removeArrayItem = (key, subKey, index) => {
    const updatedArray = [...aboutContent[key][subKey]];
    updatedArray.splice(index, 1);
    setAboutContent(prevContent => ({
      ...prevContent,
      [key]: {
        ...prevContent[key],
        [subKey]: updatedArray
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB in bytes
        setError('File size must be less than 10MB');
        return;
      }
      setError('');
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    try {
      let formData = new FormData();
      formData.append('content', JSON.stringify(aboutContent));
      if (imageFile) {
        formData.append('image', imageFile);
      }
      const authToken = localStorage.getItem("userToken");
      await axios.post(`${API_BASED_URL}api/saveAboutContent`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'authorization' : `${authToken}`
        },
      });
      alert('Changes saved successfully');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes');
    }
  };

  if (!aboutContent) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  const renderSection = () => {
    switch (selectedSection) {
      case 'departmentIntro':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold mb-4">{aboutContent.departmentIntro.title}</h3>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Content</label>
              <textarea
                value={aboutContent.departmentIntro.content}
                onChange={(e) => handleInputChange('departmentIntro', 'content', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="6"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Department Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              {imagePreview && (
                <div className="mt-4">
                  <img src={imagePreview} alt="Department Preview" className="max-w-md rounded-lg shadow-md" />
                </div>
              )}
            </div>
          </div>
        );

      case 'labObjectives':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold mb-4">{aboutContent.labObjectives.title}</h3>
            {aboutContent.labObjectives.items.map((item, index) => (
              <div key={index} className="mb-4">
                <div className="flex gap-4">
                  <textarea
                    value={item}
                    onChange={(e) => handleArrayChange('labObjectives', 'items', index, e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                  <button
                    onClick={() => removeArrayItem('labObjectives', 'items', index)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => addArrayItem('labObjectives', 'items')}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Objective
            </button>
          </div>
        );

      case 'visionMission':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold mb-4">Vision and Mission</h3>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Vision</label>
              <textarea
                value={aboutContent.visionMission.vision}
                onChange={(e) => handleInputChange('visionMission', 'vision', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Mission</label>
              <textarea
                value={aboutContent.visionMission.mission}
                onChange={(e) => handleInputChange('visionMission', 'mission', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Manage About Page Content</h2>
      
      {!selectedSection ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => setSelectedSection('departmentIntro')}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="text-xl font-semibold mb-2">Department Introduction</h3>
            <p className="text-gray-600">Edit department description and image</p>
          </button>
          
          <button
            onClick={() => setSelectedSection('labObjectives')}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="text-xl font-semibold mb-2">Lab Objectives</h3>
            <p className="text-gray-600">Manage lab objectives and goals</p>
          </button>
          
          <button
            onClick={() => setSelectedSection('visionMission')}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="text-xl font-semibold mb-2">Vision and Mission</h3>
            <p className="text-gray-600">Update vision and mission statements</p>
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedSection(null)}
            className="mb-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Selection
          </button>
          
          {renderSection()}
          
          <button
            onClick={handleSaveChanges}
            className="mt-6 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg font-semibold"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageAbout;
