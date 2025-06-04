import React, { useState, useEffect } from "react";
import axios from "axios";
import {API_BASED_URL} from '../config.js'; 

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${API_BASED_URL}uploads/${cleanPath}`;
};

const ManageMembers = () => {
  const [members, setMembers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [newMember, setNewMember] = useState({
    name: "",
    designation: "",
    profileLink: "",
    image: null,
  });
  const [newStaff, setNewStaff] = useState({
    name: "",
    designation: "",
    phone: "",
    email: "",
    office_address: "",
    qualification: "",
    image: null,
  });
  const [imageError, setImageError] = useState(false);
  const [memberImageError, setMemberImageError] = useState({});
  const [staffImageError, setStaffImageError] = useState({});

  // Fetch existing members and staff
  const fetchMembers = () => {
    axios
      .get(`${API_BASED_URL}api/members`)
      .then((response) => setMembers(response.data))
      .catch((error) => console.error("Error fetching members:", error));
  };

  const fetchStaff = () => {
    axios
      .get(`${API_BASED_URL}api/staff`)
      .then((response) => setStaff(response.data))
      .catch((error) => console.error("Error fetching staff:", error));
  };

  useEffect(() => {
    fetchMembers();
    fetchStaff();
  }, []);

  // Handle the addition of a new member
  const handleAddMember = () => {
    const formData = new FormData();
    formData.append("name", newMember.name);
    formData.append("designation", newMember.designation);
    formData.append("profileLink", newMember.profileLink);
    formData.append("image", newMember.image);
  
    axios
      .post(`${API_BASED_URL}api/members`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        fetchMembers();
        setNewMember({ name: "", designation: "", profileLink: "", image: null });
      })
      .catch((error) => console.error("Error adding member:", error));
  };

  // Handle the addition of a new staff member
  const handleAddStaff = () => {
    const formData = new FormData();
    Object.keys(newStaff).forEach(key => {
      formData.append(key, newStaff[key]);
    });
  
    axios
      .post(`${API_BASED_URL}api/staff`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        fetchStaff();
        setNewStaff({
          name: "",
          designation: "",
          phone: "",
          email: "",
          office_address: "",
          qualification: "",
          image: null,
        });
      })
      .catch((error) => console.error("Error adding staff:", error));
  };

  const handleDeleteMember = (id) => {
    axios
      .delete(`${API_BASED_URL}api/members/${id}`)
      .then(() => fetchMembers())
      .catch((error) => console.error("Error deleting member:", error));
  };

  const handleDeleteStaff = (id) => {
    axios
      .delete(`${API_BASED_URL}api/staff/${id}`)
      .then(() => fetchStaff())
      .catch((error) => console.error("Error deleting staff:", error));
  };

  const handleImageError = (id, type) => {
    if (type === 'member') {
      setMemberImageError(prev => ({ ...prev, [id]: true }));
    } else {
      setStaffImageError(prev => ({ ...prev, [id]: true }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">Manage Members and Staff</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Members Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">Committee Members</h3>
          
          {/* Form to add a new member */}
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h4 className="text-xl font-semibold mb-4">Add Member</h4>
            <div className="mb-4">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Designation"
                value={newMember.designation}
                onChange={(e) => setNewMember({ ...newMember, designation: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Profile Link"
                value={newMember.profileLink}
                onChange={(e) => setNewMember({ ...newMember, profileLink: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="file"
                accept="image/*"
                onChange={(e) => setNewMember({ ...newMember, image: e.target.files[0] })}
              />
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleAddMember}
            >
              Add Member
            </button>
          </div>

          {/* List of members */}
          <h4 className="text-xl font-semibold mb-4">Existing Members</h4>
          <ul className="space-y-4">
            {members.map((member) => (
              <li key={member.id} className="bg-white shadow-md rounded px-8 py-4">
                <h5 className="text-lg font-semibold">{member.name}</h5>
                <p className="text-gray-600">{member.designation}</p>
                {member.image_path && (
                  <div className="relative w-24 h-24 mt-2">
                    <img
                      src={getImageUrl(member.image_path)}
                      alt={member.name}
                      className="w-24 h-24 object-cover rounded-full"
                      onError={() => handleImageError(member.id, 'member')}
                    />
                    {memberImageError[member.id] && (
                      <div className="absolute inset-0 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Failed to load</span>
                      </div>
                    )}
                  </div>
                )}
                <button
                  className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => handleDeleteMember(member.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Staff Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">Staff Members</h3>
          
          {/* Form to add a new staff member */}
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h4 className="text-xl font-semibold mb-4">Add Staff Member</h4>
            {Object.keys(newStaff).map(key => (
              key !== 'image' && (
                <div className="mb-4" key={key}>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
                    value={newStaff[key]}
                    onChange={(e) => setNewStaff({ ...newStaff, [key]: e.target.value })}
                  />
                </div>
              )
            ))}
            <div className="mb-4">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="file"
                accept="image/*"
                onChange={(e) => setNewStaff({ ...newStaff, image: e.target.files[0] })}
              />
            </div>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleAddStaff}
            >
              Add Staff Member
            </button>
          </div>

          {/* List of staff members */}
          <h4 className="text-xl font-semibold mb-4">Existing Staff Members</h4>
          <ul className="space-y-4">
            {staff.map((staffMember) => (
              <li key={staffMember.id} className="bg-white shadow-md rounded px-8 py-4">
                <h5 className="text-lg font-semibold">{staffMember.name}</h5>
                <p className="text-gray-600">{staffMember.designation}</p>
                <p className="text-gray-600">{staffMember.email}</p>
                <p className="text-gray-600">{staffMember.phone}</p>
                {staffMember.image_name && (
                  <div className="relative w-24 h-24 mt-2">
                    <img
                      src={getImageUrl(staffMember.image_name)}
                      alt={staffMember.name}
                      className="w-24 h-24 object-cover rounded-full"
                      onError={() => handleImageError(staffMember.id, 'staff')}
                    />
                    {staffImageError[staffMember.id] && (
                      <div className="absolute inset-0 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Failed to load</span>
                      </div>
                    )}
                  </div>
                )}
                <button
                  className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => handleDeleteStaff(staffMember.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageMembers;

