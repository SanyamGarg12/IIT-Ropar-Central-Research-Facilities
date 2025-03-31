import React, { useState } from 'react';
import axios from 'axios';
import {API_BASED_URL} from '../App.js'; 

const ModPassword = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('userToken'); 

        try {
            const response = await axios.post(
                '/api/modifypassword',
                { email, password },
                {
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );
            setMessage('Password changed successfully');
        } catch (error) {
            setMessage('Error changing password');
        }
    };

    return (
        <div>
            <h2>Modify Password</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email ID:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>New Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Change Password</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ModPassword;