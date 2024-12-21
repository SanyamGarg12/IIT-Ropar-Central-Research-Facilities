import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageMembers.css";
// import './ManageMembers.css?v=1.0';

const ManageMembers = () => {
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({
    name: "",
    designation: "",
    imageLink: "", // For Google Drive link
  });

  // Fetch existing members
  const fetchMembers = () => {
    axios
      .get("http://localhost:5000/api/members")
      .then((response) => setMembers(response.data))
      .catch((error) => console.error("Error fetching members:", error));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Handle the addition of a new member
  const handleAddMember = () => {
    const memberData = {
      name: newMember.name,
      designation: newMember.designation,
      imageLink: newMember.imageLink, // Send the image URL
    };

    axios
      .post("http://localhost:5000/api/members", memberData)
      .then(() => {
        fetchMembers();
        setNewMember({ name: "", designation: "", imageLink: "" });
      })
      .catch((error) => console.error("Error adding member:", error));
  };

  const handleDeleteMember = (id) => {
    axios
      .delete(`http://localhost:5000/api/members/${id}`)
      .then(() => fetchMembers())
      .catch((error) => console.error("Error deleting member:", error));
  };

  return (
    <div>
      <h2>Manage Members</h2>

      {/* Form to add a new member */}
      <div>
        <h3>Add Member</h3>
        <input
          type="text"
          placeholder="Name"
          value={newMember.name}
          onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Designation"
          value={newMember.designation}
          onChange={(e) =>
            setNewMember({ ...newMember, designation: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Google Drive Image URL"
          value={newMember.imageLink}
          onChange={(e) =>
            setNewMember({ ...newMember, imageLink: e.target.value })
          }
        />
        <button onClick={handleAddMember}>Add Member</button>
      </div>

      {/* List of members */}
      <h3>Existing Members</h3>
      <ul>
        {members.map((member) => (
          <li key={member.id}>
            <h4>{member.name}</h4>
            <p>{member.designation}</p>
            {member.image_path && (
              <img
                src={`https://drive.google.com/uc?export=view&id=${member.image_path}`}
                alt={member.name}
                width="100"
              />
            )}
            <button onClick={() => handleDeleteMember(member.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageMembers;
