import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './Booking.css';
import Sidebar from './Sidebar';

function Booking({ authToken1 }) {
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [bookingDetails, setBookingDetails] = useState({
    facility: '',
    date: '',
    time: '',
  });

  const handleChange = (e) => {
    setBookingDetails({ ...bookingDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    console.log("authtoken",authToken);
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/api/booking',
        bookingDetails,
        { headers: { Authorization: authToken } } // Pass token in headers
      );

      alert(response.data.message);
      setBookingDetails({
        facility: '',
        date: '',
        time: '',
      });
      navigate('/');
    } catch (err) {
      console.log("error",err);
      alert('Booking failed',err);
    }
  };


  // Sidebar
  const [activeOption, setActiveOption] = useState("User Profile");
  const getContent = () => {
    switch (activeOption) {
      case "User Profile":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <p className="text-gray-600">
              Welcome to your dashboard. Here's an overview of your activity.
            </p>
          </div>
        );
      case "Change Password":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Analytics</h2>
            <p className="text-gray-600">
              View detailed analytics and reports of your business performance.
            </p>
          </div>
        );
      case "Booking History":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Customers</h2>
            <p className="text-gray-600">
              Manage your customer database and view customer information.
            </p>
          </div>
        );
      case "Publications":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-gray-600">
              Adjust your account settings and preferences.
            </p>
          </div>
        );
      case "Results":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Help</h2>
            <p className="text-gray-600">
              Find answers to common questions and get support.
            </p>
          </div>
        );
      case "Booking Facility":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Contact</h2>
            <p className="text-gray-600">
              Get in touch with our support team for assistance.
            </p>
          </div>
        );
      default:
        return <div>Select an option from the sidebar</div>;
    }
  };

  return (
    
    <>
      <Sidebar setActiveOption={setActiveOption} activeOption={activeOption}/>
      {getContent()}
    </>
      
  );
}

export default Booking;
