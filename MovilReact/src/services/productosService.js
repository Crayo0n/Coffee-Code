import client from '../api/client';

export const productosService = {
  getProductos: async () => {
    const response = await client.get('/api/productos/');
    return response.data;
  },

  getCategorias: async () => {
    const response = await client.get('/api/categorias/');
    return response.data;
  }
};
