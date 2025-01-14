import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const OperatorChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChangePassword = async () => {
        setIsLoading(true);
        setMessage({ text: '', type: '' });
        const authToken = localStorage.getItem('userToken');
        const userEmail = localStorage.getItem('userEmail');

        try {
            const response = await axios.post('/api/op-change-password', {
                oldPassword,
                newPassword,
                userEmail
            }, {
                headers: {
                    'Authorization': `${authToken}`
                }
            });
            console.log(response);
            if (response.data.success) {
                setMessage({ text: 'Password changed successfully', type: 'success' });
            } else {
                setMessage({ text: response.data.message || 'An error occurred', type: 'error' });
            }
        } catch (error) {
            console.error('Error changing password', error);
            const errorMessage = error.response?.data?.message || 'An error occurred while changing the password';
            setMessage({ text: errorMessage, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl"
        >
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Change Password</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="oldPassword">
                        Old Password
                    </label>
                    <input
                        id="oldPassword"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPassword">
                        New Password
                    </label>
                    <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? 'Changing Password...' : 'Change Password'}
                </motion.button>
            </div>
            {message.text && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                    {message.text}
                </motion.div>
            )}
        </motion.div>
    );
};

export default OperatorChangePassword;
