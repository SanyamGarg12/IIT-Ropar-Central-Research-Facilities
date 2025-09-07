import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {API_BASED_URL} from '../config.js'; 
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CreditCard, QrCode, Building2, CheckCircle2 } from 'lucide-react';
import SuperuserRegistration from './SuperuserRegistration';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${API_BASED_URL}${cleanPath}`;
};

function BookingFacility({ authToken }) {
  const [facilityId, setFacilityId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedScheduleIds, setSelectedScheduleIds] = useState([]);
  const [facilityLimits, setFacilityLimits] = useState({});
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
  const [userName, setUserName] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Extract user name from JWT token on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.full_name || decoded.name || "User");
      } catch (error) {
        console.error("Error decoding token:", error);
        setUserName("User");
      }
    }
  }, []);
  const [billingAddress, setBillingAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split("T")[0]);
  const [superuserStatus, setSuperuserStatus] = useState(null);
  const [showSuperuserModal, setShowSuperuserModal] = useState(false);

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
    if (!authToken) return bifurcation.price_external;
    
    try {
      const decoded = jwtDecode(authToken);
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
    } catch (error) {
      console.error('Error decoding token:', error);
      return bifurcation.price_external;
    }
  }, [authToken]);

  const calculateTotalCost = useCallback(() => {
    if (selectedSlots.length === 0) return 0;
    
    // Calculate total duration from all selected slots
    let totalDuration = 0;
    selectedSlots.forEach(slot => {
      const duration = calculateDuration(slot.start_time, slot.end_time);
      totalDuration += duration;
    });
    
    let total = 0;
    
    selectedBifurcations.forEach(bifurcationId => {
      const bifurcation = bifurcations.find(b => b.id === bifurcationId);
      if (!bifurcation) return;
      
      const price = getBifurcationPrice(bifurcation);
      const sampleCount = sampleCounts[bifurcationId] || 1;
      
      let bifurcationCost = 0;
      switch (bifurcation.pricing_type) {
        case 'slot':
          // For slot-based pricing, multiply by number of slots
          bifurcationCost = price * selectedSlots.length * sampleCount;
          break;
        case 'hour':
          // For hour-based pricing, multiply by total duration
          bifurcationCost = price * totalDuration * sampleCount;
          break;
        case 'half-hour':
          // For half-hour-based pricing, multiply by total half-hours
          bifurcationCost = price * (totalDuration * 2) * sampleCount;
          break;
        default:
          bifurcationCost = price * sampleCount;
      }
      
      total += bifurcationCost;
    });
    
    return total;
  }, [calculateDuration, selectedSlots, selectedBifurcations, bifurcations, getBifurcationPrice, sampleCounts]);

  const handleSlotClick = useCallback((slot) => {
    if (isWithin24Hours(date, slot.start_time)) {
      alert("Cannot book slots that start within the next 24 hours. Please select a different slot.");
      return;
    }

    const scheduleId = slot.schedule_id;
    const isSelected = selectedScheduleIds.includes(scheduleId);

    if (isSelected) {
      // Deselect the slot
      setSelectedSlots(prev => prev.filter(s => s.schedule_id !== scheduleId));
      setSelectedScheduleIds(prev => prev.filter(id => id !== scheduleId));
    } else {
      // Check if adding this slot would exceed limits or break consecutiveness
      const newSelectedSlots = [...selectedSlots, slot].sort((a, b) => 
        a.start_time.localeCompare(b.start_time)
      );
      
      if (!validateSlotSelection(newSelectedSlots)) {
        return;
      }
      
      // Add the slot
      setSelectedSlots(newSelectedSlots);
      setSelectedScheduleIds(prev => [...prev, scheduleId]);
    }
  }, [calculateTotalCost, date, isWithin24Hours, selectedSlots, selectedScheduleIds, facilityLimits]);

  const validateSlotSelection = useCallback((slots) => {
    if (slots.length === 0) return true;

    // Get user type and facility limits
    const token = localStorage.getItem("authToken");
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      const userType = decoded.userType;
      const maxHours = facilityLimits[userType] || 8;
      
      // Check total hours
      let totalHours = 0;
      slots.forEach(slot => {
        const duration = calculateDuration(slot.start_time, slot.end_time);
        totalHours += duration;
      });
      
      if (totalHours > maxHours) {
        alert(`Total booking hours (${totalHours.toFixed(1)}) would exceed the limit of ${maxHours} hours for ${userType} users.`);
        return false;
      }
      
      // Check consecutiveness (if more than 1 slot)
      if (slots.length > 1) {
        // All slots must be on the same day (same weekday)
        const weekdays = [...new Set(slots.map(s => s.weekday))];
        if (weekdays.length > 1) {
          alert("All selected slots must be on the same day of the week.");
          return false;
        }
        
        // Check if slots are consecutive
        for (let i = 1; i < slots.length; i++) {
          if (slots[i - 1].end_time !== slots[i].start_time) {
            alert("Selected slots must be consecutive (adjacent times).");
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error validating slot selection:', error);
      return false;
    }
  }, [calculateDuration, facilityLimits]);

  const fetchBifurcations = useCallback(async (facilityId) => {
    try {
      const response = await axios.get(`${API_BASED_URL}api/facility/${facilityId}/bifurcations`);
      setBifurcations(response.data);
    } catch (err) {
      console.error('Error fetching bifurcations:', err);
      alert("Failed to fetch facility bifurcations. Please try again.");
    }
  }, []);

  const fetchFacilityLimits = useCallback(async (facilityId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_BASED_URL}api/admin/facilities/limits`, {
        headers: { Authorization: token }
      });
      
      const facility = response.data.find(f => f.id == facilityId);
      if (facility) {
        const limitsObj = {};
        facility.limits.forEach(limit => {
          limitsObj[limit.user_type] = limit.max_hours_per_booking;
        });
        setFacilityLimits(limitsObj);
      }
    } catch (err) {
      console.error('Error fetching facility limits:', err);
      // Set default limits if fetch fails
      setFacilityLimits({
        'Internal': 8,
        'Government R&D Lab or External Academics': 6,
        'Private Industry or Private R&D Lab': 4,
        'SuperUser': 10
      });
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
      if (!authToken) {
        alert('Authentication token not found. Please log in again.');
        navigate("/login");
        return;
      }
      const response = await axios.get(
        `${API_BASED_URL}api/slots?facility_id=${facilityId}&date=${date}`,
        {
          headers: {
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
  }, [facilityId, date, navigate, authToken]);

  const fetchWeeklySlots = useCallback(async () => {
    if (!facilityId) {
      alert("Please select a facility first.");
      return;
    }
    setIsLoading(true);
    try {
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
  }, [facilityId, navigate, authToken]);

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
          fetchFacilityLimits(firstFacility.id);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to fetch facilities. Please refresh the page.");
      }
    };
    fetchFacilities();
  }, [fetchBifurcations]);

  useEffect(() => {
    const cost = calculateTotalCost();
    setTotalCost(cost);
  }, [selectedBifurcations, selectedSlots, calculateTotalCost, sampleCounts]);

  // Fetch superuser status for internal users
  useEffect(() => {
    if (authToken) {
      try {
        const decoded = jwtDecode(authToken);
        if (decoded.userType === 'Internal') {
          fetchSuperuserStatus();
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, [authToken]);

  const fetchSuperuserStatus = async () => {
    try {
      const response = await fetch(`${API_BASED_URL}api/user/superuser-status`, {
        headers: { Authorization: authToken }
      });
      if (response.ok) {
        const data = await response.json();
        setSuperuserStatus(data);
      }
    } catch (error) {
      console.error('Error fetching superuser status:', error);
    }
  };

  const handleSuperuserSuccess = () => {
    fetchSuperuserStatus();
  };

  const handleFetchSlots = () => {
    setSelectedSlots([]);
    setSelectedScheduleIds([]);
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
    
    const token = localStorage.getItem("authToken");
    const decoded = jwtDecode(token);
    const userType = decoded.userType;
    const isInternalUser = userType === 'Internal';
    
    // For non-internal users, receipt is required
    if (!isInternalUser && !receipt) {
      alert("Please upload a payment receipt before booking");
      return;
    }

    if (selectedBifurcations.length === 0) {
      alert("Please select at least one facility bifurcation");
      return;
    }
    
    setIsLoading(true);
    
    try {
      let receiptPath = null;
      
      // Only upload receipt for non-internal users
      if (!isInternalUser) {
        receiptPath = await uploadReceipt();
        
        if (!receiptPath) {
          alert("Booking failed: Receipt upload unsuccessful");
          setIsLoading(false);
          return;
        }
      }
      
      const userId = decoded.userId;
      
      // First create the booking
      const bookingResponse = await axios.post(
        `${API_BASED_URL}api/booking`,
        {
          facility_id: facilityId,
          date,
          schedule_ids: selectedScheduleIds, // Changed to array
          user_id: userId,
          operator_email: operatorEmail,
          cost: totalCost, // Add the calculated cost from frontend
          user_type: userType,
          receipt_path: receiptPath,
          bifurcation_ids: selectedBifurcations,
          billing_address: billingAddress,
          gst_number: gstNumber,
          utr_number: utrNumber,
          transaction_date: transactionDate
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

      const successMessage = isInternalUser 
        ? `Booking submitted for supervisor approval. ${selectedSlots.length} slot(s) selected for ${bookingResponse.data.total_hours?.toFixed(1) || 'N/A'} hours. You will receive an email once approved.`
        : `Booking submitted for approval. ${selectedSlots.length} slot(s) booked for ${bookingResponse.data.total_hours?.toFixed(1) || 'N/A'} hours.`;
      
      alert(successMessage);
      setSelectedSlots([]);
      setSelectedScheduleIds([]);
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
                <div>
                  {userName && (
                    <p className="text-lg text-gray-600 mb-2">Hi, {userName}!</p>
                  )}
                  <h2 className="text-3xl font-bold text-gray-800">Book a Facility</h2>
                </div>
                <div className="flex items-center space-x-2 text-blue-600">
                  <Building2 className="w-6 h-6" />
                  <span className="font-medium">IIT Ropar</span>
                </div>
              </div>
              
              {/* 3-Hour Auto-Cancellation Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">Important Notice</h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>
                        <strong>⏰ Auto-Cancellation Policy:</strong> Your booking request will be automatically cancelled if not approved within <strong>3 hours</strong>. 
                        During this time, the selected slots will be blocked for other users.
                      </p>
                      <p className="mt-1">
                        Please ensure your supervisor or operator reviews your request promptly.
                      </p>
                    </div>
                  </div>
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
                        fetchFacilityLimits(selectedFacilityId);
                      }
                      setSelectedSlots([]);
                      setSelectedScheduleIds([]);
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

                {/* Superuser Status for Internal Users */}
                {authToken && (() => {
                  try {
                    const decoded = jwtDecode(authToken);
                    if (decoded.userType === 'Internal') {
                      return (
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Superuser Status
                          </h3>
                          {superuserStatus ? (
                            <div className="space-y-3">
                              {superuserStatus.status === 'active' ? (
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-green-700 font-medium">✓ You are a Superuser</p>
                                    <p className="text-sm text-blue-600">Facility: {superuserStatus.facilityName}</p>
                                  </div>
                                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                    Active Superuser
                                  </span>
                                </div>
                              ) : superuserStatus.status === 'pending' ? (
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-yellow-700 font-medium">⏳ Superuser Request Pending</p>
                                    <p className="text-sm text-blue-600">Facility: {superuserStatus.requestFacilityName}</p>
                                  </div>
                                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                    Pending Approval
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-gray-700">Become a Superuser for a specific facility</p>
                                    <p className="text-sm text-gray-600">Get priority access and special privileges</p>
                                  </div>
                                  <button
                                    onClick={() => setShowSuperuserModal(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    Request Superuser Status
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-600">Loading superuser status...</div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  } catch (error) {
                    return null;
                  }
                })()}

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
                        setSelectedSlots([]);
                        setSelectedScheduleIds([]);
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
                                selectedScheduleIds.includes(slot.schedule_id)
                                  ? "ring-2 ring-blue-500 bg-blue-50 border-blue-500"
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

                {/* Selected Slots Summary */}
                {selectedSlots.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                      <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500" />
                      Selected Slots ({selectedSlots.length})
                    </h3>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                        {selectedSlots.map((slot, index) => (
                          <div key={slot.schedule_id} className="flex items-center justify-between bg-blue-100 p-2 rounded-lg">
                            <span className="text-sm font-medium text-blue-800">
                              {slot.start_time} - {slot.end_time}
                            </span>
                            <button
                              onClick={() => handleSlotClick(slot)}
                              className="text-blue-600 hover:text-blue-800 ml-2"
                              title="Remove slot"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
                        <span>Total Duration: {selectedSlots.reduce((total, slot) => total + calculateDuration(slot.start_time, slot.end_time), 0).toFixed(1)} hours</span>
                        <span>Max Allowed: {(() => {
                          const token = localStorage.getItem("authToken");
                          if (token) {
                            try {
                              const decoded = jwtDecode(token);
                              return facilityLimits[decoded.userType] || 8;
                            } catch (e) {
                              return 8;
                            }
                          }
                          return 8;
                        })()} hours</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Receipt Section - Only for non-internal users */}
                {(() => {
                  const token = localStorage.getItem("authToken");
                  const decoded = jwtDecode(token);
                  const userType = decoded.userType;
                  const isInternalUser = userType === 'Internal';
                  
                  if (isInternalUser) {
                    return (
                      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                          <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                          Internal User Booking
                        </h3>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-sm text-gray-700 mb-3">
                            <strong>No payment required!</strong> As an internal user, your booking will be sent to your supervisor for approval.
                          </p>
                          <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start">
                              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                              Your supervisor will receive an email notification
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                              The cost will be deducted from your supervisor's wallet
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                              You'll receive an email once approved or rejected
                            </li>
                          </ul>
                        </div>
                      </div>
                    );
                  } else {
                    return (
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
                    );
                  }
                })()}

                {/* Billing Information Section - Only for non-internal users */}
                {(() => {
                  const token = localStorage.getItem("authToken");
                  const decoded = jwtDecode(token);
                  const userType = decoded.userType;
                  const isInternalUser = userType === 'Internal';
                  
                  if (!isInternalUser) {
                    return (
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                          <Building2 className="w-5 h-5 mr-2 text-blue-500" />
                          Billing Information
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Please provide the following billing details for your booking.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Billing Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={billingAddress}
                              onChange={(e) => setBillingAddress(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows="3"
                              placeholder="Enter your complete billing address"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              GST Number
                            </label>
                            <input
                              type="text"
                              value={gstNumber}
                              onChange={(e) => setGstNumber(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter GST number (if applicable)"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              UTR Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter UTR number"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Date of Transaction <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={transactionDate}
                              onChange={(e) => setTransactionDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Booking Summary and Action */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-blue-800">
                      Selected: <span className="font-medium">{date} {selectedSlots.length > 0 ? `${selectedSlots.length} slot(s)` : 'None'}</span>
                    </div>
                    {selectedSlots.length > 0 && (
                      <div className="text-lg font-bold text-blue-800">
                        Total: {Math.round(totalCost * 100) / 100} Rs.
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleBooking}
                    className="w-full bg-green-600 text-white px-6 py-4 rounded-xl hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md flex items-center justify-center"
                    disabled={(() => {
                      const token = localStorage.getItem("authToken");
                      const decoded = jwtDecode(token);
                      const userType = decoded.userType;
                      const isInternalUser = userType === 'Internal';
                      
                      const basicValidation = selectedScheduleIds.length === 0 || !facilityId || isLoading || selectedBifurcations.length === 0;
                      
                      if (isInternalUser) {
                        return basicValidation;
                      } else {
                        // For non-internal users, also check receipt and billing fields
                        return basicValidation || !receipt || !billingAddress || !utrNumber || !transactionDate;
                      }
                    })()}
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
                <p className="text-gray-600 mt-2 text-sm">
                  {(() => {
                    const token = localStorage.getItem("authToken");
                    const decoded = jwtDecode(token);
                    const userType = decoded.userType;
                    const isInternalUser = userType === 'Internal';
                    
                    return isInternalUser 
                      ? "Scan this QR code to access the booking system"
                      : "Scan this QR code to make required payment for booking this facility";
                  })()}
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Booking Instructions</h4>
                  <ul className="text-sm text-blue-700 space-y-2">
                    {(() => {
                      const token = localStorage.getItem("authToken");
                      const decoded = jwtDecode(token);
                      const userType = decoded.userType;
                      const isInternalUser = userType === 'Internal';
                      
                      if (isInternalUser) {
                        return (
                          <>
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
                              Submit booking for supervisor approval
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                              Wait for approval email notification
                            </li>
                          </>
                        );
                      } else {
                        return (
                          <>
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
                          </>
                        );
                      }
                    })()}
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
                    {(() => {
                      const token = localStorage.getItem("authToken");
                      const decoded = jwtDecode(token);
                      const userType = decoded.userType;
                      const isInternalUser = userType === 'Internal';
                      
                      return isInternalUser 
                        ? "Your booking will be sent to your supervisor for approval. You will receive an email notification once approved or rejected."
                        : "Your booking will be reviewed by the facility operator. You will receive an email confirmation once approved.";
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Superuser Registration Modal */}
      {showSuperuserModal && (
        <SuperuserRegistration
          onClose={() => setShowSuperuserModal(false)}
          onSuccess={handleSuperuserSuccess}
        />
      )}
    </div>
  );
}

export default BookingFacility;
