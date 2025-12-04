import axios from "axios";
import { api } from "./api";
import axiosInstance from "./axiosInstance";

const adsAccountApi = {
  // Lấy danh sách tài khoản (có phân trang)
getAdsAccountList: async (pageNumber = 1, pageSize = 10, adAccountIdNumber, locked, bmAccountId) => {
  try {
    const params = { PageNumber: pageNumber, PageSize: pageSize };
    if (adAccountIdNumber) params.AdAccountIdNumber = adAccountIdNumber;
    if (locked) params.Locked = locked; // filter Status
    if (bmAccountId) params.BmAccountId = bmAccountId; // filter BmAccountId


    const response = await axiosInstance.get(
      `${api}/AdsAccount/GetPagedListAdAccount`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
},
  // Lấy thông tin tài khoản theo Id
  getAdsAccountById: async (id) => {
    try {
      const response = await axiosInstance.get(`${api}/AdsAccount/GetAdAccountById`, {
        params: { Id: id },
      });

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  // Cập nhật thông tin 
  updateAdsAccount: async (adsAccountData) => {
    try {
      const response = await axiosInstance.put(`${api}/AdsAccount/UpdateAdAccount`, adsAccountData);

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

    // Xóa thông tin tài khoản theo Id
  deleteAdsAccountById: async (id) => {
    try {
      const response = await axiosInstance.delete(`${api}/AdsAccount/DeleteAdAccount`, {
        params: { Id: id },
      });

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },
  // Thêm mới
createAdsAccount: async (adAccountName, adAccountIdNumber, bmAccountId) => {
  try {
    const response = await axiosInstance.post(`${api}/AdsAccount/CreateAdAccount`, {
      adAccountName: adAccountName,
      adAccountIdNumber: adAccountIdNumber,
      bmAccountId: bmAccountId,
    });

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
},
};

export default adsAccountApi;
