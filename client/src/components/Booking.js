import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Booking.css";

const Booking = () => {
  const [userType, setUserType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  const [bookingHistory, setBookingHistory] = useState([]);
  const [cost, setCost] = useState("");

  // Fetch facilities after login
  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:5000/facilities", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setFacilities(res.data);
        })
        .catch((err) => console.error("Error fetching facilities:", err));
    }
  }, [token]);

  // Handle user login
  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
      setToken(res.data.token);
      setIsLoggedIn(true);
      alert("Login successful!");
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed. Check your credentials.");
    }
  };

  // Handle user registration
  const handleRegister = async () => {
    try {
      const res = await axios.post("http://localhost:5000/register", {
        userType,
        fullName: email.split("@")[0], // Example: deriving name from email
        email,
        password,
        contactNumber: "1234567890", // Replace with user input
      });
      alert("Registration successful! Please log in.");
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Registration failed. Try again.");
    }
  };

  // Handle booking creation
  const handleBooking = async () => {
    if (!selectedFacility || !bookingDate || !bookingTime) {
      alert("Please fill all fields for booking.");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:5000/book",
        {
          facilityName: selectedFacility,
          bookingDate,
          bookingTime,
          cost,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Booking successful!");
    } catch (error) {
      console.error("Error during booking:", error);
      alert("Booking failed. Try again.");
    }
  };

  // Fetch booking history
  const fetchBookingHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/booking-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookingHistory(res.data);
    } catch (error) {
      console.error("Error fetching booking history:", error);
      alert("Failed to fetch booking history.");
    }
  };

  return (
    <div className="booking-container">
      {!isLoggedIn ? (
        <div className="login-register">
          <h2>Login</h2>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="">Select User Type</option>
            <option value="Internal">Internal</option>
            <option value="External">External Academic</option>
            <option value="R&D Lab">R&D Lab</option>
            <option value="Industry">Industry</option>
          </select>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          <h2>New User?</h2>
          <button onClick={handleRegister}>Register</button>
        </div>
      ) : (
        <div className="booking-actions">
          <h2>Book a Facility</h2>
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
          >
            <option value="">Select Facility</option>
            {facilities.map((facility, index) => (
              <option key={index} value={facility}>
                {facility}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
          />
          <input
            type="time"
            value={bookingTime}
            onChange={(e) => setBookingTime(e.target.value)}
          />
          <input
            type="number"
            placeholder="Cost (optional)"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
          <button onClick={handleBooking}>Book</button>

          <h2>Booking History</h2>
          <button onClick={fetchBookingHistory}>View History</button>
          <ul>
            {bookingHistory.map((history, index) => (
              <li key={index}>
                {history.facility_name} - {history.booking_date} {history.booking_time} - ₹{history.cost}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Booking;
