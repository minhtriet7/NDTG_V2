import axios from 'axios';

// Cấu hình URL mặc định
const API_URL = 'http://localhost:8000/api/v1/auth';

export const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, {
      email: email,
      password: password
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  register: async (full_name, email, password) => {
    const response = await axios.post(`${API_URL}/register`, {
      full_name: full_name,
      email: email,
      password: password
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
  }
};