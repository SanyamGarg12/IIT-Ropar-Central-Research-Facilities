import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPosition, setUserPosition] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const position = localStorage.getItem("userPosition");
    if (token && position) {
      setIsLoggedIn(true);
      setUserPosition(position);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userPosition", data.position);
        localStorage.setItem('userEmail', data.email);
        setIsLoggedIn(true);
        setUserPosition(data.position);
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userPosition");
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUserPosition("");
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {!isLoggedIn ? (
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Login</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      ) : (
        <>
          <p>Welcome, {userPosition}!</p>
          <nav className="mt-5">
            <ul className="space-y-2">
              {userPosition === "Admin" ? (
                <>
                  <li>
                    <Link
                      to="/admin/members"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Manage Members
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/facilities"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Manage Facilities
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/forms"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Manage Forms
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/publications"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Manage Publications
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/about"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Manage About Page
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/booking"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Manage Bookings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/hero"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Manage Home Page
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/admin/booking"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Manage Bookings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/opfacilities"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Facilities
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

