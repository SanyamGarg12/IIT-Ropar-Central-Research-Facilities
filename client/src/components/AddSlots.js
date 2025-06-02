import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import {API_BASED_URL} from '../config.js'; 

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const AddSlots = () => {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newSlots, setNewSlots] = useState({})
  const [activeDay, setActiveDay] = useState('Monday')

  const operatorId = localStorage.getItem('userEmail')
  const authToken = localStorage.getItem('userToken')

  useEffect(() => {
    fetchFacilities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchFacilities = async () => {
    try {
      const response = await axios.get(`${API_BASED_URL}facilities/slots`, {
        headers: {
          Authorization: `${authToken}`,
        },
        params: { operatorId },
      })
      setFacilities(response.data)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch facilities')
      setLoading(false)
    }
  }

  const addSlot = async (facilityId, weekday) => {
    const newSlot = newSlots[facilityId]?.[weekday]
    if (!newSlot || !newSlot.start_time || !newSlot.end_time) return
    try {
      await axios.post(`${API_BASED_URL}operator/slots`, 
        { 
          facilityId, 
          weekday, 
          start_time: newSlot.start_time, 
          end_time: newSlot.end_time, 
          operatorId 
        },
        {
          headers: {
            Authorization: `${authToken}`,
          },
        }
      )
      await fetchFacilities() // Refresh data
      setNewSlots(prev => ({
        ...prev,
        [facilityId]: {
          ...prev[facilityId],
          [weekday]: { start_time: '', end_time: '' }
        }
      }))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add slot')
    }
  }

  const deleteSlot = async (facilityId, weekday, slot) => {
    try {
      await axios.delete(`${API_BASED_URL}operator/slots`, {
        data: { facilityId, weekday, slot, operatorId },
        headers: {
          Authorization: `${authToken}`,
        },
      })
      await fetchFacilities() // Refresh data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete slot')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
  
  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Facility Slots</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex space-x-4 mb-6">
            {daysOfWeek.map(day => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2 rounded-md ${
                  activeDay === day
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {facilities.map((facility) => (
            <motion.div 
              key={facility.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h3 className="text-xl font-semibold mb-4">{facility.name}</h3>
              
              <div className="space-y-4">
                {facility.slots[activeDay]?.map((slot, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <span className="text-gray-600">
                      {slot.start_time} - {slot.end_time}
                    </span>
                    <button
                      onClick={() => deleteSlot(facility.id, activeDay, slot)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-white p-4 rounded-lg shadow">
                <h4 className="text-lg font-medium mb-3">Add New Slot</h4>
                <div className="flex space-x-4">
                  <input
                    type="time"
                    value={newSlots[facility.id]?.[activeDay]?.start_time || ''}
                    onChange={(e) => setNewSlots(prev => ({
                      ...prev,
                      [facility.id]: {
                        ...prev[facility.id],
                        [activeDay]: {
                          ...prev[facility.id]?.[activeDay],
                          start_time: e.target.value
                        }
                      }
                    }))}
                    placeholder="Start time"
                    className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="time"
                    value={newSlots[facility.id]?.[activeDay]?.end_time || ''}
                    onChange={(e) => setNewSlots(prev => ({
                      ...prev,
                      [facility.id]: {
                        ...prev[facility.id],
                        [activeDay]: {
                          ...prev[facility.id]?.[activeDay],
                          end_time: e.target.value
                        }
                      }
                    }))}
                    placeholder="End time"
                    className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => addSlot(facility.id, activeDay)}
                    className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors duration-200"
                  >
                    Add Slot
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AddSlots

