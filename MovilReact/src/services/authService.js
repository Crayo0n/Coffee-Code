import client from '../api/client';

export const authService = {
  login: async (email, password) => {
    const response = await client.post('/api/auth/login-json', {
      username: email,
      password: password,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await client.get('/api/colaboradores/me/profile');
    return response.data;
  }
};
