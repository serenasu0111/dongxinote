import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateSettings: (data: { aiAnswerLength?: string; autoBackup?: boolean }) =>
    api.put('/auth/settings', data),
};

export const inventoryAPI = {
  getAll: (includeArchived?: boolean) =>
    api.get('/inventories', { params: { includeArchived } }),
  getOne: (id: string) => api.get(`/inventories/${id}`),
  create: (data: { name: string; type: string; remark?: string }) =>
    api.post('/inventories', data),
  update: (id: string, data: { name?: string; type?: string; remark?: string }) =>
    api.put(`/inventories/${id}`, data),
  delete: (id: string, deleteNotes?: boolean) =>
    api.delete(`/inventories/${id}`, { data: { deleteNotes } }),
  archive: (id: string) => api.put(`/inventories/${id}/archive`),
  unarchive: (id: string) => api.put(`/inventories/${id}/unarchive`),
};

export const noteAPI = {
  getAll: (params?: { inventoryId?: string; page?: number; limit?: number; tag?: string }) =>
    api.get('/notes', { params }),
  getOne: (id: string) => api.get(`/notes/${id}`),
  create: (data: {
    inventoryId: string;
    type: string;
    originalContent: string;
    remark?: string;
    tags?: string[];
    isFromImage?: boolean;
    isFromDocument?: boolean;
  }) => api.post('/notes', data),
  update: (id: string, data: { remark?: string; tags?: string[]; relatedNotes?: string[] }) =>
    api.put(`/notes/${id}`, data),
  delete: (id: string) => api.delete(`/notes/${id}`),
  getRelated: (id: string) => api.get(`/notes/${id}/related`),
  getByDate: (date: string) => api.get('/notes/date', { params: { date } }),
};

export const searchAPI = {
  searchNotes: (params: {
    keyword?: string;
    inventoryId?: string;
    sort?: 'relevance' | 'time';
    page?: number;
    limit?: number;
  }) => api.get('/search/notes', { params }),
  getTimeline: () => api.get('/search/timeline'),
  askAI: (data: { question: string; inventoryId?: string }) =>
    api.post('/search/ai/chat', data),
};

export default api;
