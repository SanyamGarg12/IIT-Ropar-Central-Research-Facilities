import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {API_BASED_URL} from '../config.js'; 
import { useNavigate } from 'react-router-dom';

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
  const [receipt, setReceipt] = useState(null);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const isWithin24Hours = useCallback((selectedDate, startTime) => {
    const now = new Date();
    const bookingDateTime = new Date(`${selectedDate}T${startTime}`);
    const timeDifference = bookingDateTime - now;
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    return hoursDifference < 24;
  }, []);

  const calculateDuration = useCallback((startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end - start) / (1000 * 60 * 60);
  }, []);

  const calculateTotalCost = useCallback((startTime, endTime) => {
    const duration = calculateDuration(startTime, endTime);
    return costPerHour * duration;
  }, [calculateDuration, costPerHour]);

  const handleSlotClick = useCallback((slot) => {
    if (isWithin24Hours(date, slot.start_time)) {
      alert("Cannot book slots that start within the next 24 hours. Please select a different slot.");
      return;
    }
    setSelectedSlot(`${slot.start_time} - ${slot.end_time}`);
    setSelectedScheduleId(slot.schedule_id || "");
    const totalCost = calculateTotalCost(slot.start_time, slot.end_time);
    setFacilityPrice(totalCost);
  }, [calculateTotalCost, date, isWithin24Hours]);

  const getFacilityPrice = useCallback((facility, userType) => {
    let price;
    switch (userType.toLowerCase()) {
      case 'internal':
        price = facility.price_internal;
        break;
      case 'internal consultancy':
        price = facility.price_external;
        break;
      case 'government r&d lab or external academics':
        price = facility.price_r_and_d;
        break;
      case 'private industry or private r&d lab':
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
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        alert('Authentication token not found. Please log in again.');
        navigate("/login");
        return;
      }
      const response = await axios.get(
        `${API_BASED_URL}api/slots?facility_id=${facilityId}&date=${date}`,
        {
          header: {
            Authorization: authToken
          }
        }
      );

      if (response.status && (response.status === 401 || response.status === 403)) {
        alert("Session expired. Please log in again.");
        localStorage.clear(); // Clear localStorage to logout user
        // Redirect to login page
        navigate("/login");
        return;
      }
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
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        alert('Authentication token not found. Please log in again.');
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API_BASED_URL}api/weekly-slots?facilityId=${facilityId}`,
        {
          headers: {
            Authorization: authToken
          }
        }
      );
      if (response.status && (response.status === 401 || response.status === 403)) {
        alert("Session expired. Please log in again.");
        localStorage.clear(); // Clear localStorage to logout user
        // Redirect to login page
        navigate("/login");
        return;
      }
      setWeeklySlots(response.data.facility);
    } catch (err) {
      // console.error(err);
      alert("Failed to fetch weekly slots. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [facilityId]);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await axios.get(`${API_BASED_URL}api/facilities`);
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

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      // Accept PDF and common image types
      if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
        alert('Please upload PDF or image files only for receipts.');
        fileInputRef.current.value = '';
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please upload a smaller file.');
        fileInputRef.current.value = '';
        return;
      }
      
      setReceipt(file);
    }
  };

  const uploadReceipt = async () => {
    if (!receipt) {
      alert('Please select a receipt file to upload');
      return null;
    }

    setUploadingReceipt(true);
    
    const formData = new FormData();
    formData.append('receipt', receipt);
    // Use a temporary ID for pre-booking upload
    formData.append('tempId', Date.now().toString());

    try {
      console.log('Uploading receipt...');
      const response = await axios.post(
        `${API_BASED_URL}api/upload-receipt-pre-booking`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: authToken
          }
        }
      );
      if (response.status && (response.status === 401 || response.status === 403)) {
        alert("Session expired. Please log in again.");
        localStorage.clear(); // Clear localStorage to logout user
        // Redirect to login page
        navigate("/login");
        return;
      }
      setReceiptUploaded(true);
      console.log('Receipt uploaded successfully');
      // Return the path for booking creation
      return response.data.path;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      alert(`Failed to upload receipt: ${errorMsg}. Please try again.`);
      return null;
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!receipt) {
      alert("Please upload a payment receipt before booking");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First upload the receipt
      const receiptPath = await uploadReceipt();
      
      // If receipt upload failed, abort booking
      if (!receiptPath) {
        alert("Booking failed: Receipt upload unsuccessful");
        setIsLoading(false);
        return;
      }
      
      const token = localStorage.getItem("authToken");
      const decoded = jwtDecode(token);
      const userId = decoded.userId;
      const userType = decoded.userType;
      
      // Now proceed with booking with the receipt path
      const response = await axios.post(
        `${API_BASED_URL}api/booking`,
        {
          facility_id: facilityId,
          date,
          schedule_id: selectedScheduleId,
          user_id: userId,
          operator_email: operatorEmail,
          cost: facilityPrice,
          user_type: userType,
          receipt_path: receiptPath
        },
        { headers: { Authorization: authToken } }
      );
      if (response.status && (response.status === 401 || response.status === 403)) {
        alert("Session expired. Please log in again.");
        localStorage.clear(); // Clear localStorage to logout user
        // Redirect to login page
        navigate("/login");
        return;
      }
      alert("Booking submitted for approval");
      // Reset form state
      setSelectedSlot("");
      setSelectedScheduleId("");
      setReceipt(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      alert("Booking failed: " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
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
                  availableSlots.map((slot) => {
                    const isSlotWithin24Hours = isWithin24Hours(date, slot.start_time);
                    return (
                      <button
                        key={slot.schedule_id}
                        onClick={() => handleSlotClick(slot)}
                        disabled={!slot.available || isSlotWithin24Hours}
                        className={`p-3 rounded-lg text-center text-sm font-medium transition duration-300 ease-in-out ${
                          slot.available && !isSlotWithin24Hours
                            ? "bg-white hover:bg-green-100 text-gray-800 border border-gray-300 hover:border-green-500"
                            : "bg-gray-200 cursor-not-allowed text-gray-500"
                        } ${
                          selectedScheduleId === slot.schedule_id
                            ? "ring-2 ring-green-500 bg-green-100"
                            : ""
                        }`}
                        title={isSlotWithin24Hours ? "Cannot book slots that start within 24 hours" : ""}
                      >
                        {slot.start_time} - {slot.end_time}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-3 text-center text-gray-500 py-8">
                    {isLoading ? "Loading slots..." : "No slots available. Click 'Fetch Available Slots' to check."}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Payment Receipt</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please upload a receipt of your payment for booking this facility. 
              Supported formats: PDF, JPEG, PNG, and other common image formats. Maximum file size: 5MB.
            </p>
            
            <div className="flex flex-col space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf,image/*"
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-sm text-gray-500"
                disabled={uploadingReceipt || receiptUploaded || isLoading}
              />
              {receipt && (
                <div className="flex items-center space-x-2 bg-green-50 p-2 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-600 text-sm font-medium">
                    {receipt.name} selected
                  </span>
                </div>
              )}
              {uploadingReceipt && (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-blue-600 text-sm">Uploading receipt...</span>
                </div>
              )}
              {receiptUploaded && (
                <div className="flex items-center space-x-2 bg-green-50 p-2 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-600 text-sm font-medium">Receipt uploaded successfully!</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-lg">
              Selected: <span className="font-medium">{date} {selectedSlot}</span>
            </div>
            <button
              onClick={handleBooking}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
              disabled={!selectedScheduleId || !facilityId || !receipt || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Book Now"
              )}
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
