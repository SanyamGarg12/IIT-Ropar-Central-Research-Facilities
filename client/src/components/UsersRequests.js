import {API_BASED_URL} from '../config.js'; 
import { useEffect, useState } from "react"
import axios from "axios"
import { FaUserCheck, FaUserTimes, FaEye, FaDownload } from 'react-icons/fa'

const UsersRequests = () => {
  const [users, setUsers] = useState([])
  const [verifiedUsers, setVerifiedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [verifiedLoading, setVerifiedLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('pending') // 'pending' or 'verified'

  // Fetch non-verified users
  useEffect(() => {
    setLoading(true)
    axios
      .get("/api/users/not-verified")
      .then((response) => {
        setUsers(response.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching users:", error)
        setError("Failed to load user requests")
        setLoading(false)
      })
  }, [])

  // Fetch verified users
  const fetchVerifiedUsers = () => {
    setVerifiedLoading(true)
    axios
      .get("/api/users/verified")
      .then((response) => {
        setVerifiedUsers(response.data)
        setVerifiedLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching verified users:", error)
        setError("Failed to load verified users")
        setVerifiedLoading(false)
      })
  }

  // Function to verify a user
  const verifyUser = (userId) => {
    axios
      .post(`/api/users/verify/${userId}`)
      .then(() => {
        setUsers(users.filter((user) => user.user_id !== userId))
        // Refresh verified users list if we're on that tab
        if (activeTab === 'verified') {
          fetchVerifiedUsers()
        }
      })
      .catch((error) => console.error("Error verifying user:", error))
  }

  // Function to deactivate a verified user
  const deactivateUser = (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user? This will change their status from "YES" to "NO".')) {
      return
    }

    axios
      .post(`/api/users/deactivate/${userId}`)
      .then(() => {
        setVerifiedUsers(verifiedUsers.filter((user) => user.user_id !== userId))
        // Refresh pending users list if we're on that tab
        if (activeTab === 'pending') {
          setLoading(true)
          axios
            .get("/api/users/not-verified")
            .then((response) => {
              setUsers(response.data)
              setLoading(false)
            })
            .catch((error) => {
              console.error("Error fetching users:", error)
              setError("Failed to load user requests")
              setLoading(false)
            })
        }
      })
      .catch((error) => console.error("Error deactivating user:", error))
  }

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'verified' && verifiedUsers.length === 0) {
      fetchVerifiedUsers()
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse text-blue-600">Loading user requests...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex items-center gap-2 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          User Management
        </h2>
        
        {/* Tabs */}
        <div className="mt-4 flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => handleTabChange('pending')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaUserCheck />
            Pending Requests ({users.length})
          </button>
          <button
            onClick={() => handleTabChange('verified')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'verified'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaUserTimes />
            Verified Users ({verifiedUsers.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'pending' ? (
        // Pending Requests Tab
        users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-blue-100 p-3 mb-4">
              <FaUserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-lg font-medium text-gray-800">No pending verification requests</p>
            <p className="text-gray-500 mt-1">All user requests have been processed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Org Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Proof
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.user_type === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.contact_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.org_name || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.id_proof ? (
                        <a
                          href={`${API_BASED_URL}${user.id_proof}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <FaEye className="h-3 w-3" />
                          <span>View</span>
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">No ID Uploaded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => verifyUser(user.user_id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        <FaUserCheck className="h-3 w-3" />
                        Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        // Verified Users Tab
        verifiedLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse text-blue-600">Loading verified users...</div>
          </div>
        ) : verifiedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <FaUserTimes className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-lg font-medium text-gray-800">No verified users found</p>
            <p className="text-gray-500 mt-1">Users will appear here after verification</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Org Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Proof
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {verifiedUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.user_type === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.contact_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.org_name || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.id_proof ? (
                        <a
                          href={`${API_BASED_URL}${user.id_proof}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <FaEye className="h-3 w-3" />
                          <span>View</span>
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">No ID Uploaded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => deactivateUser(user.user_id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        <FaUserTimes className="h-3 w-3" />
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}

export default UsersRequests

