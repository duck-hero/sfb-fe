import axios from "axios";
import { api } from "./api";

const accountApi = {
  // getUser: async () => {
  //   try {
  //     // Gọi API với header Authorization chứa token
  //     const response = await axiosInstance.get(`${api}/account/current-user`);

  //     return response.data;
  //   } catch (error) {
  //     // Xử lý lỗi và ném lại thông báo lỗi
  //     throw error.response ? error.response.data : error.message;
  //   }
  // },

  login: async (credentials) => {
    try {
      const response = await axios.post(`${api}/Account/Authenticate`, credentials);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },
};

export default accountApi;