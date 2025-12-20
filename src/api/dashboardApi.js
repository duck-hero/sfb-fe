import { api, handleApiError } from "./api";
import axiosInstance from "./axiosInstance";

const dashboardApi = {
  // Lấy Top Debt Customers
  getTopDebtCustomers: async (year, month, limit = 10) => {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      if (limit) params.limit = limit;
      const response = await axiosInstance.get(`${api}/dashboard/top-debt`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy Top Credit Customers
  getTopCreditCustomers: async (year, month, limit = 10) => {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      if (limit) params.limit = limit;
      const response = await axiosInstance.get(`${api}/dashboard/top-credit`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy đối soát Ad Account
  getAdAccountReconciliation: async (year, month, minVariance, sortByVariance = true) => {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      if (minVariance !== undefined && minVariance !== null) params.minVariance = minVariance;
      if (sortByVariance !== undefined) params.sortByVariance = sortByVariance;
      const response = await axiosInstance.get(`${api}/dashboard/ad-account-reconciliation`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default dashboardApi;
