import API from '../api/axios';

export const balanceService = {
  // Adjust balance
  adjust: async (data) => {
    const response = await API.post('/balance/adjust', data);
    return response.data;
  },

  // Get adjustment history
  getAdjustments: async (limit = 50, offset = 0) => {
    const response = await API.get(`/balance/adjustments?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  // Undo an adjustment
  undo: async (id, type) => {
    const response = await API.delete(`/balance/adjustments/${id}`, {
      data: { type }
    });
    return response.data;
  }
};
