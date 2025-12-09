import { api, handleApiError } from "./api"; // Updated import
import axiosInstance from "./axiosInstance";

const bankApi = {
  // Lấy danh sách ngân hàng (có phân trang)
getBankList: async (pageNumber = 1, pageSize = 10, bankCode) => {
  try {
    const response = await axiosInstance.get(`${api}/Bank/GetPagedListBank`, {
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize,
        BankCode: bankCode, // <-- sửa ở đây
      },
    });

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
},


  // Lấy thông tin ngân hàng theo Id
  getBankById: async (id) => {
    try {
      const response = await axiosInstance.get(`${api}/Bank/GetBankById`, {
        params: { Id: id },
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Cập nhật ngân hàng
  updateBank: async (bankData) => {
    try {
      const response = await axiosInstance.put(`${api}/Bank/UpdateBank`, bankData);

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

    // Xóa thông tin ngân hàng theo Id
  deleteBankById: async (id) => {
    try {
      const response = await axiosInstance.delete(`${api}/Bank/DeleteBank`, {
        params: { Id: id },
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
createBank: async (bankName, bankCode) => {
  try {
    const response = await axiosInstance.post(`${api}/Bank/CreateBank`, {
      bankName: bankName,
      bankCode: bankCode,
    });

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
},


};

export default bankApi;
