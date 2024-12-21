import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

function Register() {
  const [userDetails, setUserDetails] = useState({
    fullName: '',
    email: '',
    password: '',
    userType: 'Internal', // Default value matching ENUM
    contactNumber: '',
  });

  const handleChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/register', userDetails);
      alert(response.data.message);
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
          <input
            type="text"
            name="fullName"
            value={userDetails.fullName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={userDetails.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={userDetails.password}
            onChange={handleChange}
            required
          />
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
          <input
            type="tel"
            name="contactNumber"
            value={userDetails.contactNumber}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
