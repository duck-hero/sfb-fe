import { api, handleApiError } from "./api";
import axiosInstance from "./axiosInstance";

const bmAccountApi = {
  getBmAccountList: async (pageNumber = 1, pageSize = 10, accountName) => {
    try {
      const response = await axiosInstance.get(
        `${api}/BmAccount/GetPagedListBmAccount`,
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
            Name: accountName,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy thông tin BmAccount theo Id
  getBmAccountById: async (id) => {
    try {
      const response = await axiosInstance.get(
        `${api}/BmAccount/GetBmAccountById`,
        {
          params: { Id: id },
        }
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Cập nhật BmAccount
  updateBmAccount: async (bmAccountData) => {
    try {
      const response = await axiosInstance.put(
        `${api}/BmAccount/UpdateBmAccount`,
        bmAccountData
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Xóa thông tin BmAccount theo Id
  deleteBmAccountById: async (id) => {
    try {
      const response = await axiosInstance.delete(
        `${api}/BmAccount/DeleteBmAccount`,
        {
          params: { Id: id },
        }
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  // Tạo mới thông tin BmAccount
  createBmAccount: async (accountName, bmSourceId) => {
    try {
      const response = await axiosInstance.post(
        `${api}/BmAccount/CreateBmAccount`,
        {
          name: accountName,
          bmSourceId: bmSourceId
        }
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default bmAccountApi;
