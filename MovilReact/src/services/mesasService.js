import client from '../api/client';

export const mesasService = {
  getMesas: async () => {
    const response = await client.get('/api/mesas/');
    return response.data;
  },
  
  updateStatus: async (id, statusData) => {
    const response = await client.put(`/api/mesas/${id}`, statusData);
    return response.data;
  }
};
