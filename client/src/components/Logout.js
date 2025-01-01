import React, { useEffect } from 'react';
import axios from "axios";

const Logout = () => {
    useEffect(() => {
        const logout = async () => {
            try {
                await axios.post('/api/logout', {}, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    }
                });
                // Clear user data from local storage or any other storage
                localStorage.removeItem('userToken');
            } catch (error) {
                console.error('Error logging out:', error);
            }
        };

        logout();
    });

    return (
        <div>
            Logging out...
        </div>
    );
};

export default Logout;