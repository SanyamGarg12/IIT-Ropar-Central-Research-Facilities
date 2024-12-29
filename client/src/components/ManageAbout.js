import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageAbout.css';

const ManageAbout = () => {
  const [aboutContent, setAboutContent] = useState(null);

  useEffect(() => {
    // Fetch the current about content from the backend
    axios.get('http://localhost:5000/api/aboutContent')
      .then(response => {
        setAboutContent(response.data);
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

  const handleSaveChanges = () => {
    // Send the updated about content to the server to save it
    axios.post('http://localhost:5000/api/saveAboutContent', aboutContent)
      .then(() => {
        alert('Changes saved successfully');
      })
      .catch(error => {
        console.error('Error saving changes:', error);
        alert('Failed to save changes');
      });
  };

  if (!aboutContent) {
    return <div>Loading...</div>;
  }

  return (
    <div className="manage-about">
      <h2>Manage About Page Content</h2>

      {/* Message from Director */}
      <div className="section">
        <h3>{aboutContent.messageFromDirector.title}</h3>
        {aboutContent.messageFromDirector.content.map((message, index) => (
          <div key={index} className="array-item">
            <textarea
              value={message}
              onChange={(e) => handleArrayChange('messageFromDirector', 'content', index, e.target.value)}
              placeholder={`Message ${index + 1}`}
            />
            <button onClick={() => removeArrayItem('messageFromDirector', 'content', index)}>Remove</button>
          </div>
        ))}
        <button onClick={() => addArrayItem('messageFromDirector', 'content')}>Add Message</button>
      </div>

      {/* Department Introduction */}
      <div className="section">
        <h3>{aboutContent.departmentIntro.title}</h3>
        <textarea
          value={aboutContent.departmentIntro.content}
          onChange={(e) => handleInputChange('departmentIntro', 'content', e.target.value)}
          placeholder="Introduction Content"
        />
      </div>

      {/* Lab Objectives */}
      <div className="section">
        <h3>{aboutContent.labObjectives.title}</h3>
        {aboutContent.labObjectives.items.map((item, index) => (
          <div key={index} className="array-item">
            <textarea
              value={item}
              onChange={(e) => handleArrayChange('labObjectives', 'items', index, e.target.value)}
              placeholder={`Objective ${index + 1}`}
            />
            <button onClick={() => removeArrayItem('labObjectives', 'items', index)}>Remove</button>
          </div>
        ))}
        <button onClick={() => addArrayItem('labObjectives', 'items')}>Add Objective</button>
      </div>

      {/* Vision and Mission */}
      <div className="section">
        <h3>Edit Vision and Mission</h3>
        <textarea
          value={aboutContent.visionMission.vision}
          onChange={(e) => handleInputChange('visionMission', 'vision', e.target.value)}
          placeholder="Vision"
        />
        <textarea
          value={aboutContent.visionMission.mission}
          onChange={(e) => handleInputChange('visionMission', 'mission', e.target.value)}
          placeholder="Mission"
        />
      </div>

      {/* Save Changes */}
      <button onClick={handleSaveChanges} className="save-btn">Save Changes</button>
    </div>
  );
};

export default ManageAbout;
