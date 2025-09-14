// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Password validation
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: [
      password.length < minLength && 'Password must be at least 8 characters long',
      !hasUpperCase && 'Password must contain at least one uppercase letter',
      !hasLowerCase && 'Password must contain at least one lowercase letter',
      !hasNumbers && 'Password must contain at least one number',
      !hasSpecialChar && 'Password must contain at least one special character'
    ].filter(Boolean)
  };
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation
export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// File validation
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    maxFiles = 1
  } = options;

  if (!file) return { isValid: false, error: 'No file selected' };
  if (file.size > maxSize) return { isValid: false, error: 'File size exceeds limit' };
  if (!allowedTypes.includes(file.type)) return { isValid: false, error: 'Invalid file type' };

  return { isValid: true };
};

// XSS prevention for HTML content
export const escapeHtml = (unsafe) => {
  if (unsafe == null) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Token management
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Admin token management
export const getAdminToken = () => {
  return localStorage.getItem('userToken');
};

export const setAdminToken = (token) => {
  localStorage.setItem('userToken', token);
};

export const removeAdminToken = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userPosition');
  localStorage.removeItem('userEmail');
};

// Admin API request wrapper with security headers
export const secureAdminFetch = async (url, options = {}) => {
  const token = getAdminToken();
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  };

  if (token) {
    defaultHeaders['Authorization'] = token;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  if (response.status === 401 || response.status === 403) {
    removeAdminToken();
    window.location.href = '/admin';
    throw new Error('Admin session expired');
  }

  return response;
};

// API request wrapper with security headers
export const secureFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  };

  if (token) {
    defaultHeaders['Authorization'] = token;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  if (response.status === 401) {
    removeAuthToken();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  return response;
};

// Rate limiting helper
export const createRateLimiter = (maxAttempts, windowMs) => {
  const attempts = new Map();
  
  return {
    check: (key) => {
      const now = Date.now();
      const userAttempts = attempts.get(key) || [];
      
      // Remove expired attempts
      const validAttempts = userAttempts.filter(time => now - time < windowMs);
      
      if (validAttempts.length >= maxAttempts) {
        return false;
      }
      
      validAttempts.push(now);
      attempts.set(key, validAttempts);
      return true;
    },
    
    reset: (key) => {
      attempts.delete(key);
    }
  };
}; 