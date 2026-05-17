import api from './axios';

export const getRepairs      = (params)   => api.get('/repair-requests', { params });
export const getRepair       = (id)       => api.get(`/repair-requests/${id}`);
export const createRepair    = (data)     => api.post('/repair-requests', data);
export const updateRepair    = (id, data) => api.patch(`/repair-requests/${id}`, data);
export const deleteRepair    = (id)       => api.delete(`/repair-requests/${id}`);
export const applyForRepair  = (id, data) => api.post(`/repair-requests/${id}/applications`, data);
export const getApplications = (id, params) => api.get(`/repair-requests/${id}/applications`, { params });
export const acceptApplication = (repairId, workerId) => api.patch(`/repair-requests/${repairId}/applications/${workerId}/accept`);