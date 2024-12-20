import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './People.css';

const People = () => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    // Fetch members from the backend
    axios.get('http://localhost:3001/members')
      .then((response) => {
        console.log(response.data); // Log the fetched data
        setMembers(response.data); // Store members data in state
      })
      .catch((error) => {
        console.error('Error fetching members:', error);
      });
  }, []);

  return (
    <div className="people-container">
      <h1>Core Committee Members</h1>
      <div className="people-list">
        {members.length === 0 ? (
          <p>No members found</p>
        ) : (
          members.map((member) => (
            <div className="person-card" key={member.id}>
              <div className="person-image">
                {/* Assuming member.image is a base64 encoded string */}
                <img 
                  src={`data:image/jpeg;base64,${member.image}`} 
                  alt={member.name} 
                />
              </div>
              <div className="person-info">
                <h3>{member.name}</h3>
                <p>{member.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default People;
