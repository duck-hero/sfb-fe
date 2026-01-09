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

  // Lấy tổng hợp hàng tháng
  getMonthlySummary: async (year, month) => {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      const response = await axiosInstance.get(`${api}/dashboard/monthly-summary`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy ma trận lợi nhuận phí hàng ngày
  getDailyFeeProfitMatrix: async (year, month) => {
    try {
      const response = await axiosInstance.get(
        `${api}/dashboard/daily-fee-profit-matrix`,
        {
          params: { year, month },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy thống kê CTV (Collaborator Summary)
  getCTVSummary: async (year, month) => {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      const response = await axiosInstance.get(`${api}/dashboard/ctv-summary`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy công nợ nhân viên (Employee Debt Summary)
  getEmployeeDebtSummary: async (year, month, refresh = false) => {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      if (refresh) params.refresh = true;
      const response = await axiosInstance.get(`${api}/dashboard/employee-debt-summary`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getEmployeeSalesReport: async (year, month) => {
    try {
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      const response = await axiosInstance.get(`${api}/dashboard/employee-sales-report`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateEmployeeRevenueBonus: async (userId, year, month, revenueBonus) => {
    try {
      const response = await axiosInstance.put(`${api}/dashboard/employee-debt-revenue-bonus`, {
        userId,
        year,
        month,
        revenueBonus
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default dashboardApi;
