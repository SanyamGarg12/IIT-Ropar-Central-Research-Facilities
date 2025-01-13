import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { toast, Toaster } from 'react-hot-toast'

const AddOperator = () => {
    const [operatorId, setOperatorId] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const authToken = localStorage.getItem('userToken')
            
            if (!authToken) {
                throw new Error('Authentication token not found. Please log in.')
            }

            const response = await axios.post(
                '/api/add-operator',
                { operatorId, password },
                {
                    headers: {
                        Authorization: `${authToken}`,
                    },
                }
            )
            
            toast.success('Operator added successfully!')
            setOperatorId('')
            setPassword('')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding operator. Please try again with other email id or contact sanyam22448@iiitd.ac.in.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
            <Toaster position="top-center" reverseOrder={false} />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-center text-purple-700 mb-2">Add Operator</h2>
                        <p className="text-center text-gray-600 mb-6">Enter the details to add a new operator</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="operatorId" className="text-sm font-medium text-gray-700 block">Operator ID:</label>
                                <input
                                    id="operatorId"
                                    type="text"
                                    value={operatorId}
                                    onChange={(e) => setOperatorId(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-gray-700 block">Password:</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <button 
                                type="submit" 
                                className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Adding...' : 'Add Operator'}
                            </button>
                        </form>
                    </div>
                    <div className="bg-gray-50 px-4 py-3">
                        <p className="text-center text-gray-600">Note : please send these credentials to operator. Operators can change password after login for security purposes.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default AddOperator

