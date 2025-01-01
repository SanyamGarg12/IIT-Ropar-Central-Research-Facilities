import React, { useState } from 'react';
import axios from 'axios';

function BookingFacility({ authToken }) {
  const [facility, setFacility] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleBooking = (e) => {
    e.preventDefault();
    axios
      .post(
        'http://localhost:5000/api/booking',
        { facility, date, time },
        { headers: { Authorization: authToken } }
      )
      .then((response) => alert('Booking successful'))
      .catch((err) => alert('Booking failed'));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Book a Facility</h2>
      <form onSubmit={handleBooking}>
        <input
          type="text"
          placeholder="Facility Name"
          value={facility}
          onChange={(e) => setFacility(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <button type="submit">Book</button>
      </form>
    </div>
  );
}

export default BookingFacility;
