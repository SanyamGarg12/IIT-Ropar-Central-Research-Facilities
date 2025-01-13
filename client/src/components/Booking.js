import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import UserProfile from "./UserProfile";
import ChangePassword from "./ChangePassword";
import BookingHistory from "./BookingHistory";
import UserPublications from "./UserPublications";
import Results from "./Results";
import BookingFacility from "./BookingFacility";
import Logout from "./Logout";
import { Navigate } from "react-router-dom";

function Booking() {
  // Fetch auth token directly from localStorage
  const authToken = localStorage.getItem("authToken");

  const [activeOption, setActiveOption] = useState("User Profile");
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);

  // Extract user details from auth token
  useEffect(() => {
    if (authToken) {
      try {
        const tokenPayload = JSON.parse(atob(authToken.split(".")[1]));
        setUserType(tokenPayload.userType || "Unknown");
        setUserId(tokenPayload.userId || "Unknown");
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, [authToken]);

  // Redirect to login if no auth token
  if (!authToken) {
    return <Navigate to="/login" />;
  }

  console.log("User type:", userType);

  // Get navigation items based on user type
  const getNavItems = () => {
        return [
          "User Profile",
          "Change Password",
          "Booking History",
          "Publications",
          "Results",
          "Booking Facility",
          "Logout",
        ];
  };

  // Render the active section based on the selected option
  const renderActiveSection = () => {
    switch (activeOption) {
      case "User Profile":
        return <UserProfile />;
      case "Change Password":
        return <ChangePassword />;
      case "Booking History":
        return <BookingHistory />;
      case "Publications":
        return <UserPublications />;
      case "Results":
        return <Results />;
      case "Booking Facility":
        return <BookingFacility />;
      case "Logout":
        return <Logout />;
      default:
        return <div>No content available</div>;
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex">
      {/* Pass dynamic navItems to Sidebar */}
      <Sidebar
        setActiveOption={setActiveOption}
        activeOption={activeOption}
        navItems={navItems}
      />
      <div className="flex-1">
        <header className="p-4 bg-white">
          <h1 className="text-xl font-semibold">{activeOption}</h1>
        </header>
        <main className="p-8">{renderActiveSection()}</main>
      </div>
    </div>
  );
}

export default Booking;
