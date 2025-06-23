import {API_BASED_URL} from '../config.js'; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getFileUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath;
  const cleanPath = filePath.replace(/^\/+/, '');
  return `${API_BASED_URL}${cleanPath}`;
};

function ManageForms() {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingForm, setEditingForm] = useState(null);
  const [newForm, setNewForm] = useState({
    form_name: '',
    description: '',
    form_file: null,
    facility_name: '',
    facility_link: '',
  });

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await axios.get('/api/forms');
      setForms(response.data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch forms. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleEdit = (form) => {
    setEditingForm({ ...form });
  };

  const handleCancelEdit = () => {
    setEditingForm(null);
  };

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append('form_name', editingForm.form_name);
      formData.append('description', editingForm.description);
      formData.append('facility_name', editingForm.facility_name);
      formData.append('facility_link', editingForm.facility_link);
      
      // If a new file is selected, append it
      if (editingForm.form_file) {
        formData.append('form_file', editingForm.form_file);
      }

      await axios.put(`/api/forms/${editingForm.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `${localStorage.getItem('userToken')}`
        }
      });
      
      setForms(forms.map(form => form.id === editingForm.id ? editingForm : form));
      setEditingForm(null);
    } catch (err) {
      setError('Failed to update form. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await axios.delete(`/api/forms/${id}`, {
          headers: {
            Authorization: `${localStorage.getItem('userToken')}`
          }
        });
        setForms(forms.filter(form => form.id !== id));
      } catch (err) {
        setError('Failed to delete form. Please try again.');
      }
    }
  };

  const handleAddNew = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('form_name', newForm.form_name);
      formData.append('description', newForm.description);
      formData.append('facility_name', newForm.facility_name);
      formData.append('facility_link', newForm.facility_link);
      
      if (newForm.form_file) {
        formData.append('form_file', newForm.form_file);
      }

      const response = await axios.post('/api/forms', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `${localStorage.getItem('userToken')}`
        }
      });
      
      setForms([...forms, response.data]);
      setNewForm({
        form_name: '',
        description: '',
        form_file: null,
        facility_name: '',
        facility_link: '',
      });
    } catch (err) {
      setError('Failed to add new form. Please try again.');
    }
  };

  const handleFileChange = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file only.');
        e.target.value = '';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB.');
        e.target.value = '';
        return;
      }

      if (isEditing) {
        setEditingForm({ ...editingForm, form_file: file });
      } else {
        setNewForm({ ...newForm, form_file: file });
      }
      setError(null);
    }
  };

  if (isLoading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Manage IITRPR Forms</h1>
        
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Add New Form</h2>
          <form onSubmit={handleAddNew} className="space-y-4">
            <input
              type="text"
              placeholder="Form Name"
              value={newForm.form_name}
              onChange={(e) => setNewForm({...newForm, form_name: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
            <textarea
              placeholder="Description"
              value={newForm.description}
              onChange={(e) => setNewForm({...newForm, description: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form PDF File
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, false)}
                className="w-full p-2 border rounded"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Upload PDF file (max 5MB)</p>
            </div>
            <input
              type="text"
              placeholder="Facility Name"
              value={newForm.facility_name}
              onChange={(e) => setNewForm({...newForm, facility_name: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="url"
              placeholder="Facility Link"
              value={newForm.facility_link}
              onChange={(e) => setNewForm({...newForm, facility_link: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Add Form
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Form Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Facility</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Form PDF</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Facility Link</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {forms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {editingForm && editingForm.id === form.id ? (
                      <input
                        type="text"
                        value={editingForm.form_name}
                        onChange={(e) => setEditingForm({...editingForm, form_name: e.target.value})}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      form.form_name
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {editingForm && editingForm.id === form.id ? (
                      <textarea
                        value={editingForm.description}
                        onChange={(e) => setEditingForm({...editingForm, description: e.target.value})}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      form.description
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {editingForm && editingForm.id === form.id ? (
                      <input
                        type="text"
                        value={editingForm.facility_name}
                        onChange={(e) => setEditingForm({...editingForm, facility_name: e.target.value})}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      form.facility_name
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {editingForm && editingForm.id === form.id ? (
                      <div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileChange(e, true)}
                          className="w-full p-1 border rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">Upload new PDF (max 5MB)</p>
                      </div>
                    ) : (
                      form.form_link ? (
                        <a 
                          href={getFileUrl(form.form_link)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View PDF
                        </a>
                      ) : (
                        <span className="text-gray-500">No PDF uploaded</span>
                      )
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {editingForm && editingForm.id === form.id ? (
                      <input
                        type="url"
                        value={editingForm.facility_link}
                        onChange={(e) => setEditingForm({...editingForm, facility_link: e.target.value})}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      <a href={form.facility_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {form.facility_link}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      {editingForm && editingForm.id === form.id ? (
                        <>
                          <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-800">Save</button>
                          <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-800">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(form)} className="text-blue-600 hover:text-blue-800">Edit</button>
                          <button onClick={() => handleDelete(form.id)} className="text-red-600 hover:text-red-800">Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ManageForms;

