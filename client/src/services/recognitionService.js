import api from './api';

export const recognitionService = {
  scan: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Config header multipart/form-data để upload file
    const response = await api.post('/recognition/start', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};