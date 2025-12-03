import axios from "axios";
import { api } from "./api";
import axiosInstance from "./axiosInstance";

const bankAccountApi = {
  // Lấy danh sách tài khoản ngân hàng (có phân trang)
getBankList: async (pageNumber = 1, pageSize = 10, accountBankNumber, accountBankHolderName, bankId) => {
  try {
    const params = { PageNumber: pageNumber, PageSize: pageSize };
    if (accountBankNumber) params.AccountBankNumber = accountBankNumber;
    if (accountBankHolderName) params.AccountBankHolderName = accountBankHolderName;
    if (bankId) params.BankId = bankId; // filter bankId


    const response = await axiosInstance.get(
      `${api}/BankAccount/GetPagedListBankAccount`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
},
  // Lấy thông tin tài khoản ngân hàng theo Id
  getBankAccountById: async (id) => {
    try {
      const response = await axiosInstance.get(`${api}/BankAccount/GetBankAccountById`, {
        params: { Id: id },
      });

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Cập nhật tài khoản ngân hàng
  updateBankAccount: async (bankData) => {
    try {
      const response = await axiosInstance.put(`${api}/BankAccount/UpdateBankAccount`, bankData);

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

    // Xóa thông tin tài khoản ngân hàng theo Id
  deleteBankAccountById: async (id) => {
    try {
      const response = await axiosInstance.delete(`${api}/BankAccount/DeleteBankAccount`, {
        params: { Id: id },
      });

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },
  // Thêm mới tài khoản ngân hàng
createBankAccount: async (accountBankNumber, accountBankHolderName, loginUsername, loginPassword, bankId) => {
  try {
    const response = await axiosInstance.post(`${api}/BankAccount/CreateBankAccount`, {
      accountBankNumber: accountBankNumber,
      accountBankHolderName: accountBankHolderName,
      loginUsername: loginUsername,
      loginPassword: loginPassword,
      bankId: bankId
    });

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
},


};

export default bankAccountApi;
