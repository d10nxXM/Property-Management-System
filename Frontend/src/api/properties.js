import api from './axios';

export const getProperties    = (params) => api.get('/properties', { params });
export const getProperty      = (id)     => api.get(`/properties/${id}`);
export const createProperty   = (data)   => api.post('/properties', data);
export const updateProperty   = (id, data) => api.patch(`/properties/${id}`, data);
export const deleteProperty   = (id)     => api.delete(`/properties/${id}`);