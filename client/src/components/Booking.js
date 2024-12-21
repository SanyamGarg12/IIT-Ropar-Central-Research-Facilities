import React, { useState } from 'react';
import axios from 'axios';
import './Booking.css';

function Booking({ authToken }) {
  const [bookingDetails, setBookingDetails] = useState({
    facility: '',
    date: '',
    time: '',
  });

  const handleChange = (e) => {
    setBookingDetails({ ...bookingDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/api/booking',
        bookingDetails,
        { headers: { Authorization: authToken } } // Pass token in headers
      );
      alert(response.data.message);
    } catch (err) {
      alert('Booking failed');
    }
  };

  return (
    <div className="booking-container">
      <h1>Facility Booking</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Facility:
          <input type="text" name="facility" value={bookingDetails.facility} onChange={handleChange} required />
        </label>
        <label>
          Date:
          <input type="date" name="date" value={bookingDetails.date} onChange={handleChange} required />
        </label>
        <label>
          Time:
          <input type="time" name="time" value={bookingDetails.time} onChange={handleChange} required />
        </label>
        <button type="submit">Book</button>
      </form>
    </div>
  );
}

export default Booking;
