import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'

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
      const response = await axios.get('/facilities/slots', {
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
      await axios.post('/operator/slots', 
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
      await axios.delete('/operator/slots', {
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
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Facility Slot Management</h1>
      {facilities.map((facility) => (
        <motion.div 
          key={facility.id} 
          className="mb-12 bg-white shadow-xl rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <h2 className="text-3xl font-semibold text-white">{facility.name || 'Sample Facility Name'}</h2>
          </div>
          <div className="p-6">
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    activeDay === day ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-4">Slots for {activeDay}</h3>
              {facility.slots[activeDay] && facility.slots[activeDay].length > 0 ? (
                <ul className="space-y-3">
                  {facility.slots[activeDay].map((slot, index) => (
                    <motion.li
                      key={index}
                      className="flex justify-between items-center bg-white p-3 rounded-lg shadow"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <span className="text-lg">{`${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`}</span>
                      <button
                        onClick={() => deleteSlot(facility.id, activeDay, slot)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No available slots for {activeDay}</p>
              )}
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
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default AddSlots

