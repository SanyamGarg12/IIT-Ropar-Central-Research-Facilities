import React, { useEffect, useState } from 'react';
import axios from 'axios';

function BookingHistory({ authToken }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/booking-history', {
        headers: { Authorization: authToken },
      })
      .then((response) => setHistory(response.data))
      .catch((err) => console.error('Failed to fetch booking history', err));
  }, [authToken]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Booking History</h2>
      <ul>
        {history.map((booking, index) => (
          <li key={index}>
            Facility: {booking.facility}, Date: {booking.date}, Time: {booking.time}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BookingHistory;
