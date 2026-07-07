import client from '../api/client';

export const ventasService = {
  cobrarPedido: async (ventaData) => {
    const response = await client.post('/api/ventas/cobrar', ventaData);
    return response.data;
  },

  getVentas: async () => {
    const response = await client.get('/api/ventas/');
    return response.data;
  }
};
