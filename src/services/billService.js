import API from "../api/api";

export const billService = {
  // Get all bills
  getBills: async (isActive = true, upcomingOnly = false) => {
    const response = await API.get(`/bills?is_active=${isActive}&upcoming=${upcomingOnly}`);
    return response.data;
  },

  // Create a new bill
  createBill: async (billData) => {
    const response = await API.post("/bills", billData);
    return response.data;
  },

  // Update a bill
  updateBill: async (id, billData) => {
    const response = await API.put(`/bills/${id}`, billData);
    return response.data;
  },

  // Delete a bill
  deleteBill: async (id, hardDelete = false) => {
    const response = await API.delete(`/bills/${id}?hard=${hardDelete}`);
    return response.data;
  },

  // Pay a bill (creates expense automatically)
  payBill: async (id, paymentData) => {
    const response = await API.post(`/bills/${id}/pay`, paymentData);
    return response.data;
  },

  // Get bills summary for current month
  getBillsSummary: async () => {
    const response = await API.get("/bills/summary");
    return response.data;
  },

  // Get payment history for a specific bill
  getPaymentHistory: async (billId) => {
    const response = await API.get(`/bills/payment-history/${billId}`);
    return response.data;
  },
};
