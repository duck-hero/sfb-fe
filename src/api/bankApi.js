import axios from "axios";
import { api } from "./api";
import axiosInstance from "./axiosInstance";

const bankApi = {
  // Truyền pageNumber và pageSize khi gọi API
  getBankList: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`${api}/Bank/GetPagedListBank`, {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      });

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },
};

export default bankApi;