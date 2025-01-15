import React, { useState, useEffect, useCallback } from 'react';
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const performLogout = useCallback(async () => {
        try {
            const token = localStorage.getItem("authToken");

            if (token) {
                const decoded = jwtDecode(token);
                const userId = decoded.userId;

                await axios.post(
                    "/api/logout",
                    { userId },
                    {
                        headers: {
                            Authorization: `${token}`,
                        },
                    }
                );

                // Clear user data from local storage
                localStorage.removeItem("authToken");
                navigate("/login");
            }
        } catch (error) {
            console.error("Error logging out:", error);
            alert("An error occurred while logging out. Please try again.");
            setIsLoggingOut(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (!isLoggingOut) {
            const confirmLogout = window.confirm("Are you sure you want to log out?");
            
            if (confirmLogout) {
                setIsLoggingOut(true);
                performLogout();
            } else {
                // If user cancels logout, navigate back to the previous page
                navigate(-1);
            }
        }
    }, [isLoggingOut, navigate, performLogout]);

    if (isLoggingOut) {
        return <div>Logging out...</div>;
    }

    return null;
};

export default Logout;

