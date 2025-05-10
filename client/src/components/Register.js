import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './Register.css';
import {API_BASED_URL} from '../config.js'; 

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
  const [departments, setDepartments] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');

  useEffect(() => {
    if (userDetails.userType === 'Internal') {
      axios.get(`${API_BASED_URL}api/departments`).then(res => setDepartments(res.data)).catch(() => setDepartments([]));
    }
  }, [userDetails.userType]);

  useEffect(() => {
    if (selectedDepartment) {
      axios.get(`${API_BASED_URL}api/supervisors?department=${encodeURIComponent(selectedDepartment)}`)
        .then(res => setSupervisors(res.data)).catch(() => setSupervisors([]));
    } else {
      setSupervisors([]);
    }
  }, [selectedDepartment]);

  const handleChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setUserDetails({ ...userDetails, idProof: e.target.files[0] });
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    setSelectedSupervisor('');
  };

  const handleSupervisorChange = (e) => {
    setSelectedSupervisor(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    for (const key in userDetails) {
      formData.append(key, userDetails[key]);
    }
    if (userDetails.userType === 'Internal') {
      formData.append('department', selectedDepartment);
      formData.append('supervisor_id', selectedSupervisor);
    }

    try {
      const response = await axios.post(`${API_BASED_URL}api/register`, formData, {
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
        {userDetails.userType === 'Internal' && (
          <>
            <label>
              Department Name:
              <select value={selectedDepartment} onChange={handleDepartmentChange} required>
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </label>
            <label>
              Supervisor:
              <select value={selectedSupervisor} onChange={handleSupervisorChange} required>
                <option value="">Select Supervisor</option>
                {supervisors.map((sup) => (
                  <option key={sup.id} value={sup.id}>{sup.name} ({sup.email})</option>
                ))}
              </select>
            </label>
          </>
        )}
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