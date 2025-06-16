import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {API_BASED_URL} from '../config.js'; 
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CreditCard, QrCode, Building2, CheckCircle2 } from 'lucide-react';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${API_BASED_URL}${cleanPath}`;
};

function BookingFacility({ authToken }) {
  const [facilityId, setFacilityId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [operatorEmail, setOperatorEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWeeklySlots, setShowWeeklySlots] = useState(false);
  const [weeklySlots, setWeeklySlots] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [bifurcations, setBifurcations] = useState([]);
  const [selectedBifurcations, setSelectedBifurcations] = useState([]);
  const [sampleCounts, setSampleCounts] = useState({});
  const [totalCost, setTotalCost] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [imageError, setImageError] = useState(false);

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

  const getBifurcationPrice = useCallback((bifurcation) => {
    const token = localStorage.getItem("authToken");
    const decoded = jwtDecode(token);
    const userType = decoded.userType.toLowerCase();
    
    switch (userType) {
      case 'internal':
        return bifurcation.price_internal;
      case 'internal consultancy':
        return bifurcation.price_internal_consultancy;
      case 'government r&d lab or external academics':
        return bifurcation.price_external;
      case 'private industry or private r&d lab':
        return bifurcation.price_industry;
      default:
        return bifurcation.price_external;
    }
  }, []);

  const calculateTotalCost = useCallback((startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
    const duration = calculateDuration(startTime, endTime);
    let total = 0;
    
    selectedBifurcations.forEach(bifurcationId => {
      const bifurcation = bifurcations.find(b => b.id === bifurcationId);
      if (!bifurcation) return;
      
      const price = getBifurcationPrice(bifurcation);
      const sampleCount = sampleCounts[bifurcationId] || 1;
      
      let bifurcationCost = 0;
      switch (bifurcation.pricing_type) {
        case 'slot':
          bifurcationCost = price * sampleCount;
          break;
        case 'hour':
          bifurcationCost = price * duration * sampleCount;
          break;
        case 'half-hour':
          bifurcationCost = price * (duration * 2) * sampleCount;
          break;
        default:
          bifurcationCost = price * sampleCount;
      }
      
      total += bifurcationCost;
    });
    
    return total;
  }, [calculateDuration, selectedBifurcations, bifurcations, getBifurcationPrice, sampleCounts]);

  const handleSlotClick = useCallback((slot) => {
    if (isWithin24Hours(date, slot.start_time)) {
      alert("Cannot book slots that start within the next 24 hours. Please select a different slot.");
      return;
    }
    setSelectedSlot(`${slot.start_time} - ${slot.end_time}`);
    setSelectedScheduleId(slot.schedule_id || "");
    const cost = calculateTotalCost(slot.start_time, slot.end_time);
    setTotalCost(cost);
  }, [calculateTotalCost, date, isWithin24Hours]);

  const fetchBifurcations = useCallback(async (facilityId) => {
    try {
      const response = await axios.get(`${API_BASED_URL}api/facility/${facilityId}/bifurcations`);
      setBifurcations(response.data);
    } catch (err) {
      console.error('Error fetching bifurcations:', err);
      alert("Failed to fetch facility bifurcations. Please try again.");
    }
  }, []);

  const handleBifurcationChange = useCallback((bifurcationId) => {
    setSelectedBifurcations(prev => {
      const isSelected = prev.includes(bifurcationId);
      if (isSelected) {
        setSampleCounts(prev => {
          const newCounts = { ...prev };
          delete newCounts[bifurcationId];
          return newCounts;
        });
        return prev.filter(id => id !== bifurcationId);
      } else {
        setSampleCounts(prev => ({
          ...prev,
          [bifurcationId]: 1
        }));
        return [...prev, bifurcationId];
      }
    });
  }, []);

  const handleSampleCountChange = useCallback((bifurcationId, count) => {
    const numCount = parseInt(count) || 0;
    setSampleCounts(prev => ({
      ...prev,
      [bifurcationId]: numCount
    }));
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
        localStorage.clear();
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
  }, [facilityId, date, navigate]);

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
      );
      if (response.status && (response.status === 401 || response.status === 403)) {
        alert("Session expired. Please log in again.");
        localStorage.clear();
        navigate("/login");
        return;
      }
      setWeeklySlots(response.data.facility);
    } catch (err) {
      alert("Failed to fetch weekly slots. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [facilityId, navigate]);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await axios.get(`${API_BASED_URL}api/facilities`);
        setFacilities(response.data);
        if (response.data.length > 0) {
          const firstFacility = response.data[0];
          setFacilityId(firstFacility.id);
          setOperatorEmail(firstFacility.operator_email);
          fetchBifurcations(firstFacility.id);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to fetch facilities. Please refresh the page.");
      }
    };
    fetchFacilities();
  }, [fetchBifurcations]);

  useEffect(() => {
    if (selectedSlot) {
      const [startTime, endTime] = selectedSlot.split(" - ");
      const cost = calculateTotalCost(startTime, endTime);
      setTotalCost(cost);
    }
  }, [selectedBifurcations, selectedSlot, calculateTotalCost]);

  const handleFetchSlots = () => {
    setSelectedSlot("");
    setSelectedScheduleId("");
    fetchSlots();
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
        alert('Please upload PDF or image files only for receipts.');
        fileInputRef.current.value = '';
        return;
      }
      
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
    formData.append('tempId', Date.now().toString());

    try {
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
        localStorage.clear();
        navigate("/login");
        return;
      }
      setReceiptUploaded(true);
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

    if (selectedBifurcations.length === 0) {
      alert("Please select at least one facility bifurcation");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const receiptPath = await uploadReceipt();
      
      if (!receiptPath) {
        alert("Booking failed: Receipt upload unsuccessful");
        setIsLoading(false);
        return;
      }
      
      const token = localStorage.getItem("authToken");
      const decoded = jwtDecode(token);
      const userId = decoded.userId;
      const userType = decoded.userType;
      
      // First create the booking
      const bookingResponse = await axios.post(
        `${API_BASED_URL}api/booking`,
        {
          facility_id: facilityId,
          date,
          schedule_id: selectedScheduleId,
          user_id: userId,
          operator_email: operatorEmail,
          cost: totalCost,
          user_type: userType,
          receipt_path: receiptPath,
          bifurcation_ids: selectedBifurcations
        },
        { 
          headers: { 
            Authorization: token 
          } 
        }
      );

      if (bookingResponse.status && (bookingResponse.status === 401 || bookingResponse.status === 403)) {
        alert("Session expired. Please log in again.");
        localStorage.clear();
        navigate("/login");
        return;
      }

      console.log('Booking response:', bookingResponse.data);

      // Get the booking_id from the response
      const booking_id = bookingResponse.data.booking_id || bookingResponse.data.bookingId;
      
      if (!booking_id) {
        throw new Error('No booking ID received from server');
      }

      // Then create the bifurcation entries with sample counts
      const bifurcations = selectedBifurcations.map(bifurcationId => ({
        bifurcation_id: bifurcationId,
        sample_count: sampleCounts[bifurcationId] || 1
      }));

      console.log('Sending bifurcations data:', {
        booking_id,
        bifurcations
      });

      await axios.post(
        `${API_BASED_URL}api/booking-bifurcations`,
        {
          booking_id,
          bifurcations
        },
        { 
          headers: { 
            Authorization: token 
          } 
        }
      );

      alert("Booking submitted for approval");
      setSelectedSlot("");
      setSelectedScheduleId("");
      setReceipt(null);
      setSelectedBifurcations([]);
      setSampleCounts({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert("Booking failed: " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const response = await axios.get(`${API_BASED_URL}api/qr-code`);
        if (response.data && response.data.image_url) {
          setQrCodeImage(response.data.image_url);
        }
      } catch (err) {
        console.error('Error fetching QR code:', err);
      }
    };
    fetchQrCode();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Booking Section */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Book a Facility</h2>
                <div className="flex items-center space-x-2 text-blue-600">
                  <Building2 className="w-6 h-6" />
                  <span className="font-medium">IIT Ropar</span>
                </div>
              </div>

              <div className="space-y-6">
                {/* Facility Selection */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <label className="block text-lg font-semibold text-gray-700 mb-3">Select Facility</label>
                  <select
                    className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out bg-white"
                    value={facilityId}
                    onChange={(e) => {
                      const selectedFacilityId = e.target.value;
                      setFacilityId(selectedFacilityId);
                      const selectedFacility = facilities.find(f => String(f.id) === String(selectedFacilityId));
                      if (selectedFacility) {
                        setOperatorEmail(selectedFacility.operator_email);
                        fetchBifurcations(selectedFacilityId);
                      }
                      setSelectedSlot("");
                      setSelectedScheduleId("");
                      setAvailableSlots([]);
                      setSelectedBifurcations([]);
                    }}
                    required
                  >
                    <option value="">Choose a facility</option>
                    {facilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bifurcations Section */}
                {bifurcations.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                      <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500" />
                      Facility Bifurcations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bifurcations.map((bifurcation) => (
                        <div 
                          key={bifurcation.id} 
                          className={`p-4 rounded-xl border transition-all duration-300 ${
                            selectedBifurcations.includes(bifurcation.id)
                              ? 'bg-blue-50 border-blue-200 shadow-md'
                              : 'bg-white border-gray-200 hover:border-blue-200'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id={`bifurcation-${bifurcation.id}`}
                              checked={selectedBifurcations.includes(bifurcation.id)}
                              onChange={() => handleBifurcationChange(bifurcation.id)}
                              className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex-grow">
                              <label htmlFor={`bifurcation-${bifurcation.id}`} className="font-medium text-gray-700">
                                {bifurcation.bifurcation_name}
                              </label>
                              <p className="text-sm text-gray-500 mt-1">{bifurcation.description}</p>
                              <p className="text-sm font-medium text-blue-600 mt-2">
                                {getBifurcationPrice(bifurcation)} Rs. per {bifurcation.pricing_type.replace('-', ' ')}
                              </p>
                              {selectedBifurcations.includes(bifurcation.id) && (
                                <div className="mt-3 bg-white rounded-lg p-2 border border-gray-200">
                                  <label className="text-sm text-gray-600">Number of Samples:</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={sampleCounts[bifurcation.id] || 1}
                                    onChange={(e) => handleSampleCountChange(bifurcation.id, e.target.value)}
                                    className="ml-2 w-20 p-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date and Time Selection */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                      Select Date
                    </h3>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setSelectedSlot("");
                        setSelectedScheduleId("");
                        setAvailableSlots([]);
                      }}
                      className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out bg-white"
                    />
                    <button
                      onClick={handleFetchSlots}
                      className="w-full mt-4 bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
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
                        <>
                          <Clock className="w-5 h-5 mr-2" />
                          Fetch Available Slots
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-blue-500" />
                      Available Slots
                    </h3>
                    <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2">
                      {availableSlots.length !== 0 ? (
                        availableSlots.map((slot) => {
                          const isSlotWithin24Hours = isWithin24Hours(date, slot.start_time);
                          return (
                            <button
                              key={slot.schedule_id}
                              onClick={() => handleSlotClick(slot)}
                              disabled={!slot.available || isSlotWithin24Hours}
                              className={`p-3 rounded-xl text-center text-sm font-medium transition duration-300 ease-in-out ${
                                slot.available && !isSlotWithin24Hours
                                  ? "bg-white hover:bg-green-50 text-gray-800 border border-gray-300 hover:border-green-500"
                                  : "bg-gray-100 cursor-not-allowed text-gray-500"
                              } ${
                                selectedScheduleId === slot.schedule_id
                                  ? "ring-2 ring-green-500 bg-green-50"
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

                {/* Payment Receipt Section */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
                    Payment Receipt
                  </h3>
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
                      className="file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-sm text-gray-500"
                      disabled={uploadingReceipt || receiptUploaded || isLoading}
                    />
                    {receipt && (
                      <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-xl">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
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
                      <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-xl">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-green-600 text-sm font-medium">Receipt uploaded successfully!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Summary and Action */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-blue-800">
                      Selected: <span className="font-medium">{date} {selectedSlot}</span>
                    </div>
                    {selectedSlot && (
                      <div className="text-lg font-bold text-blue-800">
                        Total: {Math.round(totalCost * 100) / 100} Rs.
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleBooking}
                    className="w-full bg-green-600 text-white px-6 py-4 rounded-xl hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md flex items-center justify-center"
                    disabled={!selectedScheduleId || !facilityId || !receipt || isLoading || selectedBifurcations.length === 0}
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
              </div>
            </div>
          </div>

          {/* QR Code and Info Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 sticky top-8">
              <div className="text-center mb-6">
                {qrCodeImage ? (
                  <div className="relative">
                    <img 
                      src={getImageUrl(qrCodeImage)} 
                      alt="Booking QR Code" 
                      className="w-48 h-48 mx-auto mb-3 object-contain"
                      onError={() => setImageError(true)}
                    />
                    {imageError && (
                      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
                        <span className="text-gray-500">Failed to load image</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <QrCode className="w-20 h-20 mx-auto text-blue-600 mb-3" />
                )}
                <h3 className="text-xl font-semibold text-gray-800">Scan to Book</h3>
                <p className="text-gray-600 mt-2 text-sm">Scan this QR code to make required payment for booking this facility</p>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Booking Instructions</h4>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                      Select your desired facility and bifurcations
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                      Choose an available time slot
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                      Upload payment receipt
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                      Submit booking for approval
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Contact Information</h4>
                  <p className="text-sm text-gray-600">
                    For any assistance, please contact the facility operator:
                    <br />
                    <span className="font-medium text-blue-600">{operatorEmail}</span>
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Booking Status</h4>
                  <p className="text-sm text-green-700">
                    Your booking will be reviewed by the facility operator. You will receive an email confirmation once approved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingFacility;
