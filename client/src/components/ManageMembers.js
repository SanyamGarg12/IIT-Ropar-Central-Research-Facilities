import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageMembers.css";

const ManageMembers = () => {
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({
    name: "",
    designation: "",
    profileLink: "",
    image: null, // Image file
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
    const formData = new FormData();
    formData.append("name", newMember.name);
    formData.append("designation", newMember.designation);
    formData.append("profileLink", newMember.profileLink);
    formData.append("image", newMember.image); // File is added here
  
    axios
      .post("http://localhost:5000/api/members", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        fetchMembers();
        setNewMember({ name: "", designation: "", profileLink: "", image: null });
      })
      .catch((error) => console.error("Error adding member:", error));
  };
  
  // Input for file
  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setNewMember({ ...newMember, image: e.target.files[0] })
    }
  />;
  

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
          placeholder="Profile Link"
          value={newMember.profileLink}
          onChange={(e) =>
            setNewMember({ ...newMember, profileLink: e.target.value })
          }
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setNewMember({ ...newMember, image: e.target.files[0] })
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
                src={`/assets/${member.image_path}`}
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
