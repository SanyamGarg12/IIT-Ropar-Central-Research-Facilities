import React, { useEffect, useState } from 'react';
import './People.css';

function People() {
  const [members, setMembers] = useState([]);

  // Fetch the list of members from the server
  useEffect(() => {
    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch((err) => console.error('Error fetching members:', err));
  }, []);

  return (
    <div className="people-container">
      <h2>Core Committee Members</h2>
      <div className="members-grid">
        {members.map((member, index) => (
          <div key={index} className="member-card">
            <img src={member.photo} alt={member.name} className="member-photo" />
            <h3>{member.name}</h3>
            <p>{member.position}</p>
            <p>{member.intro}</p>
            <a
              href={member.profileLink}
              target="_blank"
              rel="noreferrer"
              className="profile-link"
            >
              View Profile
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default People;
