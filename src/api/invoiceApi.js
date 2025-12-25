import { api, handleApiError } from "./api";
import axiosInstance from "./axiosInstance";

const invoiceApi = {
  // Generate Invoice Draft
  generateInvoice: async (customerId, year, month) => {
    try {
      const response = await axiosInstance.post(`${api}/customers/${customerId}/invoices/generate`, null, {
        params: { year, month }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Confirm Invoice
  confirmInvoice: async (invoiceId) => {
    try {
      const response = await axiosInstance.post(`${api}/invoices/${invoiceId}/confirm`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get Existing Invoice
  getInvoice: async (customerId, year, month) => {
    try {
      const response = await axiosInstance.get(`${api}/customers/${customerId}/invoices/get-invoice`, {
        params: { year, month }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default invoiceApi;
