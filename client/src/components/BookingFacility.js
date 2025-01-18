import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function BookingFacility({ authToken }) {
  const [facilityId, setFacilityId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [operatorEmail, setOperatorEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [facilityPrice, setFacilityPrice] = useState(0);
  const [costPerHour, setCostPerHour] = useState(0);
  const [showWeeklySlots, setShowWeeklySlots] = useState(false);
  const [weeklySlots, setWeeklySlots] = useState(null);

  const calculateDuration = useCallback((startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours
  }, []);

  const calculateTotalCost = useCallback((startTime, endTime) => {
    const duration = calculateDuration(startTime, endTime);
    return costPerHour * duration;
  }, [calculateDuration, costPerHour]);

  const handleSlotClick = useCallback((slot) => {
    setSelectedSlot(`${slot.start_time} - ${slot.end_time}`);
    setSelectedScheduleId(slot.schedule_id || "");
    const totalCost = calculateTotalCost(slot.start_time, slot.end_time);
    setFacilityPrice(totalCost);
  }, [calculateTotalCost]);

  const getFacilityPrice = useCallback((facility, userType) => {
    let price;
    switch (userType.toLowerCase()) {
      case 'internal':
        price = facility.price_internal;
        break;
      case 'external':
        price = facility.price_external;
        break;
      case 'r_and_d':
        price = facility.price_r_and_d;
        break;
      case 'industry':
        price = facility.price_industry;
        break;
      default:
        price = facility.price_external; // default to external price
    }
    setCostPerHour(price);
    return price;
  }, []);

  const fetchSlots = useCallback(async () => {
    if (!facilityId) {
      alert("Please select a facility first.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/slots?facility_id=${facilityId}&date=${date}`
      );
      setAvailableSlots(response.data.slots);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch available slots. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [facilityId, date]);

  const fetchWeeklySlots = useCallback(async () => {
    if (!facilityId) {
      alert("Please select a facility first.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/weekly-slots?facilityId=${facilityId}`
      );
      setWeeklySlots(response.data.facility);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch weekly slots. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [facilityId]);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/facilities");
        setFacilities(response.data);
        if (response.data.length > 0) {
          setFacilityId(response.data[0].id);
          setOperatorEmail(response.data[0].operator_email);

          // Get user type from token and set initial price
          const token = localStorage.getItem("authToken");
          const decoded = jwtDecode(token);
          const userType = decoded.userType;
          getFacilityPrice(response.data[0], userType);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to fetch facilities. Please refresh the page.");
      }
    };
    fetchFacilities();
  }, [getFacilityPrice]);

  const handleFetchSlots = () => {
    setSelectedSlot("");
    setSelectedScheduleId("");
    fetchSlots();
  };

  const handleBooking = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    const decoded = jwtDecode(token);
    const userId = decoded.userId;
    const userType = decoded.userType;

    axios
      .post(
        "http://localhost:5000/api/booking",
        {
          facility_id: facilityId,
          date,
          schedule_id: selectedScheduleId,
          user_id: userId,
          operator_email: operatorEmail,
          cost: facilityPrice,
          user_type: userType
        },
        { headers: { Authorization: authToken } }
      )
      .then((response) => alert("Booking successful"))
      .catch((err) => alert("Booking failed", err));
  };
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Book a Facility</h2>
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facility Name</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
              value={facilityId}
              onChange={(e) => {
                const selectedFacilityId = e.target.value;
                setFacilityId(selectedFacilityId);
                const selectedFacility = facilities.find(f => String(f.id) === String(selectedFacilityId));
                if (selectedFacility) {
                  setOperatorEmail(selectedFacility.operator_email);
                  const token = localStorage.getItem("authToken");
                  const decoded = jwtDecode(token);
                  const userType = decoded.userType;
                  getFacilityPrice(selectedFacility, userType);
                }
                setSelectedSlot("");
                setSelectedScheduleId("");
                setAvailableSlots([]);
              }}
              required
            >
              <option value="">Select a facility</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>

          {costPerHour > 0 && (
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <p className="text-lg text-blue-800">
                Facility Cost: <span className="font-bold text-xl">{Math.round(facilityPrice * 100) / 100} Rs.</span> 
                <span className="text-sm ml-2">({Math.round(costPerHour * 100) / 100} Rs. per hour)</span>
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Select Date</h3>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedSlot("");
                  setSelectedScheduleId("");
                  setAvailableSlots([]);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm mb-4 focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
              />
              <button
                onClick={handleFetchSlots}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isLoading || !facilityId}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  "Fetch Available Slots"
                )}
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Available Slots</h3>
              <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2">
                {availableSlots.length !== 0 ? (
                  availableSlots.map((slot) => (
                    <button
                      key={slot.schedule_id}
                      onClick={() => handleSlotClick(slot)}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg text-center text-sm font-medium transition duration-300 ease-in-out ${
                        slot.available
                          ? "bg-white hover:bg-green-100 text-gray-800 border border-gray-300 hover:border-green-500"
                          : "bg-gray-200 cursor-not-allowed text-gray-500"
                      } ${
                        selectedScheduleId === slot.schedule_id
                          ? "ring-2 ring-green-500 bg-green-100"
                          : ""
                      }`}
                    >
                      {slot.start_time} - {slot.end_time}
                    </button>
                  ))
                ) : (
                  <div className="col-span-3 text-center text-gray-500 py-8">
                    {isLoading ? "Loading slots..." : "No slots available. Click 'Fetch Available Slots' to check."}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-lg">
              Selected: <span className="font-medium">{date} {selectedSlot}</span>
            </div>
            <button
              onClick={handleBooking}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
              disabled={!selectedScheduleId || !facilityId}
            >
              Book Now
            </button>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => {
                setShowWeeklySlots(true);
                fetchWeeklySlots();
              }}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-200 transition duration-300 ease-in-out transform hover:scale-105"
            >
              View Weekly Slots
            </button>
            <button
              onClick={() => setShowWeeklySlots(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Hide Slots
            </button>
          </div>

          {showWeeklySlots && weeklySlots && (
            <div className="mt-10 bg-gray-50 rounded-xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Weekly Slots for {weeklySlots.name}</h3>
              {Object.entries(weeklySlots.slots).map(([day, slots]) => (
                <div key={day} className="mb-8">
                  <h4 className="font-semibold text-lg text-gray-700 mb-3">{day}</h4>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {slots.map((slot, index) => (
                      <div
                        key={`${day}-${index}`}
                        className="p-2 bg-white rounded-lg border border-gray-200 text-center text-sm text-gray-600 shadow-sm hover:shadow-md transition duration-300 ease-in-out"
                      >
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingFacility;

