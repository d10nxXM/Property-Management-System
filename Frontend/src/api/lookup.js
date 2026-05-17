import api from './axios';

export const getCities      = () => api.get('/cities');
export const getSkills      = () => api.get('/skills');
export const getSkillLevels = () => api.get('/skill-levels');
export const getCategories  = () => api.get('/categories');
export const getStatuses    = () => api.get('/statuses');
export const getUrgencies   = () => api.get('/urgencies');
export const getRoles       = () => api.get('/roles');