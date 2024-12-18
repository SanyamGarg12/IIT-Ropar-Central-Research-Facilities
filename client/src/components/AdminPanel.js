import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({
    name: "",
    designation: "",
    profileLink: "",
    photo: null,
  });

  // Fetch members from backend on page load
  useEffect(() => {
    axios
      .get("/api/members")
      .then((response) => setMembers(response.data))
      .catch((error) => console.error("Error fetching members:", error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMember({ ...newMember, [name]: value });
  };

  const handlePhotoChange = (e) => {
    setNewMember({ ...newMember, photo: e.target.files[0] });
  };

  const addMember = () => {
    if (!newMember.name || !newMember.designation || !newMember.photo) {
      alert("Please fill in all required fields.");
      return;
    }

    // Create FormData to handle file upload
    const formData = new FormData();
    formData.append("name", newMember.name);
    formData.append("designation", newMember.designation);
    formData.append("profileLink", newMember.profileLink);
    formData.append("photo", newMember.photo);

    axios
      .post("/api/members", formData)
      .then((response) => {
        setMembers([...members, response.data]); // Update local state
        setNewMember({ name: "", designation: "", profileLink: "", photo: null }); // Reset form
      })
      .catch((error) => console.error("Error adding member:", error));
  };

  const deleteMember = (id) => {
    axios
      .delete(`/api/members/${id}`)
      .then(() => {
        const updatedMembers = members.filter((member) => member._id !== id);
        setMembers(updatedMembers);
      })
      .catch((error) => console.error("Error deleting member:", error));
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel - Add Core Committee Members</h1>
      
      <div className="form-container">
        <h2>Add Member</h2>
        <form>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={newMember.name}
            onChange={handleInputChange}
            placeholder="Enter member's name"
            required
          />

          <label>Designation:</label>
          <input
            type="text"
            name="designation"
            value={newMember.designation}
            onChange={handleInputChange}
            placeholder="Enter designation"
            required
          />

          <label>Profile Link (optional):</label>
          <input
            type="url"
            name="profileLink"
            value={newMember.profileLink}
            onChange={handleInputChange}
            placeholder="Enter profile link (if any)"
          />

          <label>Upload Photo:</label>
          <input
            type="file"
            name="photo"
            onChange={handlePhotoChange}
            accept="image/*"
            required
          />

          <button type="button" onClick={addMember}>
            Add Member
          </button>
        </form>
      </div>

      <div className="members-list">
        <h2>Current Members</h2>
        {members.length === 0 ? (
          <p>No members added yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Profile Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member._id}>
                  <td>
                    <img
                      src={`/uploads/${member.photo}`}
                      alt={`${member.name}'s photo`}
                      className="thumbnail"
                    />
                  </td>
                  <td>{member.name}</td>
                  <td>{member.designation}</td>
                  <td>
                    {member.profileLink ? (
                      <a href={member.profileLink} target="_blank" rel="noreferrer">
                        Visit Profile
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    <button onClick={() => deleteMember(member._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
