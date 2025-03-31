import {API_BASED_URL} from '../App.js'; 
import { useEffect, useState } from "react"

const UserProfile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const BASE_URL = "http://localhost:5000/"

  useEffect(() => {
    const userId = localStorage.getItem("ClientUserId")

    if (!userId) {
      setError("User ID not found in local storage.")
      setLoading(false)
      return
    }

    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${BASE_URL}api/UserProfile/${userId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch user details")
        }

        const data = await response.json()
        setUser(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-36 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-md mx-auto max-w-md mt-8 animate-fade-in">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2 relative after:absolute after:bottom-0 after:left-0 after:w-24 after:h-1 after:bg-blue-500 after:rounded">
        User Profile
      </h2>

      {user ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl shadow-md">
                {user.full_name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{user.full_name}</h3>
                <p className="opacity-90">{user.user_type}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="transform transition duration-300 hover:translate-x-1">
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-medium text-gray-800">{user.email}</p>
              </div>

              <div className="transform transition duration-300 hover:translate-x-1">
                <p className="text-gray-500 text-sm">Contact Number</p>
                <p className="font-medium text-gray-800">{user.contact_number || "N/A"}</p>
              </div>

              <div className="transform transition duration-300 hover:translate-x-1">
                <p className="text-gray-500 text-sm">Organization</p>
                <p className="font-medium text-gray-800">{user.org_name || "N/A"}</p>
              </div>

              <div className="transform transition duration-300 hover:translate-x-1">
                <p className="text-gray-500 text-sm">Verification Status</p>
                <p className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.verified ? "Verified" : "Pending"}
                  </span>
                </p>
              </div>

              <div className="transform transition duration-300 hover:translate-x-1">
                <p className="text-gray-500 text-sm">Created At</p>
                <p className="font-medium text-gray-800">{new Date(user.created_at).toLocaleString()}</p>
              </div>

              <div className="transform transition duration-300 hover:translate-x-1">
                <p className="text-gray-500 text-sm">ID Proof</p>
                {user.id_proof && user.id_proof.trim() ? (
                  <a
                    href={`${BASE_URL}${user.id_proof}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>View Document</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                ) : (
                  <p className="font-medium text-gray-500">Not Provided</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center animate-pulse">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <p className="text-gray-600 text-lg">No user details found.</p>
        </div>
      )}
    </div>
  )
}

export default UserProfile;

