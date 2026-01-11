import { api, handleApiError } from "./api";
import axiosInstance from "./axiosInstance";

const bmSourceApi = {
  getBmSourceList: async (pageNumber = 1, pageSize = 10, sourceName) => {
    try {
      const response = await axiosInstance.get(
        `${api}/BmSource/GetPagedListBmSource`,
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
            SourceName: sourceName,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy thông tin BmSource theo Id
  getBmSourceById: async (id) => {
    try {
      const response = await axiosInstance.get(
        `${api}/BmSource/GetBmSourceById`,
        {
          params: { Id: id },
        }
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Cập nhật BmSource
  updateBmSource: async (bmSourceData) => {
    try {
      const response = await axiosInstance.put(
        `${api}/BmSource/UpdateBmSource`,
        bmSourceData
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Xóa thông tin BmSource theo Id
  deleteBmSourceById: async (id) => {
    try {
      const response = await axiosInstance.delete(
        `${api}/BmSource/DeleteBmSource`,
        {
          params: { Id: id },
        }
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  // Tạo mới thông tin BmSource
  createBmSource: async (data) => {
    try {
      const response = await axiosInstance.post(
        `${api}/BmSource/CreateBmSource`,
        data
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy thống kê hàng tháng
  getMonthlyStats: async (year, month) => {
    try {
      const response = await axiosInstance.get(
        `${api}/BmSource/monthly-stats`,
        {
          params: { Year: year, Month: month },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy chi tiết đối soát nguồn theo tháng
  getReconciliation: async (sourceId, year, month) => {
    try {
      const response = await axiosInstance.get(
        `${api}/BmSource/${sourceId}/reconciliation`,
        {
          params: { year: year, month: month },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy tổng hợp công nợ các đầu tổng
  getReconciliationSummary: async (year, month, refresh = false) => {
    try {
      const response = await axiosInstance.get(
        `${api}/BmSource/reconciliation-summary`,
        {
          params: { year: year, month: month, refresh },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  // Cập nhật chiết khấu thủ công
  updateDiscount: async (data) => {
    try {
      const response = await axiosInstance.put(
        `${api}/BmSource/reconciliation/discount`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default bmSourceApi;
