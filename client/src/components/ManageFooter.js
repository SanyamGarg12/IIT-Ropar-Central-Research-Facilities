import React, { useState, useEffect } from 'react';
import { FaLink, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaArrowUp, FaArrowDown, FaGripVertical } from 'react-icons/fa';
import { API_BASED_URL } from '../config.js';

const ManageFooter = () => {
  const [footerContent, setFooterContent] = useState({
    quickLinks: [],
    contactInfo: [],
    socialLinks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingSection, setEditingSection] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    loadFooterContent();
  }, []);

  const loadFooterContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASED_URL}api/footer-content`);
      if (!response.ok) {
        throw new Error('Failed to load footer content');
      }
      const data = await response.json();
      setFooterContent(data);
    } catch (error) {
      setError('Failed to load footer content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFooterSection = async (section, data) => {
    try {
      setLoading(true);
      // Convert section name to match server endpoint format
      const endpointMap = {
        'quickLinks': 'quickLinks',
        'contactInfo': 'contactInfo', 
        'socialLinks': 'socialLinks'
      };
      const endpoint = endpointMap[section] || section;
      
      const response = await fetch(`${API_BASED_URL}api/footer-content/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [section]: data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update footer content');
      }

      const result = await response.json();
      setFooterContent(prev => ({
        ...prev,
        [section]: data
      }));
      setSuccess(result.message);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update footer content: ' + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLinkAdd = () => {
    const newLink = { name: '', path: '' };
    setFooterContent(prev => {
      const newQuickLinks = [...prev.quickLinks, newLink];
      setEditingSection('quickLinks');
      setEditingIndex(newQuickLinks.length - 1);
      return {
        ...prev,
        quickLinks: newQuickLinks
      };
    });
  };

  const handleQuickLinkEdit = (index) => {
    setEditingSection('quickLinks');
    setEditingIndex(index);
  };

  const handleQuickLinkSave = (index) => {
    const updatedLinks = [...footerContent.quickLinks];
    if (!updatedLinks[index].name || !updatedLinks[index].path) {
      setError('Name and path are required for quick links');
      return;
    }
    updateFooterSection('quickLinks', updatedLinks);
    setEditingSection(null);
    setEditingIndex(null);
  };

  const handleQuickLinkDelete = (index) => {
    const updatedLinks = footerContent.quickLinks.filter((_, i) => i !== index);
    updateFooterSection('quickLinks', updatedLinks);
  };

  const moveQuickLinkUp = (index) => {
    if (index === 0) return; // Can't move first item up
    const updatedLinks = [...footerContent.quickLinks];
    const temp = updatedLinks[index];
    updatedLinks[index] = updatedLinks[index - 1];
    updatedLinks[index - 1] = temp;
    updateFooterSection('quickLinks', updatedLinks);
  };

  const moveQuickLinkDown = (index) => {
    if (index === footerContent.quickLinks.length - 1) return; // Can't move last item down
    const updatedLinks = [...footerContent.quickLinks];
    const temp = updatedLinks[index];
    updatedLinks[index] = updatedLinks[index + 1];
    updatedLinks[index + 1] = temp;
    updateFooterSection('quickLinks', updatedLinks);
  };

  const handleContactInfoAdd = () => {
    const newContact = { type: 'phone', text: '', href: '' };
    setFooterContent(prev => {
      const newContactInfo = [...prev.contactInfo, newContact];
      setEditingSection('contactInfo');
      setEditingIndex(newContactInfo.length - 1);
      return {
        ...prev,
        contactInfo: newContactInfo
      };
    });
  };

  const handleContactInfoEdit = (index) => {
    setEditingSection('contactInfo');
    setEditingIndex(index);
  };

  const handleContactInfoSave = (index) => {
    const updatedContacts = [...footerContent.contactInfo];
    if (!updatedContacts[index].text || !updatedContacts[index].href) {
      setError('Text and href are required for contact info');
      return;
    }
    updateFooterSection('contactInfo', updatedContacts);
    setEditingSection(null);
    setEditingIndex(null);
  };

  const handleContactInfoDelete = (index) => {
    const updatedContacts = footerContent.contactInfo.filter((_, i) => i !== index);
    updateFooterSection('contactInfo', updatedContacts);
  };

  const handleSocialLinkToggle = (index) => {
    const updatedLinks = [...footerContent.socialLinks];
    updatedLinks[index].enabled = !updatedLinks[index].enabled;
    if (updatedLinks[index].enabled && !updatedLinks[index].href) {
      updatedLinks[index].href = `https://${updatedLinks[index].platform.toLowerCase()}.com/`;
    }
    updateFooterSection('socialLinks', updatedLinks);
  };

  const handleSocialLinkEdit = (index) => {
    setEditingSection('socialLinks');
    setEditingIndex(index);
  };

  const handleSocialLinkSave = (index) => {
    const updatedLinks = [...footerContent.socialLinks];
    if (updatedLinks[index].enabled && !updatedLinks[index].href) {
      setError('URL is required for enabled social links');
      return;
    }
    updateFooterSection('socialLinks', updatedLinks);
    setEditingSection(null);
    setEditingIndex(null);
  };

  const handleInputChange = (section, index, field, value) => {
    setFooterContent(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getSocialIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <FaFacebook />;
      case 'twitter': return <FaTwitter />;
      case 'instagram': return <FaInstagram />;
      case 'linkedin': return <FaLinkedin />;
      case 'youtube': return <FaYoutube />;
      default: return <FaLink />;
    }
  };

  const getContactIcon = (type) => {
    switch (type) {
      case 'phone': return <FaPhone />;
      case 'email': return <FaEnvelope />;
      case 'address': return <FaMapMarkerAlt />;
      default: return <FaLink />;
    }
  };

  if (loading && footerContent.quickLinks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Footer Content</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          {/* Quick Links Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Quick Links</h2>
                <p className="text-gray-600">Manage navigation links that appear in the website footer</p>
              </div>
              <button
                onClick={handleQuickLinkAdd}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <FaPlus /> Add New Link
              </button>
            </div>
            
            {/* Info Card */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="text-blue-500 mt-1">
                  <FaLink size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">Quick Links Guidelines</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Full URLs:</strong> You can use complete URLs (e.g., https://example.com) or relative paths (e.g., /about)</li>
                    <li>• <strong>Ordering:</strong> Use the up/down arrows to reorder links as they will appear in the footer</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Links List */}
            <div className="space-y-4">
              {footerContent.quickLinks.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <FaLink className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Quick Links Added</h3>
                  <p className="text-gray-500 mb-4">Get started by adding your first quick link</p>
                  <button
                    onClick={handleQuickLinkAdd}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
                  >
                    <FaPlus /> Add First Link
                  </button>
                </div>
              ) : (
                footerContent.quickLinks.map((link, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-6">
                      <div className="flex items-center gap-4">
                        {/* Reorder Controls */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => moveQuickLinkUp(index)}
                            disabled={index === 0}
                            className={`p-2 rounded-lg transition-colors ${
                              index === 0 
                                ? 'text-gray-300 cursor-not-allowed bg-gray-100' 
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 bg-white border border-gray-200'
                            }`}
                            title="Move Up"
                          >
                            <FaArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => moveQuickLinkDown(index)}
                            disabled={index === footerContent.quickLinks.length - 1}
                            className={`p-2 rounded-lg transition-colors ${
                              index === footerContent.quickLinks.length - 1 
                                ? 'text-gray-300 cursor-not-allowed bg-gray-100' 
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 bg-white border border-gray-200'
                            }`}
                            title="Move Down"
                          >
                            <FaArrowDown size={14} />
                          </button>
                        </div>
                        
                        {/* Drag Handle */}
                        <div className="text-gray-400 cursor-move p-2 hover:text-gray-600 transition-colors">
                          <FaGripVertical size={18} />
                        </div>
                        
                        {/* Link Content */}
                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Link Name</label>
                            <input
                              type="text"
                              placeholder="e.g., About Us, Contact, Privacy Policy"
                              value={link.name}
                              onChange={(e) => handleInputChange('quickLinks', index, 'name', e.target.value)}
                              disabled={editingSection !== 'quickLinks' || editingIndex !== index}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Link URL</label>
                            <input
                              type="url"
                              placeholder="e.g., /about, https://example.com, mailto:contact@example.com"
                              value={link.path}
                              onChange={(e) => handleInputChange('quickLinks', index, 'path', e.target.value)}
                              disabled={editingSection !== 'quickLinks' || editingIndex !== index}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Use full URLs for external links (https://...) or relative paths for internal pages (/page)
                            </p>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {editingSection === 'quickLinks' && editingIndex === index ? (
                            <>
                              <button
                                onClick={() => handleQuickLinkSave(index)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-sm hover:shadow-md"
                                title="Save Changes"
                              >
                                <FaSave size={14} /> Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingSection(null);
                                  setEditingIndex(null);
                                  loadFooterContent();
                                }}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-sm hover:shadow-md"
                                title="Cancel"
                              >
                                <FaTimes size={14} /> Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleQuickLinkEdit(index)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-sm hover:shadow-md"
                                title="Edit Link"
                              >
                                <FaEdit size={14} /> Edit
                              </button>
                              <button
                                onClick={() => handleQuickLinkDelete(index)}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-sm hover:shadow-md"
                                title="Delete Link"
                              >
                                <FaTrash size={14} /> Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Preview */}
                      {link.name && link.path && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Preview:</span>
                            <a 
                              href={link.path.startsWith('http') ? link.path : `#${link.path}`}
                              target={link.path.startsWith('http') ? '_blank' : '_self'}
                              rel={link.path.startsWith('http') ? 'noopener noreferrer' : ''}
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {link.name}
                            </a>
                            <span className="text-gray-400">→</span>
                            <span className="font-mono text-xs bg-white px-2 py-1 rounded border">
                              {link.path}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Contact Information</h2>
              <button
                onClick={handleContactInfoAdd}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaPlus /> Add Contact
              </button>
            </div>
            <div className="space-y-3">
              {footerContent.contactInfo.map((contact, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <select
                      value={contact.type}
                      onChange={(e) => handleInputChange('contactInfo', index, 'type', e.target.value)}
                      disabled={editingSection !== 'contactInfo' || editingIndex !== index}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="phone">Phone</option>
                      <option value="email">Email</option>
                      <option value="address">Address</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Display Text"
                      value={contact.text}
                      onChange={(e) => handleInputChange('contactInfo', index, 'text', e.target.value)}
                      disabled={editingSection !== 'contactInfo' || editingIndex !== index}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="URL/Link"
                      value={contact.href}
                      onChange={(e) => handleInputChange('contactInfo', index, 'href', e.target.value)}
                      disabled={editingSection !== 'contactInfo' || editingIndex !== index}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    {editingSection === 'contactInfo' && editingIndex === index ? (
                      <>
                        <button
                          onClick={() => handleContactInfoSave(index)}
                          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
                        >
                          <FaSave />
                        </button>
                        <button
                          onClick={() => {
                            setEditingSection(null);
                            setEditingIndex(null);
                            loadFooterContent();
                          }}
                          className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleContactInfoEdit(index)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleContactInfoDelete(index)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media Links Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Social Media Links</h2>
            </div>
            <div className="space-y-3">
              {footerContent.socialLinks.map((social, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-3 w-32">
                    {getSocialIcon(social.platform)}
                    <span className="font-medium">{social.platform}</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Handle/Username"
                      value={social.handle}
                      onChange={(e) => handleInputChange('socialLinks', index, 'handle', e.target.value)}
                      disabled={editingSection !== 'socialLinks' || editingIndex !== index}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    />
                    <input
                      type="text"
                      placeholder="Full URL"
                      value={social.href}
                      onChange={(e) => handleInputChange('socialLinks', index, 'href', e.target.value)}
                      disabled={editingSection !== 'socialLinks' || editingIndex !== index}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={social.enabled}
                        onChange={() => handleSocialLinkToggle(index)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm">Enabled</span>
                    </label>
                    <div className="flex gap-2">
                      {editingSection === 'socialLinks' && editingIndex === index ? (
                        <>
                          <button
                            onClick={() => handleSocialLinkSave(index)}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
                          >
                            <FaSave />
                          </button>
                          <button
                            onClick={() => {
                              setEditingSection(null);
                              setEditingIndex(null);
                              loadFooterContent();
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleSocialLinkEdit(index)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                        >
                          <FaEdit />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageFooter;
