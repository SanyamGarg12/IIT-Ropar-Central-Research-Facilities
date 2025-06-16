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
    setFormData(prev => ({
      ...prev,
      [name]: sanitizeInput(value)
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

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
    if (formData.userType === "Internal" && !formData.email.endsWith('@iitrpr.ac.in')) {
      setErrorMessage("Internal users must use an @iitrpr.ac.in email address");
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

      const registrationData = {
        ...formData
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-[#003B4C] to-[#00B6BD]">
            <h2 className="text-3xl font-bold text-white text-center">Create Your Account</h2>
            <p className="mt-2 text-center text-gray-100">Join our research facility community</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    disabled={!!lockoutTime}
                    autoComplete="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00B6BD] focus:ring-[#00B6BD] transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={!!lockoutTime}
                    autoComplete="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00B6BD] focus:ring-[#00B6BD] transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={!!lockoutTime}
                    autoComplete="new-password"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00B6BD] focus:ring-[#00B6BD] transition-colors duration-200"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Must include uppercase, lowercase, number, and special character
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={!!lockoutTime}
                    autoComplete="new-password"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00B6BD] focus:ring-[#00B6BD] transition-colors duration-200"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="userType" className="block text-sm font-medium text-gray-700">User Type</label>
                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00B6BD] focus:ring-[#00B6BD] transition-colors duration-200"
                  >
                    <option value="">Select User Type</option>
                    <option value="Internal">Internal</option>
                    <option value="Internal Consultancy">Internal Consultancy</option>
                    <option value="Government R&D Lab or External Academics">Government R&D Lab or External Academics</option>
                    <option value="Private Industry or Private R&D Lab">Private Industry or Private R&D Lab</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    disabled={!!lockoutTime}
                    autoComplete="tel"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00B6BD] focus:ring-[#00B6BD] transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">Organization Name</label>
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    disabled={!!lockoutTime}
                    autoComplete="organization"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00B6BD] focus:ring-[#00B6BD] transition-colors duration-200"
                  />
                </div>

                {formData.userType === "Internal" && (
                  <>
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        disabled={!!lockoutTime}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00B6BD] focus:ring-[#00B6BD] transition-colors duration-200"
                      >
                        <option value="">Select department</option>
                        {departments.map((dept, index) => (
                          <option key={index} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700">Supervisor</label>
                      <select
                        id="supervisor"
                        name="supervisor"
                        value={formData.supervisor}
                        onChange={handleInputChange}
                        required
                        disabled={!!lockoutTime || !formData.department}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#00B6BD] focus:ring-[#00B6BD] transition-colors duration-200"
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

            <div className="space-y-4">
              <div>
                <label htmlFor="idProof" className="block text-sm font-medium text-gray-700">ID Proof</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#00B6BD] transition-colors duration-200">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="idProof" className="relative cursor-pointer bg-white rounded-md font-medium text-[#00B6BD] hover:text-[#003B4C] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#00B6BD]">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          id="idProof"
                          name="idProof"
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png"
                          disabled={!!lockoutTime}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                  </div>
                </div>
                {uploadProgress > 0 && (
                  <div className="mt-2">
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div 
                          className="transition-all duration-500 ease-out shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#00B6BD]"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-[#00B6BD]">
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

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={isLoading || !!lockoutTime}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${isLoading || lockoutTime 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#003B4C] hover:bg-[#00B6BD] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B6BD]'
                  } transition-colors duration-200`}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isLoading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;