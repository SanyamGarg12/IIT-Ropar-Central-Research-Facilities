import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Register.css";
import { API_BASED_URL } from '../config.js';
import { 
  sanitizeInput, 
  validateEmail, 
  validatePassword, 
  validatePhone,
  validateFile,
  secureFetch,
  createRateLimiter 
} from '../utils/security';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
    contactNumber: "",
    organizationName: "",
    department: "",
    supervisor: "",
    idProof: null
  });

  const [departments, setDepartments] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationAttempts, setRegistrationAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // OTP state
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpCooldownMs, setOtpCooldownMs] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  // Create rate limiter instance with increased limits
  const rateLimiter = createRateLimiter(100, 30 * 60 * 1000); // 100 attempts per 30 minutes

  // Check for existing lockout on component mount
  useEffect(() => {
    const savedLockout = localStorage.getItem('registrationLockout');
    if (savedLockout) {
      const lockoutEnd = new Date(parseInt(savedLockout));
      if (lockoutEnd > new Date()) {
        setLockoutTime(lockoutEnd);
      } else {
        localStorage.removeItem('registrationLockout');
      }
    }
  }, []);

  // Update lockout timer
  useEffect(() => {
    if (lockoutTime) {
      const timer = setInterval(() => {
        if (new Date() >= lockoutTime) {
          setLockoutTime(null);
          localStorage.removeItem('registrationLockout');
          setRegistrationAttempts(0);
          rateLimiter.reset(formData.email);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime, formData.email]);

  // OTP resend cooldown timer
  useEffect(() => {
    if (otpCooldownMs > 0) {
      const t = setInterval(() => setOtpCooldownMs((ms) => Math.max(0, ms - 1000)), 1000);
      return () => clearInterval(t);
    }
  }, [otpCooldownMs]);

  useEffect(() => {
    if (formData.userType === "Internal") {
      fetchDepartments();
    }
  }, [formData.userType]);

  useEffect(() => {
    if (formData.department) {
      fetchSupervisors(formData.department);
    }
  }, [formData.department]);

  const fetchDepartments = async () => {
    try {
      const response = await secureFetch(`${API_BASED_URL}api/departments`);
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      } else {
        console.error('Failed to fetch departments');
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchSupervisors = async (department) => {
    try {
      const response = await secureFetch(`${API_BASED_URL}api/supervisors?department=${encodeURIComponent(department)}`);
      if (response.ok) {
        const data = await response.json();
        setSupervisors(data);
      } else {
        console.error('Failed to fetch supervisors');
      }
    } catch (error) {
      console.error("Error fetching supervisors:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Allow spaces while typing; sanitize later on submit
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'email') {
      setEmailVerified(false);
      setOtp("");
      setOtpSent(false);
    }
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Calculate new dimensions while maintaining aspect ratio
            const maxDimension = 1200;
            if (width > height && width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob with reduced quality
            canvas.toBlob((blob) => {
              resolve(new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              }));
            }, 'image/jpeg', 0.7);
          };
        };
      } else {
        resolve(file);
      }
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const validationResult = validateFile(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
      });
      
      if (!validationResult.isValid) {
        setErrorMessage(validationResult.error);
        e.target.value = null;
        return;
      }

      try {
        setIsLoading(true);
        const compressedFile = await compressImage(file);
        
        // Upload the file
        const formData = new FormData();
        formData.append('file', compressedFile);

        const response = await fetch(`${API_BASED_URL}api/upload-id-proof`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          idProof: data.filePath
        }));
      } catch (error) {
        console.error('Upload error:', error);
        setErrorMessage("Error uploading file. Please try again.");
        e.target.value = null;
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendOtp = async () => {
    setErrorMessage("");
    if (!validateEmail(formData.email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    try {
      setOtpSending(true);
      const response = await fetch(`${API_BASED_URL}auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 429 && data.message) {
          const match = data.message.match(/(\d+)s/);
          if (match) setOtpCooldownMs(parseInt(match[1], 10) * 1000);
        }
        throw new Error(data.message || 'Failed to send OTP');
      }
      // set cooldown explicitly to 10s
      setOtpCooldownMs(10000);
      setOtpSent(true);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMessage("");
    if (!otp || otp.length !== 6) {
      setErrorMessage("Enter the 6-digit OTP sent to your email");
      return;
    }
    if (!otpSent) {
      setErrorMessage("Please send an OTP to your email first.");
      return;
    }
    try {
      setOtpVerifying(true);
      const response = await fetch(`${API_BASED_URL}auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });
      const data = await response.json();
      if (!response.ok) {
        console.error('OTP verify error:', data);
        throw new Error(data.message || 'OTP verification failed');
      }
      setEmailVerified(true);
    } catch (err) {
      setEmailVerified(false);
      setErrorMessage(err.message);
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!emailVerified) {
      setErrorMessage("Please verify your email with OTP before registering.");
      return;
    }

    // Check if user is locked out
    if (lockoutTime) {
      const remainingTime = Math.ceil((lockoutTime - new Date()) / 1000 / 60);
      setErrorMessage(`Too many attempts. Please try again in ${remainingTime} minutes.`);
      return;
    }

    // Check rate limit
    if (!rateLimiter.check(formData.email)) {
      const lockoutEnd = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lockout
      setLockoutTime(lockoutEnd);
      localStorage.setItem('registrationLockout', lockoutEnd.getTime());
      setErrorMessage("Too many attempts. Please try again in 30 minutes.");
      return;
    }

    // Validate email
    if (!validateEmail(formData.email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    // Validate internal user email domain
    if ((formData.userType === "Internal" || formData.userType === "SuperUser") && !formData.email.endsWith('@iitrpr.ac.in')) {
      setErrorMessage("Internal users and SuperUser users must use an @iitrpr.ac.in email address");
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setErrorMessage(
        <div className="password-requirements">
          <p className="error-title">Password must meet the following requirements:</p>
          <ul>
            <li>At least 8 characters long</li>
            <li>Contain at least one uppercase letter</li>
            <li>Contain at least one lowercase letter</li>
            <li>Contain at least one number</li>
            <li>Contain at least one special character (!@#$%^&*)</li>
          </ul>
          <p className="error-note">Please choose a stronger password that meets all these criteria.</p>
        </div>
      );
      return;
    }

    // Validate phone number if provided
    if (formData.contactNumber && !validatePhone(formData.contactNumber)) {
      setErrorMessage("Please enter a valid phone number");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      // Sanitize just before sending to preserve UX while typing
      const registrationData = {
        ...formData,
        fullName: sanitizeInput(formData.fullName),
        email: sanitizeInput(formData.email).toLowerCase(),
        organizationName: sanitizeInput(formData.organizationName),
        department: sanitizeInput(formData.department),
        supervisor: formData.supervisor,
        contactNumber: sanitizeInput(formData.contactNumber)
      };

      const response = await secureFetch(`${API_BASED_URL}api/register`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();
      
      if (response.ok) {
        // Reset attempts on successful registration
        setRegistrationAttempts(0);
        localStorage.removeItem('registrationLockout');
        rateLimiter.reset(formData.email);
        
        navigate("/login");
      } else {
        // Increment attempts on failed registration
        const newAttempts = registrationAttempts + 1;
        setRegistrationAttempts(newAttempts);
        
        if (newAttempts >= 100) { // Increased to 100 attempts
          // Set 30-minute lockout
          const lockoutEnd = new Date(Date.now() + 30 * 60 * 1000);
          setLockoutTime(lockoutEnd);
          localStorage.setItem('registrationLockout', lockoutEnd.getTime());
          setErrorMessage("Too many failed attempts. Please try again in 30 minutes.");
        } else {
          setErrorMessage(data.message || "Registration failed. Please try again.");
        }
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0f2fe' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative py-8 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header Section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#1a3365] to-[#3b82f6] rounded-full mb-4 shadow-lg"
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Join IIT Ropar CRF</h1>
            <p className="text-lg text-gray-600">Create your account to access our research facilities</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="px-8 py-6 bg-gradient-to-r from-[#1a3365] to-[#3b82f6]">
              <h2 className="text-2xl font-bold text-white text-center">Registration Form</h2>
              <p className="mt-1 text-center text-blue-100">Fill in your details below</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
            {/* Personal Information Section */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-[#3b82f6] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    disabled={!!lockoutTime}
                    autoComplete="name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6] focus:ring-opacity-20 transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={!!lockoutTime}
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6] focus:ring-opacity-20 transition-all duration-200"
                    placeholder="Enter your email address"
                  />
                  
                  {/* OTP Section */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpSending || otpCooldownMs > 0 || !validateEmail(formData.email)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 ${otpSending || otpCooldownMs > 0 || !validateEmail(formData.email) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2B4B8C] hover:bg-[#3b82f6] shadow-md hover:shadow-lg'}`}
                      >
                        {otpSending ? 'Sending...' : otpCooldownMs > 0 ? `Resend in ${Math.ceil(otpCooldownMs/1000)}s` : 'Send OTP'}
                      </button>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0,6))}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6] focus:ring-opacity-20 transition-all duration-200"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpVerifying || otp.length !== 6}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 ${otpVerifying || otp.length !== 6 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'}`}
                      >
                        {otpVerifying ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                    {emailVerified && (
                      <div className="flex items-center text-green-600 text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Email verified successfully
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={!!lockoutTime}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6] focus:ring-opacity-20 transition-all duration-200"
                    placeholder="Create a strong password"
                  />
                  <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800 font-medium mb-1">Password Requirements:</p>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Include uppercase and lowercase letters</li>
                      <li>• Include numbers and special characters</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={!!lockoutTime}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6] focus:ring-opacity-20 transition-all duration-200"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-[#3b82f6] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6] focus:ring-opacity-20 transition-all duration-200"
                  >
                    <option value="">Select User Type</option>
                    <option value="Internal">Internal</option>
                    <option value="Government R&D Lab or External Academics">Government R&D Lab or External Academics</option>
                    <option value="Private Industry or Private R&D Lab">Private Industry or Private R&D Lab</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    disabled={!!lockoutTime}
                    autoComplete="tel"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6] focus:ring-opacity-20 transition-all duration-200"
                    placeholder="Enter your contact number"
                  />
                </div>

                <div>
                  <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    disabled={!!lockoutTime}
                    autoComplete="organization"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6] focus:ring-opacity-20 transition-all duration-200"
                    placeholder="Enter your organization name"
                  />
                </div>

                {formData.userType === "Internal" && (
                  <>
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        disabled={!!lockoutTime}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6] focus:ring-opacity-20 transition-all duration-200"
                      >
                        <option value="">Select department</option>
                        {departments.map((dept, index) => (
                          <option key={index} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-2">Supervisor</label>
                      <select
                        id="supervisor"
                        name="supervisor"
                        value={formData.supervisor}
                        onChange={handleInputChange}
                        required
                        disabled={!!lockoutTime || !formData.department}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6] focus:ring-opacity-20 transition-all duration-200"
                      >
                        <option value="">Select supervisor</option>
                        {supervisors.map((sup) => (
                          <option key={sup.id} value={sup.id}>{sup.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-[#3b82f6] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Identity Verification
              </h3>
              <div>
                <label htmlFor="idProof" className="block text-sm font-medium text-gray-700 mb-3">Upload ID Proof Document</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#3b82f6] hover:bg-blue-50 transition-all duration-200">
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <label htmlFor="idProof" className="cursor-pointer">
                        <span className="text-[#3b82f6] font-medium hover:text-[#2B4B8C] transition-colors">Click to upload</span>
                        <span className="text-gray-600"> or drag and drop</span>
                      </label>
                      <input
                        type="file"
                        id="idProof"
                        name="idProof"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={!!lockoutTime}
                        className="sr-only"
                      />
                    </div>
                    <p className="text-sm text-gray-500">PDF, JPG, PNG up to 5MB</p>
                  </div>
                </div>
                {uploadProgress > 0 && (
                  <div className="mt-2">
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div 
                          className="transition-all duration-500 ease-out shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#3b82f6]"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-[#3b82f6]">
                          {Math.round(uploadProgress)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {typeof errorMessage === 'string' ? errorMessage : 'Please fix the following errors:'}
                    </h3>
                    {typeof errorMessage !== 'string' && (
                      <div className="mt-2 text-sm text-red-700">
                        {errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {lockoutTime && (
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Registration temporarily locked
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      Please try again in {Math.ceil((lockoutTime - new Date()) / 1000 / 60)} minutes.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-center pt-6">
              <button
                type="submit"
                disabled={isLoading || !!lockoutTime || !emailVerified}
                className={`w-full max-w-md flex justify-center items-center py-4 px-8 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 
                  ${isLoading || lockoutTime || !emailVerified
                    ? 'bg-gray-400 cursor-not-allowed transform-none' 
                    : 'bg-gradient-to-r from-[#2B4B8C] to-[#3b82f6] hover:from-[#3b82f6] hover:to-[#60a5fa] focus:outline-none focus:ring-4 focus:ring-[#3b82f6] focus:ring-opacity-30'
                  }`}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
                {isLoading ? "Creating Account..." : emailVerified ? "Create Account" : "Verify Email to Continue"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Register;