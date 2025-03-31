import axios from 'axios';
import {API_BASED_URL} from '../App.js'; 

const API_BASE_URL = 'http://localhost:5000/api';

export const fetchFacilities = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/facilities`);
    return response.data;
  } catch (error) {
    console.error('Error fetching facilities:', error);
    throw error;
  }
};

export const fetchPublications = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/publications`);
    return response.data;
  } catch (error) {
    console.error('Error fetching publications:', error);
    throw error;
  }
};

export const addFacility = async (facilityData, selectedPublications, imageFile) => {
  try {
    const formData = new FormData();

    // Append facility data
    Object.keys(facilityData).forEach(key => {
      formData.append(key, facilityData[key]);
    });

    // Append selected publications
    selectedPublications.forEach((pubId) => {
      formData.append('publications[]', pubId);
    });

    // Append image file if present
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await axios.post(`${API_BASE_URL}/facilities`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  } catch (error) {
    console.error('Error adding facility:', error);
    throw error;
  }
};

export const updateFacility = async (facilityId, facilityData, selectedPublications, imageFile) => {
  try {
    const formData = new FormData();

    // Append facility data
    Object.keys(facilityData).forEach(key => {
      formData.append(key, facilityData[key]);
    });

    // Append selected publications
    selectedPublications.forEach((pubId) => {
      formData.append('publication_ids[]', pubId);
    });

    // Append image file if present
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await axios.put(`${API_BASE_URL}/facilities/${facilityId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating facility:', error);
    throw error;
  }
};

export const deleteFacility = async (facilityId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/facilities/${facilityId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting facility:', error);
    throw error;
  }
};

export const getFacility = async (facilityId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/facilities/${facilityId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching facility:', error);
    throw error;
  }
};

