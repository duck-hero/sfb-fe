import axios from "axios";
import { api } from "./api";
import axiosInstance from "./axiosInstance";

const bankCardApi = {
  // Lấy danh sách tài khoản ngân hàng (có phân trang)
getBankCardList: async (pageNumber = 1, pageSize = 10, cardNumber, cardHolderName, assignedToUserId) => {
  try {
    const params = { PageNumber: pageNumber, PageSize: pageSize };
    if (cardNumber) params.CardNumber = cardNumber;
    if (cardHolderName) params.CardHolderName = cardHolderName;
    if (assignedToUserId) params.AssignedToUserId = assignedToUserId; // filter UserId


    const response = await axiosInstance.get(
      `${api}/BankCard/GetPagedListBankCard`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
},
  // Lấy thông tin thẻ ngân hàng theo Id
  getBankCardById: async (id) => {
    try {
      const response = await axiosInstance.get(`${api}/BankCard/GetBankCardById`, {
        params: { Id: id },
      });

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Cập nhật thông tin thẻ ngân hàng
  updateBankCard: async (bankData) => {
    try {
      const response = await axiosInstance.put(`${api}/BankCard/UpdateBankCard`, bankData);

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

    // Xóa thông tin tài khoản ngân hàng theo Id
  deleteBankCardById: async (id) => {
    try {
      const response = await axiosInstance.delete(`${api}/BankCard/DeleteBankCard`, {
        params: { Id: id },
      });

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },
  // Thêm mới thẻ ngân hàng
createBankCard: async (cardNumber, cardHolderName, ccvCode, issuedDate, expirationDate, bankAccountId, assignedToUserId) => {
  try {
    const response = await axiosInstance.post(`${api}/BankCard/CreateBankCard`, {
      cardNumber: cardNumber,
      cardHolderName: cardHolderName,
      ccvCode: ccvCode,
      issuedDate: issuedDate,
      expirationDate: expirationDate,
      bankAccountId: bankAccountId,
      assignedToUserId: assignedToUserId,
    });

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
},


};

export default bankCardApi;
