import axios from "axios";
import { api } from "./api";
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
      throw error.response ? error.response.data : error.message;
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
      throw error.response ? error.response.data : error.message;
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
      throw error.response ? error.response.data : error.message;
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
      throw error.response ? error.response.data : error.message;
    }
  },
  // Tạo mới thông tin BmSource
  createBmSource: async (sourceName) => {
    try {
      const response = await axiosInstance.post(
        `${api}/BmSource/CreateBmSource`,
        {
          sourceName: sourceName,
        }
      );

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },
};

export default bmSourceApi;
