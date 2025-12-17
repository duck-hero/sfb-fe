import { api, handleApiError } from "./api";
import axiosInstance from "./axiosInstance";

const dailySpendApi = {
  // Get Spend Grid
  getSpendGrid: async (customerId, year, month) => {
    try {
      const response = await axiosInstance.get(`${api}/customers/${customerId}/spend-grid`, {
        params: { year, month }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Upsert Daily Spend
  upsertDailySpend: async (data) => {
    // data: { customerAdsAccountId, date, spend }
    try {
      const response = await axiosInstance.put(`${api}/DailySpend/UpsertDailySpend`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete Daily Spend
  deleteDailySpend: async (customerAdsAccountId, date) => {
    try {
      const response = await axiosInstance.delete(`${api}/DailySpend/DeleteDailySpend`, {
        params: { customerAdsAccountId, date }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default dailySpendApi;
