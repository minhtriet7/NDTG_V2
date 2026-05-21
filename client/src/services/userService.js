import api from './api';

export const userService = {
  getHistory: async () => {
    const response = await api.get('/users/me/history');
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  }
};