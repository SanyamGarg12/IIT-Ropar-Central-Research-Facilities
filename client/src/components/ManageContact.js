import React, { useState, useEffect } from 'react';
import { FaImage, FaEnvelope, FaPlane, FaTrain, FaMapMarkerAlt, FaClock, FaVideo, FaUser, FaGithub, FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { API_BASED_URL } from '../config.js';

const ManageContact = () => {
  const [contactContent, setContactContent] = useState({
    hero: { title: '', image: '' },
    emailAddresses: { title: '', emails: [] },
    transportation: { airport: {}, railway: {} },
    campusDetails: {},
    virtualTours: { title: '', videos: [] },
    contactForm: { title: '', intro: '' },
    footer: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [savingSection, setSavingSection] = useState('');


  useEffect(() => {
    loadContactContent();
  }, []);

  const loadContactContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASED_URL}api/contact-content`);
      if (!response.ok) {
        throw new Error('Failed to load contact content');
      }
      const data = await response.json();
      setContactContent(data);
    } catch (error) {
      setError('Failed to load contact content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateContactContent = async (content, sectionName) => {
    try {
      setSavingSection(sectionName);
      const response = await fetch(`${API_BASED_URL}api/contact-content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update contact content');
      }

      const result = await response.json();
      setContactContent(content);
      setSuccess(`${sectionName} updated successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(`Failed to update ${sectionName}: ` + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setSavingSection('');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    const formData = new FormData();
    formData.append('image', file);

    try {
      setSavingSection('hero');
      const response = await fetch(`${API_BASED_URL}api/contact-content/hero-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const result = await response.json();
      setContactContent(prev => ({
        ...prev,
        hero: { ...prev.hero, image: result.imagePath }
      }));
      setSuccess(result.message || 'Hero image updated successfully!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError('Failed to upload image: ' + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setSelectedImage(null);
      setSavingSection('');
    }
  };

  const handleInputChange = (section, field, value, index = null) => {
    setContactContent(prev => {
      const newContent = { ...prev };
      if (index !== null) {
        if (Array.isArray(newContent[section])) {
          newContent[section] = [...newContent[section]];
          newContent[section][index] = { ...newContent[section][index], [field]: value };
        } else if (typeof newContent[section] === 'object' && newContent[section] !== null) {
          newContent[section] = { ...newContent[section] };
          if (Array.isArray(newContent[section][field])) {
            newContent[section][field] = [...newContent[section][field]];
            newContent[section][field][index] = value;
          } else {
            newContent[section][field] = value;
          }
        }
      } else {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          newContent[section] = { ...newContent[section] };
          newContent[section][parent] = { ...newContent[section][parent], [child]: value };
        } else {
          newContent[section] = { ...newContent[section], [field]: value };
        }
      }
      return newContent;
    });
  };

  // Email Addresses Functions - Simplified
  const addEmail = () => {
    const newEmail = { label: '', email: '' };
    setContactContent(prev => ({
      ...prev,
      emailAddresses: {
        ...prev.emailAddresses,
        emails: [...(prev.emailAddresses.emails || []), newEmail]
      }
    }));
  };

  const removeEmail = (index) => {
    setContactContent(prev => ({
      ...prev,
      emailAddresses: {
        ...prev.emailAddresses,
        emails: prev.emailAddresses.emails.filter((_, i) => i !== index)
      }
    }));
  };

  const updateEmail = (index, field, value) => {
    setContactContent(prev => ({
      ...prev,
      emailAddresses: {
        ...prev.emailAddresses,
        emails: prev.emailAddresses.emails.map((email, i) => 
          i === index ? { ...email, [field]: value } : email
        )
      }
    }));
  };

  // Video Functions
  const addVideo = () => {
    const newVideo = { title: '', url: '' };
    setContactContent(prev => ({
      ...prev,
      virtualTours: {
        ...prev.virtualTours,
        videos: [...prev.virtualTours.videos, newVideo]
      }
    }));
  };

  const removeVideo = (index) => {
    setContactContent(prev => ({
      ...prev,
      virtualTours: {
        ...prev.virtualTours,
        videos: prev.virtualTours.videos.filter((_, i) => i !== index)
      }
    }));
  };

  // Gate Functions
  const addGate = () => {
    const newGate = { name: '', description: '' };
    setContactContent(prev => ({
      ...prev,
      campusDetails: {
        ...prev.campusDetails,
        gates: {
          ...prev.campusDetails.gates,
          gates: [...(prev.campusDetails.gates?.gates || []), newGate]
        }
      }
    }));
  };

  const removeGate = (index) => {
    setContactContent(prev => ({
      ...prev,
      campusDetails: {
        ...prev.campusDetails,
        gates: {
          ...prev.campusDetails.gates,
          gates: prev.campusDetails.gates.gates.filter((_, i) => i !== index)
        }
      }
    }));
  };

  if (loading && !contactContent.hero.title) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Manage Contact Page</h1>
          <p className="text-gray-600">Customize all aspects of your contact page content</p>
        </div>

        {/* Global Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-lg">
            <div className="flex items-center">
              <FaTimes className="mr-2" />
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl shadow-lg">
            <div className="flex items-center">
              <FaSave className="mr-2" />
              {success}
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
              <FaImage className="mr-3 text-blue-500" /> Hero Section
            </h2>
            <button
              onClick={() => updateContactContent(contactContent, 'Hero Section')}
              disabled={savingSection === 'Hero Section'}
              className="bg-blue-500 hover:bg-blue-600 text-white px-1 py-0.5 rounded text-xs font-medium flex items-center gap-1 disabled:opacity-50 transition-all duration-200"
              style={{ minWidth: '50px', maxWidth: '70px' }}
            >
              {savingSection === 'Hero Section' ? (
                <>
                  <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave size={10} /> Save
                </>
              )}
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Hero Title</label>
              <input
                type="text"
                value={contactContent.hero?.title || ''}
                onChange={(e) => handleInputChange('hero', 'title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter hero title..."
              />
            </div>
                         <div>
               <label className="block text-sm font-medium text-gray-700 mb-3">Hero Image</label>
               <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                 <h4 className="text-sm font-semibold text-blue-800 mb-2">📸 Image Specifications:</h4>
                 <ul className="text-xs text-blue-700 space-y-1">
                   <li>• <strong>Recommended dimensions:</strong> 1920×600 pixels</li>
                   <li>• <strong>Aspect ratio:</strong> 16:5 (landscape)</li>
                   <li>• <strong>File format:</strong> JPG, PNG, WebP</li>
                   <li>• <strong>Max file size:</strong> 5MB</li>
                   <li>• <strong>Note:</strong> Images will be automatically resized to fit these dimensions</li>
                 </ul>
               </div>
               <div className="flex items-center space-x-4">
                 <input
                   type="file"
                   accept="image/*"
                   onChange={handleImageUpload}
                   className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                 />
                 {contactContent.hero?.image && (
                   <div className="flex flex-col items-center space-y-2">
                     <img
                       src={`${API_BASED_URL.replace(/\/$/, '')}${contactContent.hero.image}`}
                       alt="Hero"
                       className="w-20 h-20 object-cover rounded-lg shadow-md"
                     />
                     <div className="text-xs text-gray-500 text-center">
                       <p>Current Image</p>
                     </div>
                   </div>
                 )}
               </div>
             </div>
          </div>
        </div>

        {/* Email Addresses Section - Simplified */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
              <FaEnvelope className="mr-3 text-yellow-500" /> Email Addresses
            </h2>
            <div className="flex gap-1">
              <button
                onClick={addEmail}
                className="bg-green-500 hover:bg-green-600 text-white px-1 py-0.5 rounded text-xs font-medium flex items-center gap-1 transition-all duration-200"
                style={{ minWidth: '40px', maxWidth: '60px' }}
              >
                <FaPlus size={10} /> Add
              </button>
              <button
                onClick={() => updateContactContent(contactContent, 'Email Addresses')}
                disabled={savingSection === 'Email Addresses'}
                className="bg-blue-500 hover:bg-blue-600 text-white px-1 py-0.5 rounded text-xs font-medium flex items-center gap-1 disabled:opacity-50 transition-all duration-200"
                style={{ minWidth: '50px', maxWidth: '70px' }}
              >
                {savingSection === 'Email Addresses' ? (
                  <>
                    <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave size={10} /> Save
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {contactContent.emailAddresses?.emails?.map((emailItem, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-all duration-200 bg-gray-50">
                <input
                  type="text"
                  placeholder="Label (e.g., General Information)"
                  value={emailItem.label || ''}
                  onChange={(e) => updateEmail(index, 'label', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={emailItem.email || ''}
                  onChange={(e) => updateEmail(index, 'email', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                />
                <button
                  onClick={() => removeEmail(index)}
                  className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-all duration-200"
                  title="Remove email"
                  style={{ minWidth: '30px', maxWidth: '35px' }}
                >
                  <FaTrash size={8} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Transportation Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
              <FaPlane className="mr-3 text-indigo-500" /> Transportation
            </h2>
            <button
              onClick={() => updateContactContent(contactContent, 'Transportation')}
              disabled={savingSection === 'Transportation'}
              className="bg-blue-500 hover:bg-blue-600 text-white px-1 py-0.5 rounded text-xs font-medium flex items-center gap-1 disabled:opacity-50 transition-all duration-200"
              style={{ minWidth: '50px', maxWidth: '70px' }}
            >
              {savingSection === 'Transportation' ? (
                <>
                  <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave size={10} /> Save
                </>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Airport */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-all duration-200">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FaPlane className="mr-2 text-indigo-500" /> From Airport
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="e.g., From Airport"
                    value={contactContent.transportation?.airport?.title || ''}
                    onChange={(e) => handleInputChange('transportation', 'airport.title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g., From Chandigarh International Airport"
                    value={contactContent.transportation?.airport?.subtitle || ''}
                    onChange={(e) => handleInputChange('transportation', 'airport.subtitle', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructions (one per line)</label>
                  <textarea
                    placeholder="Enter instructions, one per line..."
                    value={contactContent.transportation?.airport?.instructions?.join('\n') || ''}
                    onChange={(e) => handleInputChange('transportation', 'airport.instructions', e.target.value.split('\n').filter(line => line.trim()))}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Railway */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-all duration-200">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FaTrain className="mr-2 text-indigo-500" /> From Railway Station
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="e.g., From Railway Station"
                    value={contactContent.transportation?.railway?.title || ''}
                    onChange={(e) => handleInputChange('transportation', 'railway.title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g., From Rupnagar Railway Station"
                    value={contactContent.transportation?.railway?.subtitle || ''}
                    onChange={(e) => handleInputChange('transportation', 'railway.subtitle', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructions (one per line)</label>
                  <textarea
                    placeholder="Enter instructions, one per line..."
                    value={contactContent.transportation?.railway?.instructions?.join('\n') || ''}
                    onChange={(e) => handleInputChange('transportation', 'railway.instructions', e.target.value.split('\n').filter(line => line.trim()))}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campus Details Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
              <FaMapMarkerAlt className="mr-3 text-green-500" /> Campus Details
            </h2>
            <button
              onClick={() => updateContactContent(contactContent, 'Campus Details')}
              disabled={savingSection === 'Campus Details'}
              className="bg-blue-500 hover:bg-blue-600 text-white px-1 py-0.5 rounded text-xs font-medium flex items-center gap-1 disabled:opacity-50 transition-all duration-200"
              style={{ minWidth: '50px', maxWidth: '70px' }}
            >
              {savingSection === 'Campus Details' ? (
                <>
                  <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave size={10} /> Save
                </>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Postal Address */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 transition-all duration-200">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-green-500" /> Postal Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Postal Address"
                    value={contactContent.campusDetails?.postalAddress?.title || ''}
                    onChange={(e) => handleInputChange('campusDetails', 'postalAddress.title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Content</label>
                  <textarea
                    placeholder="Enter address content..."
                    value={contactContent.campusDetails?.postalAddress?.content || ''}
                    onChange={(e) => handleInputChange('campusDetails', 'postalAddress.content', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 transition-all duration-200">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FaEnvelope className="mr-2 text-green-500" /> Contact Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="text"
                    placeholder="e.g., +91-12345-67890"
                    value={contactContent.campusDetails?.contactDetails?.phone || ''}
                    onChange={(e) => handleInputChange('campusDetails', 'contactDetails.phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fax</label>
                  <input
                    type="text"
                    placeholder="e.g., +91-12345-67891"
                    value={contactContent.campusDetails?.contactDetails?.fax || ''}
                    onChange={(e) => handleInputChange('campusDetails', 'contactDetails.fax', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <input
                    type="text"
                    placeholder="e.g., +91-12345-67892"
                    value={contactContent.campusDetails?.contactDetails?.emergency || ''}
                    onChange={(e) => handleInputChange('campusDetails', 'contactDetails.emergency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Gates */}
          <div className="mt-8 border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 transition-all duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-700 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-green-500" /> Campus Gates
              </h3>
              <button
                onClick={addGate}
                className="bg-green-500 hover:bg-green-600 text-white px-1 py-0.5 rounded text-xs font-medium flex items-center gap-1 transition-all duration-200"
                style={{ minWidth: '60px', maxWidth: '80px' }}
              >
                <FaPlus size={10} /> Add Gate
              </button>
            </div>
            <div className="space-y-3">
              {contactContent.campusDetails?.gates?.gates?.map((gate, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    placeholder="Gate Name"
                    value={gate.name || ''}
                    onChange={(e) => handleInputChange('campusDetails', 'gates.gates', 
                      contactContent.campusDetails.gates.gates.map((g, i) => 
                        i === index ? { ...g, name: e.target.value } : g
                      )
                    )}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={gate.description || ''}
                    onChange={(e) => handleInputChange('campusDetails', 'gates.gates',
                      contactContent.campusDetails.gates.gates.map((g, i) => 
                        i === index ? { ...g, description: e.target.value } : g
                      )
                    )}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                  <button
                    onClick={() => removeGate(index)}
                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-all duration-200"
                    title="Remove gate"
                    style={{ minWidth: '30px', maxWidth: '35px' }}
                  >
                    <FaTrash size={8} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Visiting Hours */}
          <div className="mt-8 border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 transition-all duration-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <FaClock className="mr-2 text-green-500" /> Visiting Hours
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="e.g., Visiting Hours"
                  value={contactContent.campusDetails?.visitingHours?.title || ''}
                  onChange={(e) => handleInputChange('campusDetails', 'visitingHours.title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                <input
                  type="text"
                  placeholder="e.g., Monday to Friday, 9 AM to 5:30 PM"
                  value={contactContent.campusDetails?.visitingHours?.hours || ''}
                  onChange={(e) => handleInputChange('campusDetails', 'visitingHours.hours', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Virtual Tours Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
              <FaVideo className="mr-3 text-purple-500" /> Virtual Tours
            </h2>
            <div className="flex gap-1">
              <button
                onClick={addVideo}
                className="bg-green-500 hover:bg-green-600 text-white px-1 py-0.5 rounded text-xs font-medium flex items-center gap-1 transition-all duration-200"
                style={{ minWidth: '70px', maxWidth: '90px' }}
              >
                <FaPlus size={10} /> Add Video
              </button>
              <button
                onClick={() => updateContactContent(contactContent, 'Virtual Tours')}
                disabled={savingSection === 'Virtual Tours'}
                className="bg-blue-500 hover:bg-blue-600 text-white px-1 py-0.5 rounded text-xs font-medium flex items-center gap-1 disabled:opacity-50 transition-all duration-200"
                style={{ minWidth: '50px', maxWidth: '70px' }}
              >
                {savingSection === 'Virtual Tours' ? (
                  <>
                    <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave size={10} /> Save
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            {contactContent.virtualTours?.videos?.map((video, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all duration-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video Title</label>
                    <input
                      type="text"
                      placeholder="e.g., IIT Ropar Campus Tour"
                      value={video.title || ''}
                      onChange={(e) => handleInputChange('virtualTours', 'videos',
                        contactContent.virtualTours.videos.map((v, i) => 
                          i === index ? { ...v, title: e.target.value } : v
                        )
                      )}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Embed URL</label>
                    <input
                      type="text"
                      placeholder="e.g., https://www.youtube.com/embed/Tis7EuowoHo"
                      value={video.url || ''}
                      onChange={(e) => handleInputChange('virtualTours', 'videos',
                        contactContent.virtualTours.videos.map((v, i) => 
                          i === index ? { ...v, url: e.target.value } : v
                        )
                      )}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => removeVideo(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-1 py-0.5 rounded text-xs font-medium flex items-center gap-1 transition-all duration-200"
                    style={{ minWidth: '60px', maxWidth: '80px' }}
                  >
                    <FaTrash size={8} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
              <FaEnvelope className="mr-3 text-orange-500" /> Contact Form
            </h2>
            <button
              onClick={() => updateContactContent(contactContent, 'Contact Form')}
              disabled={savingSection === 'Contact Form'}
              className="bg-blue-500 hover:bg-blue-600 text-white px-1 py-0.5 rounded text-xs font-medium flex items-center gap-1 disabled:opacity-50 transition-all duration-200"
              style={{ minWidth: '50px', maxWidth: '70px' }}
            >
              {savingSection === 'Contact Form' ? (
                <>
                  <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave size={10} /> Save
                </>
              )}
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Form Title</label>
              <input
                type="text"
                placeholder="e.g., Contact Us"
                value={contactContent.contactForm?.title || ''}
                onChange={(e) => handleInputChange('contactForm', 'title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Form Introduction</label>
              <textarea
                placeholder="Enter form introduction text..."
                value={contactContent.contactForm?.intro || ''}
                onChange={(e) => handleInputChange('contactForm', 'intro', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
              <FaUser className="mr-3 text-teal-500" /> Footer Information
            </h2>
            <button
              onClick={() => updateContactContent(contactContent, 'Footer Information')}
              disabled={savingSection === 'Footer Information'}
              className="bg-blue-500 hover:bg-blue-600 text-white px-1 py-0.5 rounded text-xs font-medium flex items-center gap-1 disabled:opacity-50 transition-all duration-200"
              style={{ minWidth: '50px', maxWidth: '70px' }}
            >
              {savingSection === 'Footer Information' ? (
                <>
                  <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave size={10} /> Save
                </>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Managed By</label>
              <input
                type="text"
                placeholder="e.g., Sanyam Garg"
                value={contactContent.footer?.managedBy || ''}
                onChange={(e) => handleInputChange('footer', 'managedBy', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="e.g., sanyam22448@iiitd.ac.in"
                value={contactContent.footer?.email || ''}
                onChange={(e) => handleInputChange('footer', 'email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
              <input
                type="url"
                placeholder="e.g., https://github.com/SanyamGarg12"
                value={contactContent.footer?.github || ''}
                onChange={(e) => handleInputChange('footer', 'github', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
                 </div>
       </div>
       
       
     </div>
   );
 };

export default ManageContact;
