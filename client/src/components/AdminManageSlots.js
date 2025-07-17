import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_BASED_URL } from '../config.js';
import {
    FaBuilding,
    FaCalendarAlt,
    FaClock,
    FaPlus,
    FaTrash,
    FaEdit,
    FaSave,
    FaTimes,
    FaEye,
    FaArrowLeft
} from 'react-icons/fa';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AdminManageSlots = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [newSlots, setNewSlots] = useState({});
    const [editingSlot, setEditingSlot] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        const position = localStorage.getItem('userPosition');
        console.log(token, position);
        if (!token) {
            setError('Please log in to access this page.');
            setLoading(false);
            return;
        }
        if (position !== 'Admin') {
            setError('Access denied. Only administrators can manage facility slots.');
            setLoading(false);
            return;
        }
        fetchAllFacilities();
    }, []);

    const fetchAllFacilities = async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                setError('Authentication token not found');
                setLoading(false);
                return;
            }

            const response = await axios.get(`${API_BASED_URL}admin/facilities/slots`, {
                headers: {
                    Authorization: token
                }
            });
            setFacilities(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching facilities:', err);
            setError(err.response?.data?.message || 'Failed to fetch facilities');
            setLoading(false);
        }
    };

    const fetchFacilitySlots = async (facilityId) => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                console.error('Authentication token not found');
                return null;
            }

            const response = await axios.get(`${API_BASED_URL}admin/facilities/slots`, {
                headers: {
                    Authorization: token
                }
            });
            const facility = response.data.find(f => f.id === facilityId);
            return facility ? { slots: facility.slots } : null;
        } catch (err) {
            console.error('Failed to fetch facility slots:', err);
            return null;
        }
    };

    const handleFacilitySelect = async (facility) => {
        setSelectedFacility({ ...facility, activeDay: 'Monday' });
        setViewMode('detail');

        // Fetch slots for the selected facility
        const slotsData = await fetchFacilitySlots(facility.id);
        if (slotsData) {
            setSelectedFacility(prev => ({ ...prev, slots: slotsData.slots || {} }));
        }
    };

    const addSlot = async (facilityId, weekday) => {
        const newSlot = newSlots[facilityId]?.[weekday];
        if (!newSlot || !newSlot.start_time || !newSlot.end_time) {
            setError('Please provide both start and end times');
            return;
        }

        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                setError('Authentication token not found');
                return;
            }

            await axios.post(`${API_BASED_URL}admin/slots`,
                {
                    facilityId,
                    weekday,
                    start_time: newSlot.start_time,
                    end_time: newSlot.end_time
                },
                {
                    headers: {
                        Authorization: token
                    }
                }
            );

            // Refresh facility data
            const updatedSlots = await fetchFacilitySlots(facilityId);
            if (updatedSlots) {
                setSelectedFacility(prev => ({ ...prev, slots: updatedSlots.slots || {} }));
            }

            // Clear the form
            setNewSlots(prev => ({
                ...prev,
                [facilityId]: {
                    ...prev[facilityId],
                    [weekday]: { start_time: '', end_time: '' }
                }
            }));
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add slot');
        }
    };

    const deleteSlot = async (facilityId, weekday, slot) => {
        if (!window.confirm('Are you sure you want to delete this slot?')) return;

        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                setError('Authentication token not found');
                return;
            }

            await axios.delete(`${API_BASED_URL}admin/slots`, {
                data: { facilityId, weekday, slot },
                headers: {
                    Authorization: token
                }
            });

            // Refresh facility data
            const updatedSlots = await fetchFacilitySlots(facilityId);
            if (updatedSlots) {
                setSelectedFacility(prev => ({ ...prev, slots: updatedSlots.slots || {} }));
            }
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete slot');
        }
    };

    const startEditSlot = (facilityId, weekday, slot, index) => {
        setEditingSlot({
            facilityId,
            weekday,
            slot: { ...slot },
            index
        });
    };

    const saveEditSlot = async () => {
        if (!editingSlot) return;

        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                setError('Authentication token not found');
                return;
            }

            await axios.put(`${API_BASED_URL}admin/slots`,
                {
                    facilityId: editingSlot.facilityId,
                    weekday: editingSlot.weekday,
                    oldSlot: selectedFacility.slots[editingSlot.weekday][editingSlot.index],
                    newSlot: editingSlot.slot
                },
                {
                    headers: {
                        Authorization: token
                    }
                }
            );

            // Refresh facility data
            const updatedSlots = await fetchFacilitySlots(editingSlot.facilityId);
            if (updatedSlots) {
                setSelectedFacility(prev => ({ ...prev, slots: updatedSlots.slots || {} }));
            }

            setEditingSlot(null);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update slot');
        }
    };

    const cancelEdit = () => {
        setEditingSlot(null);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error && !selectedFacility) return (
        <div className="flex items-center justify-center h-screen">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <FaBuilding className="mr-3 text-blue-600 text-4xl" />
                            <h1 className="text-4xl font-bold text-gray-900">
                                Manage Facility Slots
                            </h1>
                        </div>
                        <Link
                            to="/admin"
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Admin Panel
                        </Link>
                    </div>
                    <p className="text-gray-600 text-lg">
                        View and manage time slots for all facilities across the week
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="absolute top-0 right-0 mt-2 mr-2 text-red-700 hover:text-red-900"
                        >
                            <FaTimes />
                        </button>
                    </div>
                )}

                {/* Facility List View */}
                {viewMode === 'list' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {facilities.map((facility) => (
                            <motion.div
                                key={facility.id}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
                                onClick={() => handleFacilitySelect(facility)}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-gray-800">{facility.name}</h3>
                                    <FaEye className="text-blue-500 text-lg" />
                                </div>
                                {/* <p className="text-gray-600 mb-4">{facility.description || 'No description available'}</p> */}
                                <div className="flex items-center text-sm text-gray-500">
                                    <FaCalendarAlt className="mr-2" />
                                    Click to manage slots
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Facility Detail View */}
                {viewMode === 'detail' && selectedFacility && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-xl shadow-lg overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-blue-600 px-6 py-4 relative">
                            <button
                                onClick={() => {
                                    setViewMode('list');
                                    setSelectedFacility(null);
                                    setEditingSlot(null);
                                }}
                                className="absolute left-6 top-1/2 -translate-y-1/2 bg-blue-500 bg-opacity-80 hover:bg-blue-400 text-white w-8 h-8 rounded flex items-center justify-center transition-all duration-200"
                                aria-label="Back"
                            >
                                <FaArrowLeft className="text-lg" />
                            </button>
                            <h2 className="text-2xl font-bold text-white text-center">{selectedFacility.name}</h2>
                        </div>


                        {/* Days Navigation */}
                        <div className="px-6 py-4 bg-gray-50 border-b">
                            <div className="flex space-x-2 overflow-x-auto">
                                {daysOfWeek.map(day => (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedFacility(prev => ({ ...prev, activeDay: day }))}
                                        className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${selectedFacility.activeDay === day
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Slots Management */}
                        <div className="p-6">
                            {selectedFacility.activeDay && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                            <FaClock className="mr-2 text-blue-500" />
                                            {selectedFacility.activeDay} Schedule
                                        </h3>
                                        <div className="text-sm text-gray-500">
                                            {selectedFacility.slots[selectedFacility.activeDay]?.length || 0} slots configured
                                        </div>
                                    </div>

                                    {/* Existing Slots */}
                                    <div className="space-y-3 mb-6">
                                        {selectedFacility.slots[selectedFacility.activeDay]?.map((slot, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                                                {editingSlot && editingSlot.facilityId === selectedFacility.id &&
                                                    editingSlot.weekday === selectedFacility.activeDay &&
                                                    editingSlot.index === index ? (
                                                    <div className="flex items-center space-x-3 flex-1">
                                                        <input
                                                            type="time"
                                                            value={editingSlot.slot.start_time}
                                                            onChange={(e) => setEditingSlot(prev => ({
                                                                ...prev,
                                                                slot: { ...prev.slot, start_time: e.target.value }
                                                            }))}
                                                            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <span className="text-gray-500">to</span>
                                                        <input
                                                            type="time"
                                                            value={editingSlot.slot.end_time}
                                                            onChange={(e) => setEditingSlot(prev => ({
                                                                ...prev,
                                                                slot: { ...prev.slot, end_time: e.target.value }
                                                            }))}
                                                            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <button
                                                            onClick={saveEditSlot}
                                                            className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors"
                                                        >
                                                            <FaSave />
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 transition-colors"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center space-x-4">
                                                            <span className="text-lg font-medium text-gray-800">
                                                                {slot.start_time} - {slot.end_time}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => startEditSlot(selectedFacility.id, selectedFacility.activeDay, slot, index)}
                                                                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                                                                title="Edit slot"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteSlot(selectedFacility.id, selectedFacility.activeDay, slot)}
                                                                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors"
                                                                title="Delete slot"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}

                                        {(!selectedFacility.slots[selectedFacility.activeDay] || selectedFacility.slots[selectedFacility.activeDay].length === 0) && (
                                            <div className="text-center py-8 text-gray-500">
                                                <FaClock className="mx-auto text-4xl mb-4 text-gray-300" />
                                                <p>No slots configured for {selectedFacility.activeDay}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Add New Slot */}
                                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                                        <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                                            <FaPlus className="mr-2" />
                                            Add New Slot
                                        </h4>
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="time"
                                                value={newSlots[selectedFacility.id]?.[selectedFacility.activeDay]?.start_time || ''}
                                                onChange={(e) => setNewSlots(prev => ({
                                                    ...prev,
                                                    [selectedFacility.id]: {
                                                        ...prev[selectedFacility.id],
                                                        [selectedFacility.activeDay]: {
                                                            ...prev[selectedFacility.id]?.[selectedFacility.activeDay],
                                                            start_time: e.target.value
                                                        }
                                                    }
                                                }))}
                                                placeholder="Start time"
                                                className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-500 font-medium">to</span>
                                            <input
                                                type="time"
                                                value={newSlots[selectedFacility.id]?.[selectedFacility.activeDay]?.end_time || ''}
                                                onChange={(e) => setNewSlots(prev => ({
                                                    ...prev,
                                                    [selectedFacility.id]: {
                                                        ...prev[selectedFacility.id],
                                                        [selectedFacility.activeDay]: {
                                                            ...prev[selectedFacility.id]?.[selectedFacility.activeDay],
                                                            end_time: e.target.value
                                                        }
                                                    }
                                                }))}
                                                placeholder="End time"
                                                className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={() => addSlot(selectedFacility.id, selectedFacility.activeDay)}
                                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center font-medium"
                                            >
                                                <FaPlus className="mr-2" />
                                                Add Slot
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AdminManageSlots