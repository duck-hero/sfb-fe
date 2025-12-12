import { api } from "./api";
import axiosInstance from "./axiosInstance";

const roleApi = {
  getRoles: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`${api}/Role/GetPagedListRole`, {
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

export default roleApi;
