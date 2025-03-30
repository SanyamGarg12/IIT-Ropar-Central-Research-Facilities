import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({
    fullName: '',
    email: '',
    password: '',
    userType: 'Internal', // Default value matching ENUM
    contactNumber: '',
    orgName: '',
    idProof: null
  });

  const handleChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setUserDetails({ ...userDetails, idProof: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    for (const key in userDetails) {
      formData.append(key, userDetails[key]);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(response.data.message);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Full Name:
          <input type="text" name="fullName" value={userDetails.fullName} onChange={handleChange} required />
        </label>
        <label>
          Email:
          <input type="email" name="email" value={userDetails.email} onChange={handleChange} required />
        </label>
        <label>
          Password:
          <input type="password" name="password" value={userDetails.password} onChange={handleChange} required />
        </label>
        <label>
          User Type:
          <select name="userType" value={userDetails.userType} onChange={handleChange}>
            <option value="Internal">Internal</option>
            <option value="External Academic">External Academic</option>
            <option value="R&D Lab">R&D Lab</option>
            <option value="Industry">Industry</option>
          </select>
        </label>
        <label>
          Contact Number (Optional):
          <input type="tel" name="contactNumber" value={userDetails.contactNumber} onChange={handleChange} />
        </label>
        <label>
          Organization Name:
          <input type="text" name="orgName" value={userDetails.orgName} onChange={handleChange} />
        </label>
        <label>
          Upload ID Proof:
          <input type="file" name="idProof" onChange={handleFileChange} required />
        </label>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;