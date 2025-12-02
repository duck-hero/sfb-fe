import axios from "axios";
import { api } from "./api";
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
    throw error.response ? error.response.data : error.message;
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
      throw error.response ? error.response.data : error.message;
    }
  },

  // Cập nhật ngân hàng
  updateBank: async (bankData) => {
    try {
      const response = await axiosInstance.put(`${api}/Bank/UpdateBank`, bankData);

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
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
      throw error.response ? error.response.data : error.message;
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
    throw error.response ? error.response.data : error.message;
  }
},


};

export default bankApi;
