import React, { useState } from 'react';

function ChangePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Get authToken from localStorage
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('You are not logged in. Please log in and try again.');
      return;
    }

    try {
      // Send API request to change password
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`, // Pass the token for authentication
        },
        body: JSON.stringify({ newPassword: password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to change password');
        return;
      }

      setSuccess('Password changed successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Change Password</h2>
      <form onSubmit={handleChangePassword}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded mb-2 w-full"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border p-2 rounded mb-2 w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Change Password
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}
    </div>
  );
}

export default ChangePassword;