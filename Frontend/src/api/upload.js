import api from './axios';

export const uploadProfileImage  = (formData) => api.post('/upload/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const uploadPropertyImage = (propertyId, formData) => api.post(`/upload/property/${propertyId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const uploadRepairImage   = (repairId, formData)   => api.post(`/upload/repair/${repairId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });