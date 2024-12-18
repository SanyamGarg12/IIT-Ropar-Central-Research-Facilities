import React, { useEffect, useState } from "react";
import axios from "axios";
import "./People.css";

const People = () => {
  const [members, setMembers] = useState([]);

  // Fetch members on component mount
  useEffect(() => {
    axios
      .get("/api/members")
      .then((response) => setMembers(response.data))
      .catch((error) => console.error("Error fetching members:", error));
  }, []);

  return (
    <div className="people-page">
      <h1>Core Committee Members</h1>
      <div className="members-grid">
        {members.map((member) => (
          <div key={member._id} className="member-card">
            <img
              src={`/uploads/${member.photo}`}
              alt={`${member.name}'s photo`}
              className="member-photo"
            />
            <h2>{member.name}</h2>
            <p>{member.designation}</p>
            {member.profileLink && (
              <a href={member.profileLink} target="_blank" rel="noreferrer">
                View Profile
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default People;
