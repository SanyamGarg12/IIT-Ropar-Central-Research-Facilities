import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageAbout.css';

const ManageAbout = () => {
  const [aboutContent, setAboutContent] = useState({
    messageFromDirector: { heading: '', content: '' },
    departmentIntro: { heading: '', content: '' },
    labObjectives: [],  // Default to an empty array to avoid errors
    vision: '',
    mission: ''
  });

  useEffect(() => {
    // Fetch the current about content from the backend
    axios.get('http://localhost:5000/api/aboutContent')
      .then(response => {
        setAboutContent(prevContent => ({
          ...prevContent,
          ...response.data,
          labObjectives: Array.isArray(response.data.labObjectives) ? response.data.labObjectives : []  // Ensure it's an array
        }));
      })
      .catch(error => {
        console.error('Error fetching about content:', error);
      });
  }, []);

  const handleInputChange = (section, field, value) => {
    setAboutContent(prevContent => ({
      ...prevContent,
      [section]: {
        ...prevContent[section],
        [field]: value
      }
    }));
  };

  const handleLabObjectivesChange = (index, value) => {
    const updatedLabObjectives = [...aboutContent.labObjectives];
    updatedLabObjectives[index] = value;
    setAboutContent(prevContent => ({
      ...prevContent,
      labObjectives: updatedLabObjectives
    }));
  };

  const handleSaveChanges = () => {
    // Send the updated about content to the server to save it
    axios.post('http://localhost:5000/api/saveAboutContent', aboutContent)
      .then(response => {
        alert('Changes saved successfully');
      })
      .catch(error => {
        console.error('Error saving changes:', error);
        alert('Failed to save changes');
      });
  };

  return (
    <div className="manage-about">
      <h2>Manage About Page Content</h2>

      {/* Message from the Director */}
      <div className="section">
        <h3>Edit Message from Director</h3>
        <input
          type="text"
          value={aboutContent.messageFromDirector.heading}
          onChange={(e) => handleInputChange('messageFromDirector', 'heading', e.target.value)}
          placeholder="Heading"
        />
        <textarea
          value={aboutContent.messageFromDirector.content}
          onChange={(e) => handleInputChange('messageFromDirector', 'content', e.target.value)}
          placeholder="Content"
        />
      </div>

      {/* Department Introduction */}
      <div className="section">
        <h3>Edit Department Introduction</h3>
        <input
          type="text"
          value={aboutContent.departmentIntro.heading}
          onChange={(e) => handleInputChange('departmentIntro', 'heading', e.target.value)}
          placeholder="Heading"
        />
        <textarea
          value={aboutContent.departmentIntro.content}
          onChange={(e) => handleInputChange('departmentIntro', 'content', e.target.value)}
          placeholder="Content"
        />
      </div>

      {/* Lab Objectives */}
      <div className="section">
        <h3>Edit Lab Objectives</h3>
        {aboutContent.labObjectives.map((objective, index) => (
          <div key={index} className="lab-objective">
            <textarea
              value={objective}
              onChange={(e) => handleLabObjectivesChange(index, e.target.value)}
              placeholder={`Objective ${index + 1}`}
            />
          </div>
        ))}
        <button onClick={() => setAboutContent(prevContent => ({
          ...prevContent,
          labObjectives: [...prevContent.labObjectives, '']  // Add a new objective
        }))}>
          Add New Objective
        </button>
      </div>

      {/* Vision and Mission */}
      <div className="section">
        <h3>Edit Vision</h3>
        <textarea
          value={aboutContent.vision}
          onChange={(e) => handleInputChange('vision', '', e.target.value)}
          placeholder="Vision"
        />
        <h3>Edit Mission</h3>
        <textarea
          value={aboutContent.mission}
          onChange={(e) => handleInputChange('mission', '', e.target.value)}
          placeholder="Mission"
        />
      </div>

      {/* Save Changes */}
      <button onClick={handleSaveChanges} className="save-btn">Save Changes</button>
    </div>
  );
};

export default ManageAbout;
