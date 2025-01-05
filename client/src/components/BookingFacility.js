import React, { useEffect, useState } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

function BookingFacility({ authToken }) {
  const [facility, setFacility] = useState("1");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [facilities, setFacilities] = useState([]);
  const handleSlotClick = (time) => {
    setSelectedSlot(time);
  };

  useEffect(() => {

    const fetchFacilities = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/facilities");
        setFacilities(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFacilities();
  }, []);


  useEffect(() => {
    // fetch available slots
    const fetchSlots = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/slots?facility_id=${facility}&date=${date}`
        );
        // setSelectedSlot(null);
        // console.log(response.data);
        setAvailableSlots(response.data.slots);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSlots(); 
  }, [facility, date])
  

  const handleBooking = (e) => {
    const token = localStorage.getItem("authToken");
    const decoded = jwtDecode(token);
    const userId = decoded.userId;
    e.preventDefault();
    axios
      .post(
        "http://localhost:5000/api/booking",
        { facility, date, schedule_id: selectedScheduleId, user_id: userId },
        { headers: { Authorization: authToken } }
      )
      .then((response) => alert("Booking successful"))
      .catch((err) => alert("Booking failed"));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* <h1 className="text-3xl font-bold mb-8">Facility Booking</h1> */}

      <div className="border rounded-md p-4 mt-4">
        <h2 className="text-xl font-semibold mb-4">Book Slot</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Facility Name</label>
            <select
              type="text"
              className="w-full p-2 border rounded"
              value={facility}
              onChange={(e) => {
                setFacility(e.target.value);
                // console.log(e.target.value);
              }}
              required
            >
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>
          {/* <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded"
                placeholder="Your email"
                required
              />
            </div> */}
          {/* <div>
              <label className="block text-sm font-medium">
                Purpose of Booking
              </label>
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Briefly describe the purpose of your booking"
                required
              />
            </div> */}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border rounded-md p-4">
              <h2 className="text-xl font-semibold mb-4">Select Date</h2>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="border rounded-md p-4 max-h-64 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Available Slots</h2>
              <div className="grid grid-cols-3 gap-4 ">
                {availableSlots.length !== 0 ? (
                  availableSlots.map((slot) => (
                    <button
                      key={slot.schedule_id}
                      onClick={() => {
                        slot.available &&
                          handleSlotClick(
                            `${slot.start_time} - ${slot.end_time}`
                          );
                        setSelectedScheduleId(slot.schedule_id);
                      }}
                      disabled={!slot.available}
                      className={`p-2 rounded border text-center ${
                        slot.available
                          ? "bg-white hover:bg-green-400 text-black outline outline-1"
                          : "bg-gray-200 cursor-not-allowed hover:bg-red-400 text-white outline outline-1"
                      } ${
                        selectedScheduleId === slot.schedule_id
                          ? "border-green-500 ring-2 bg-green-500"
                          : ""
                      }`}
                    >
                      {slot.start_time} - {slot.end_time}
                    </button>
                  ))
                ) : (
                  <div className="grid col-span-3 text-center">
                    No slots available on this day.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="mx-2 flex-1">
              {date} from {selectedSlot}
            </div>
            <button
              onClick={handleBooking}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex-1"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingFacility;