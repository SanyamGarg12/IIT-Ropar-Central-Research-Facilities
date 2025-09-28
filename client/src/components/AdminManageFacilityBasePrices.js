import React, { useState, useEffect } from 'react';
import { API_BASED_URL } from '../config.js';
import { secureAdminFetch, getAdminToken } from '../utils/security';
import '../App.css';

const AdminManageFacilityBasePrices = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingFacility, setSavingFacility] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingFacility, setEditingFacility] = useState(null);
  const [editForm, setEditForm] = useState({
    base_price: '',
    base_hours: ''
  });

  useEffect(() => {
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
      const response = await secureAdminFetch(`${API_BASED_URL}api/admin/facilities/base-prices`);

      if (!response.ok) {
        throw new Error('Failed to fetch facilities');
      }

      const data = await response.json();
      setFacilities(data);
      setError('');
    } catch (err) {
      console.error('Error fetching facilities:', err);
      if (err.message === 'Admin session expired') {
        return;
      }
      setError('Failed to fetch facilities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (facility) => {
    setEditingFacility(facility.id);
    setEditForm({
      base_price: facility.base_price || '',
      base_hours: facility.base_hours || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingFacility(null);
    setEditForm({ base_price: '', base_hours: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateFacilityBasePrice = async (facilityId) => {
    try {
      setSaving(true);
      setSavingFacility(facilityId);
      
      const response = await secureAdminFetch(`${API_BASED_URL}api/admin/facilities/${facilityId}/base-price`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update base price');
      }

      setSuccess('Facility base price updated successfully!');
      setError('');
      setEditingFacility(null);
      setEditForm({ base_price: '', base_hours: '' });
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh the facilities list
      fetchFacilities();
    } catch (err) {
      console.error('Error updating base price:', err);
      if (err.message === 'Admin session expired') {
        return;
      }
      setError('Failed to update base price. Please try again.');
      setSuccess('');
    } finally {
      setSaving(false);
      setSavingFacility(null);
    }
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
        <h2>Manage Facility Base Prices</h2>
        <p>Configure base prices and hours for superuser activation</p>
        <div className="header-info">
          <p className="info-text">
            <strong>Note:</strong> These settings control how much supervisors pay and how many hours 
            superusers get when they are approved for a specific facility. The base price is deducted 
            from the supervisor's wallet immediately upon approval.
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

      <div className="facilities-base-prices-container">
        {facilities.map((facility) => (
          <div key={facility.id} className="facility-base-price-card">
            <div className="facility-header">
              <div className="facility-info">
                <h3>{facility.name}</h3>
                <span className="facility-category">{facility.category_name}</span>
              </div>
              <div className="facility-status">
                {facility.base_price && facility.base_hours ? (
                  <span className="status-badge configured">Configured</span>
                ) : (
                  <span className="status-badge not-configured">Not Configured</span>
                )}
              </div>
            </div>

            {editingFacility === facility.id ? (
              <div className="edit-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Base Price (₹)</label>
                    <input
                      type="number"
                      name="base_price"
                      value={editForm.base_price}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter base price"
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Base Hours</label>
                    <input
                      type="number"
                      name="base_hours"
                      value={editForm.base_hours}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter base hours"
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    onClick={() => updateFacilityBasePrice(facility.id)}
                    disabled={saving}
                    className="btn-primary"
                  >
                    {savingFacility === facility.id ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="facility-details">
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Base Price:</span>
                    <span className="detail-value">
                      {facility.base_price ? `₹${facility.base_price}` : 'Not set'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Base Hours:</span>
                    <span className="detail-value">
                      {facility.base_hours ? `${facility.base_hours} hours` : 'Not set'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">
                      {facility.updated_at ? new Date(facility.updated_at).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
                <div className="facility-actions">
                  <button
                    onClick={() => handleEdit(facility)}
                    className="btn-primary"
                  >
                    {facility.base_price && facility.base_hours ? 'Edit' : 'Configure'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .facilities-base-prices-container {
          display: grid;
          gap: 24px;
          margin-top: 20px;
        }

        .facility-base-price-card {
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

        .facility-status {
          display: flex;
          align-items: center;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-badge.configured {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.not-configured {
          background: #fef3c7;
          color: #92400e;
        }

        .edit-form {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
          font-size: 0.875rem;
        }

        .form-input {
          padding: 10px 12px;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 12px;
        }

        .facility-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          flex: 1;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          font-size: 1rem;
          color: #1f2937;
          font-weight: 600;
        }

        .facility-actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #4b5563;
          transform: translateY(-1px);
        }

        .btn-secondary:disabled {
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
          .facility-details {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminManageFacilityBasePrices;
