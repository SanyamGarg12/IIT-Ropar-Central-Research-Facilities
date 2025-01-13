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

  const handleSlotClick = (time) => {
    setSelectedSlot(time);
  };

  const getFacilityPrice = (facility, userType) => {
    switch(userType.toLowerCase()) {
      case 'internal':
        return facility.price_internal;
      case 'external':
        return facility.price_external;
      case 'r_and_d':
        return facility.price_r_and_d;
      case 'industry':
        return facility.price_industry;
      default:
        return facility.price_external; // default to external price
    }
  };

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
          setFacilityPrice(getFacilityPrice(response.data[0], userType));
        }
      } catch (err) {
        console.error(err);
        alert("Failed to fetch facilities. Please refresh the page.");
      }
    };
    fetchFacilities();
  }, []);

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

    // Get the selected facility and its price
    const selectedFacility = facilities.find(f => String(f.id) === String(facilityId));
    console.log("cost", selectedFacility,  facilityId);
    const cost = getFacilityPrice(selectedFacility, userType);
    axios
      .post(
        "http://localhost:5000/api/booking",
        {
          facility_id: facilityId,
          date,
          schedule_id: selectedScheduleId,
          user_id: userId,
          operator_email: operatorEmail,
          cost: cost,
          user_type: userType
        },
        { headers: { Authorization: authToken } }
      )
      .then((response) => alert("Booking successful"))
      .catch((err) => alert("Booking failed", err));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="border rounded-md p-4 mt-4">
        <h2 className="text-xl font-semibold mb-4">Book Slot</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Facility Name</label>
            <select
              className="w-full p-2 border rounded"
              value={facilityId}
              onChange={(e) => {
                const selectedFacilityId = e.target.value;
                setFacilityId(selectedFacilityId);
                const selectedFacility = facilities.find(f => String(f.id) === String(selectedFacilityId));
                if (selectedFacility) {
                  setOperatorEmail(selectedFacility.operator_email);
                  
                  // Update price when facility changes
                  const token = localStorage.getItem("authToken");
                  const decoded = jwtDecode(token);
                  const userType = decoded.userType;
                  setFacilityPrice(getFacilityPrice(selectedFacility, userType));
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

          {facilityPrice > 0 && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                Facility Cost: <span className="font-semibold">${facilityPrice.toFixed(2)}</span>
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border rounded-md p-4">
              <h2 className="text-xl font-semibold mb-4">Select Date</h2>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedSlot("");
                  setSelectedScheduleId("");
                  setAvailableSlots([]);
                }}
                className="w-full p-2 border rounded mb-4"
              />
              <button
                onClick={handleFetchSlots}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300 disabled:opacity-50"
                disabled={isLoading || !facilityId}
              >
                {isLoading ? "Loading..." : "Fetch Available Slots"}
              </button>
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
                    {isLoading ? "Loading slots..." : "No slots available. Click 'Fetch Available Slots' to check."}
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
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex-1 transition duration-300 disabled:opacity-50"
              disabled={!selectedScheduleId || !facilityId}
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

