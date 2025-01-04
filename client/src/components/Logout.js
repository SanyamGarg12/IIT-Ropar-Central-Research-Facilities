import React, { useEffect } from 'react';
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const navigate = useNavigate();
    useEffect(() => {
    const logout = async () => {
        
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
                Authorization: `Bearer ${token}`,
                },
            }
            );

            // Clear user data from local storage
            localStorage.removeItem("authToken");
            navigate("/login");
            
            
        }else{
            console.log("No token found");
        }
        } catch (error) {
        console.error("Error logging out:", error);
        }
    };

    logout();
    }, []);

    return (
        <div>
            Logging out...
        </div>
    );
};

export default Logout;