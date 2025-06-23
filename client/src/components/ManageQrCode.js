import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASED_URL } from '../config.js';
import { QrCode, Upload, CheckCircle2 } from 'lucide-react';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${API_BASED_URL}${cleanPath}`;
};

function ManageQrCode() {
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchQrCode();
  }, []);

  const fetchQrCode = async () => {
    try {
      const response = await axios.get(`${API_BASED_URL}api/qr-code`);
      if (response.data && response.data.image_url) {
        setQrCodeImage(response.data.image_url);
      }
    } catch (err) {
      console.error('Error fetching QR code:', err);
      setMessage({ type: 'error', text: 'Failed to fetch QR code' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size should be less than 5MB' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please upload an image file' });
        return;
      }
      setSelectedFile(file);
      setMessage({ type: '', text: '' });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file first' });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(
        `${API_BASED_URL}api/qr-code`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      );

      if (response.data && response.data.image_url) {
        setQrCodeImage(response.data.image_url);
        setMessage({ type: 'success', text: 'QR code updated successfully' });
        setSelectedFile(null);
        setImageError(false);
      }
    } catch (err) {
      console.error('Error uploading QR code:', err);
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update QR code' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Manage QR Code</h2>
          
          {/* Current QR Code Display */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Current QR Code</h3>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex flex-col items-center">
              {qrCodeImage ? (
                <div className="relative">
                  <img 
                    src={getImageUrl(qrCodeImage)} 
                    alt="QR Code" 
                    className="w-48 h-48 object-contain"
                    onError={() => setImageError(true)}
                  />
                  {imageError && (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
                      <span className="text-gray-500">Failed to load image</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Upload New QR Code */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Upload New QR Code</h3>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="space-y-4">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  disabled={isLoading}
                />
                
                {selectedFile && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>{selectedFile.name}</span>
                  </div>
                )}

                {message.text && (
                  <div className={`p-3 rounded-lg ${
                    message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {message.text}
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isLoading}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium
                    ${!selectedFile || isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                    } transition-colors duration-200`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload QR Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageQrCode;