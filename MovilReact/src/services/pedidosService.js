import client from '../api/client';

export const pedidosService = {
  getPedidos: async (status = '') => {
    // If status is passed, add query param, else get all
    const url = status ? `/api/pedidos/?status=${status}` : '/api/pedidos/';
    const response = await client.get(url);
    return response.data;
  },

  getPedido: async (id) => {
    const response = await client.get(`/api/pedidos/${id}`);
    return response.data;
  },

  createPedido: async (pedidoData) => {
    const response = await client.post('/api/pedidos/', pedidoData);
    return response.data;
  },

  updateStatus: async (id, statusData) => {
    const response = await client.put(`/api/pedidos/${id}/status`, statusData);
    return response.data;
  },
  
  updateDetalleStatus: async (pedido_id, detalle_id, statusData) => {
    const response = await client.put(`/api/pedidos/${pedido_id}/detalles/${detalle_id}/status`, statusData);
    return response.data;
  }
};
