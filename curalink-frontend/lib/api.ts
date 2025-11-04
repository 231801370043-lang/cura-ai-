import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('API 401 error - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: Record<string, unknown>) => api.post('/api/auth/register', data),
  login: (data: Record<string, unknown>) => api.post('/api/auth/login', data),
};

// Users API
export const usersAPI = {
  getMe: () => api.get('/api/users/me'),
  getPatientProfile: () => api.get('/api/users/patient-profile'),
  updatePatientProfile: (data: Record<string, unknown>) => api.put('/api/users/patient-profile', data),
  getResearcherProfile: () => api.get('/api/users/researcher-profile'),
  updateResearcherProfile: (data: Record<string, unknown>) => api.put('/api/users/researcher-profile', data),
  getResearchers: (params?: Record<string, unknown>) => api.get('/api/users/researchers', { params }),
};

// Trials API
export const trialsAPI = {
  search: (params: Record<string, unknown>) => api.get('/api/trials/', { params }),
  getDetails: (nctId: string) => api.get(`/api/trials/${nctId}`),
  getAll: () => api.get('/api/trials/'),
};

// Publications API
export const publicationsAPI = {
  search: (params: Record<string, unknown>) => api.get('/api/publications/', { params }),
  getDetails: (pmid: string) => api.get(`/api/publications/${pmid}`),
  getAll: () => api.get('/api/publications/'),
};

// Experts API
export const expertsAPI = {
  search: (params: Record<string, unknown>) => api.get('/api/experts/', { params }),
  getDetails: (expertId: number) => api.get(`/api/experts/${expertId}`),
  getAll: () => api.get('/api/experts/'),
};

// Forums API
export const forumsAPI = {
  getAll: () => api.get('/api/forums/'),
  create: (data: Record<string, unknown>) => api.post('/api/forums/', data),
  getPosts: (forumId: number) => api.get(`/api/forums/${forumId}/posts`),
  createPost: (forumId: number, data: Record<string, unknown>) => api.post(`/api/forums/${forumId}/posts`, data),
  deletePost: (forumId: number, postId: number) => api.delete(`/api/forums/${forumId}/posts/${postId}`),
};

// Favorites API
export const favoritesAPI = {
  getAll: (itemType?: string) => api.get('/api/favorites/', { params: { item_type: itemType } }),
  add: (data: Record<string, unknown>) => api.post('/api/favorites/', data),
  remove: (favoriteId: number) => api.delete(`/api/favorites/${favoriteId}`),
  check: (itemType: string, itemId: string) => api.get(`/api/favorites/check/${itemType}/${itemId}`),
};

// Chat API
export const chatAPI = {
  getConversations: () => api.get('/api/chat/conversations'),
  getMessages: (otherUserId: string) => api.get(`/api/chat/messages/${otherUserId}`),
  sendMessage: (data: Record<string, unknown>) => api.post('/api/chat/messages', data),
  chatWithAI: (data: Record<string, unknown>) => api.post('/api/chat/ai-assistant', data),
};

// Meetings API
export const meetingsAPI = {
  getAll: () => api.get('/api/meetings/'),
  create: (data: Record<string, unknown>) => api.post('/api/meetings/', data),
  updateStatus: (requestId: string, status: string) => api.put(`/api/meetings/${requestId}/status`, { status }),
  cancel: (requestId: string) => api.delete(`/api/meetings/${requestId}`),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/api/notifications/'),
  markAsRead: (notificationId: string) => api.put(`/api/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/api/notifications/mark-all-read'),
  delete: (notificationId: string) => api.delete(`/api/notifications/${notificationId}`),
  sendVideoCall: (data: {receiver_id: string, room_name: string}) => api.post('/api/notifications/video-call', data),
  sendMessage: (data: {receiver_id: string, message_content: string}) => api.post('/api/notifications/message', data),
  respondToVideoCall: (notificationId: string, action: string) => api.put(`/api/notifications/video-call/${notificationId}/respond`, {action}),
  create: (data: Record<string, unknown>) => api.post('/api/notifications/', data),
};
