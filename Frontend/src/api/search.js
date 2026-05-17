import api from './axios';

export const quickSearch      = (q)       => api.get('/search/quick', { params: { q } });
export const searchWorkers    = (params)  => api.get('/search/workers', { params });
export const searchRepairs    = (params)  => api.get('/search/repairs', { params });
export const searchProperties = (params)  => api.get('/search/properties', { params });