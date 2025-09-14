import React, { useState, useEffect } from 'react';
import { API_BASED_URL } from '../config.js';
import { secureAdminFetch, getAdminToken } from '../utils/security';
import '../App.css';

const AdminManageFacilityLimits = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingFacility, setSavingFacility] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userTypes = [
    'Internal',
    'Government R&D Lab or External Academics',
    'Private Industry or Private R&D Lab',
    'SuperUser'
  ];

  useEffect(() => {
    // Check if user is logged in and has valid token
    const token = getAdminToken();
    const position = localStorage.getItem('userPosition');
    
    if (!token || !position || position !== 'Admin') {
      window.location.href = '/admin';
      return;
    }
    
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await secureAdminFetch(`${API_BASED_URL}api/admin/facilities/limits`);

      if (!response.ok) {
        throw new Error('Failed to fetch facilities');
      }

      const data = await response.json();
      setFacilities(data);
      setError('');
    } catch (err) {
      console.error('Error fetching facilities:', err);
      if (err.message === 'Admin session expired') {
        return; // secureAdminFetch already handled the redirect
      }
      setError('Failed to fetch facilities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFacilityLimits = async (facilityId, limits) => {
    try {
      setSaving(true);
      setSavingFacility(facilityId);
      const response = await secureAdminFetch(`${API_BASED_URL}api/admin/facilities/limits/${facilityId}`, {
        method: 'PUT',
        body: JSON.stringify({ limits })
      });

      if (!response.ok) {
        throw new Error('Failed to update limits');
      }

      setSuccess('Facility limits updated successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating limits:', err);
      if (err.message === 'Admin session expired') {
        return; // secureAdminFetch already handled the redirect
      }
      setError('Failed to update limits. Please try again.');
      setSuccess('');
    } finally {
      setSaving(false);
      setSavingFacility(null);
    }
  };

  const handleLimitChange = (facilityIndex, userType, value) => {
    // Clear any existing error messages when user starts typing
    if (error) {
      setError('');
    }
    
    const updatedFacilities = [...facilities];
    const facility = updatedFacilities[facilityIndex];
    
    // Find existing limit or create new one
    const existingLimitIndex = facility.limits.findIndex(limit => limit.user_type === userType);
    
    if (existingLimitIndex >= 0) {
      facility.limits[existingLimitIndex].max_hours_per_booking = parseInt(value) || 0;
    } else {
      facility.limits.push({
        user_type: userType,
        max_hours_per_booking: parseInt(value) || 0
      });
    }
    
    setFacilities(updatedFacilities);
  };

  const getLimitForUserType = (facility, userType) => {
    const limit = facility.limits.find(l => l.user_type === userType);
    return limit ? limit.max_hours_per_booking : '';
  };

  const handleSaveLimits = (facilityId, facilityIndex) => {
    const facility = facilities[facilityIndex];
    const validLimits = facility.limits.filter(limit => limit.max_hours_per_booking > 0);
    
    if (validLimits.length === 0) {
      setError('Please set at least one booking limit before saving.');
      return;
    }
    
    updateFacilityLimits(facilityId, validLimits);
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-spinner">Loading facilities...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Manage Facility Booking Limits</h2>
        <p>Set maximum booking hours per user type for each facility</p>
        <div className="header-info">
          <p className="info-text">
            <strong>Note:</strong> These limits control how many hours each user type can book in a single booking session.
            Users will not be able to book more than the specified hours for their user type.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="facilities-limits-container">
        {facilities.map((facility, facilityIndex) => (
          <div key={facility.id} className="facility-limits-card">
            <div className="facility-header">
              <div className="facility-info">
                <h3>{facility.name}</h3>
                <span className="facility-category">{facility.category_name}</span>
              </div>
              <div className="facility-summary">
                <span className="summary-text">
                  {facility.limits.filter(l => l.max_hours_per_booking > 0).length} limits set
                </span>
              </div>
            </div>

            <div className="limits-grid">
              {userTypes.map(userType => (
                <div key={userType} className="limit-input-group">
                  <label className="limit-label">
                    {userType === 'Government R&D Lab or External Academics' ? 'Gov R&D/External' :
                     userType === 'Private Industry or Private R&D Lab' ? 'Private Industry' :
                     userType}
                  </label>
                  <div className="limit-input-wrapper">
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={getLimitForUserType(facility, userType)}
                      onChange={(e) => handleLimitChange(facilityIndex, userType, e.target.value)}
                      className="limit-input"
                      placeholder="0"
                    />
                    <span className="limit-unit">hours</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="facility-actions">
              <button
                onClick={() => handleSaveLimits(facility.id, facilityIndex)}
                disabled={saving}
                className="btn-primary save-limits-btn"
              >
                {savingFacility === facility.id ? 'Saving...' : 'Save Limits'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .facilities-limits-container {
          display: grid;
          gap: 24px;
          margin-top: 20px;
        }

        .facility-limits-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .facility-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f3f4f6;
        }

        .facility-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .facility-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .facility-category {
          background: #e0e7ff;
          color: #3730a3;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          align-self: flex-start;
        }

        .facility-summary {
          display: flex;
          align-items: center;
        }

        .summary-text {
          background: #f3f4f6;
          color: #6b7280;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .limits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .limit-input-group {
          display: flex;
          flex-direction: column;
        }

        .limit-label {
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
          font-size: 0.875rem;
        }

        .limit-input-wrapper {
          display: flex;
          align-items: center;
          position: relative;
        }

        .limit-input {
          width: 100%;
          padding: 10px 50px 10px 12px;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .limit-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .limit-unit {
          position: absolute;
          right: 12px;
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
          pointer-events: none;
        }

        .facility-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .save-limits-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-limits-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .save-limits-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          text-align: center;
          padding: 40px;
          font-size: 1.1rem;
          color: #6b7280;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .alert-error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .alert-success {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        .header-info {
          margin-top: 16px;
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .info-text {
          margin: 0;
          color: #475569;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .limits-grid {
            grid-template-columns: 1fr;
          }
          
          .facility-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .facility-info {
            width: 100%;
          }

          .facility-summary {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminManageFacilityLimits;
