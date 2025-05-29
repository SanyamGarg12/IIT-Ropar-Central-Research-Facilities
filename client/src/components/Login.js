import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { API_BASED_URL } from '../config.js';
import { 
  sanitizeInput, 
  validateEmail, 
  secureFetch, 
  setAuthToken,
  createRateLimiter 
} from '../utils/security';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);
  const navigate = useNavigate();

  // Create rate limiter instance
  const rateLimiter = createRateLimiter(20, 15 * 60 * 1000); // 5 attempts per 15 minutes

  // Check for existing lockout on component mount
  useEffect(() => {
    const savedLockout = localStorage.getItem('loginLockout');
    if (savedLockout) {
      const lockoutEnd = new Date(parseInt(savedLockout));
      if (lockoutEnd > new Date()) {
        setLockoutTime(lockoutEnd);
      } else {
        localStorage.removeItem('loginLockout');
      }
    }
  }, []);

  // Update lockout timer
  useEffect(() => {
    if (lockoutTime) {
      const timer = setInterval(() => {
        if (new Date() >= lockoutTime) {
          setLockoutTime(null);
          localStorage.removeItem('loginLockout');
          setAttempts(0);
          rateLimiter.reset(email);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime, email]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate email
    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    // Check if user is locked out
    if (lockoutTime) {
      const remainingTime = Math.ceil((lockoutTime - new Date()) / 1000 / 60);
      setErrorMessage(`Too many attempts. Please try again in ${remainingTime} minutes.`);
      return;
    }

    // Check rate limit
    if (!rateLimiter.check(email)) {
      const lockoutEnd = new Date(Date.now() + 15 * 60 * 1000);
      setLockoutTime(lockoutEnd);
      localStorage.setItem('loginLockout', lockoutEnd.getTime());
      setErrorMessage("Too many attempts. Please try again in 15 minutes.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await secureFetch(`${API_BASED_URL}login`, {
        method: "POST",
        body: JSON.stringify({ 
          email: sanitizeInput(email), 
          password, 
          userType: sanitizeInput(userType) 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Reset attempts on successful login
        setAttempts(0);
        localStorage.removeItem('loginLockout');
        rateLimiter.reset(email);
        
        // Store auth token
        setAuthToken(data.token);
        localStorage.setItem("ClientUserId", sanitizeInput(email));

        onLogin(data.token);
        navigate("/booking");
      } else {
        // Increment attempts on failed login
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          // Set 15-minute lockout
          const lockoutEnd = new Date(Date.now() + 15 * 60 * 1000);
          setLockoutTime(lockoutEnd);
          localStorage.setItem('loginLockout', lockoutEnd.getTime());
          setErrorMessage("Too many failed attempts. Please try again in 15 minutes.");
        } else {
          setErrorMessage(data.message || "Invalid credentials. Please try again.");
        }
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(sanitizeInput(e.target.value))}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={!!lockoutTime}
            autoComplete="current-password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="userType">User Type:</label>
          <select
            id="userType"
            name="userType"
            value={userType}
            onChange={(e) => setUserType(sanitizeInput(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={!!lockoutTime}
          >
            <option value="">Select User Type</option>
            <option value="Internal">Internal</option>
            <option value="Internal Consultancy">Internal Consultancy</option>
            <option value="Government R&D Lab">Government R&D Lab or External Academics</option>
            <option value="Private Industry">Private Industry or Private R&D Lab</option>
          </select>
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {lockoutTime && (
          <p className="error-message">
            Account temporarily locked. Please try again in {Math.ceil((lockoutTime - new Date()) / 1000 / 60)} minutes.
          </p>
        )}
        <button type="submit" disabled={isLoading || !!lockoutTime}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
      <button 
        className="register-button" 
        onClick={handleRegisterRedirect}
        disabled={!!lockoutTime}
      >
        Register
      </button>
    </div>
  );
};

export default Login;
