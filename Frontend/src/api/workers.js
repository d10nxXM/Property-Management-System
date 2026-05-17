import api from './axios';

export const getWorkers      = (params)   => api.get('/workers', { params });
export const getWorker       = (id)       => api.get(`/workers/${id}`);
export const updateWorker    = (id, data) => api.patch(`/workers/${id}`, data);
export const getWorkerSkills = (id)       => api.get(`/workers/${id}/skills`);
export const setWorkerSkills = (id, data) => api.put(`/workers/${id}/skills`, data);
export const getWorkerReviews = (id)      => api.get(`/workers/${id}/reviews`);