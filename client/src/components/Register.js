import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Full Name:</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            disabled={!!lockoutTime}
            autoComplete="name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={!!lockoutTime}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={!!lockoutTime}
            autoComplete="new-password"
          />
          <small className="password-hint">
            Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            disabled={!!lockoutTime}
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="userType">User Type:</label>
          <select
            id="userType"
            name="userType"
            value={formData.userType}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select User Type</option>
            <option value="Internal">Internal</option>
            <option value="Internal Consultancy">Internal Consultancy</option>
            <option value="Government R&D Lab or External Academics">Government R&D Lab or External Academics</option>
            <option value="Private Industry or Private R&D Lab">Private Industry or Private R&D Lab</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="contactNumber">Contact Number:</label>
          <input
            type="tel"
            id="contactNumber"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleInputChange}
            disabled={!!lockoutTime}
            autoComplete="tel"
          />
        </div>

        <div className="form-group">
          <label htmlFor="organizationName">Organization Name:</label>
          <input
            type="text"
            id="organizationName"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleInputChange}
            disabled={!!lockoutTime}
            autoComplete="organization"
          />
        </div>

        {formData.userType === "Internal" && (
          <>
            <div className="form-group">
              <label htmlFor="department">Department:</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                disabled={!!lockoutTime}
              >
                <option value="">Select department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="supervisor">Supervisor:</label>
              <select
                id="supervisor"
                name="supervisor"
                value={formData.supervisor}
                onChange={handleInputChange}
                required
                disabled={!!lockoutTime || !formData.department}
              >
                <option value="">Select supervisor</option>
                {supervisors.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="idProof">ID Proof:</label>
          <input
            type="file"
            id="idProof"
            name="idProof"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={!!lockoutTime}
          />
          <small>Accepted formats: PDF, JPG, PNG (max 5MB)</small>
          {uploadProgress > 0 && (
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
              <span>{Math.round(uploadProgress)}%</span>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="error-container">
            {typeof errorMessage === 'string' ? (
              <p className="error-message">{errorMessage}</p>
            ) : (
              errorMessage
            )}
          </div>
        )}
        
        {lockoutTime && (
          <p className="error-message">
            Registration temporarily locked. Please try again in {Math.ceil((lockoutTime - new Date()) / 1000 / 60)} minutes.
          </p>
        )}

        <button type="submit" disabled={isLoading || !!lockoutTime}>
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;