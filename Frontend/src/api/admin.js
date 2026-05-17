import api from './axios';

export const getStats         = ()       => api.get('/admin/stats');
export const getAllUsers       = (params) => api.get('/admin/users', { params });
export const getUserDetails   = (id)     => api.get(`/admin/users/${id}`);
export const deleteUser       = (id)     => api.delete(`/admin/users/${id}`);
export const getAllRepairs     = (params) => api.get('/admin/repairs', { params });
export const adminDeleteRepair = (id)    => api.delete(`/admin/repairs/${id}`);
export const updateRepairStatus = (id, data) => api.patch(`/admin/repairs/${id}/status`, data);