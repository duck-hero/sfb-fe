import { api, handleApiError } from "./api";
import axiosInstance from "./axiosInstance";

const customerAdsAccountApi = {
  // Thêm mới tài khoản thuê cho khách
  createCustomerAdsAccount: async (data) => {
    // data: { adAccountId, customerId }
    try {
      const response = await axiosInstance.post(`${api}/CustomerAdsAccount/CreateCustomerAdsAccount`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Cập nhật trạng thái thuê
  updateCustomerAdsAccount: async (data) => {
    // data: { id, status }
    try {
      const response = await axiosInstance.put(`${api}/CustomerAdsAccount/UpdateCustomerAdsAccount`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default customerAdsAccountApi;
