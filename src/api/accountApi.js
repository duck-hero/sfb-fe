import axios from "axios";
import { api } from "./api";
import axiosInstance from "./axiosInstance";

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
    getUser: async () => {
    try {
      // Gọi API với header Authorization chứa token
      const response = await axiosInstance.get(`${api}/Account/GetCurrentUser`);

      return response.data.data;
    } catch (error) {
      // Xử lý lỗi và ném lại thông báo lỗi
      throw error.response ? error.response.data : error.message;
    }
  },
      get2FAStatus: async () => {
    try {
      // Gọi API với header Authorization chứa token
      const response = await axiosInstance.get(`${api}/Account/Get2FAStatus`);

      return response.data.data;
    } catch (error) {
      // Xử lý lỗi và ném lại thông báo lỗi
      throw error.response ? error.response.data : error.message;
    }
  },
        enable2FA: async () => {
    try {
      // Gọi API với header Authorization chứa token
      const response = await axiosInstance.post(`${api}/Account/Enable2FA`);

      return response.data.data;
    } catch (error) {
      // Xử lý lỗi và ném lại thông báo lỗi
      throw error.response ? error.response.data : error.message;
    }
  },
Verify2FASetup: async (code) => {
  
  try {
    const response = await axiosInstance.post(`${api}/Account/Verify2FASetup`, {
      authenticatorCode: code,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
},
verify2FACode: async (data) => {
  console.log("🚀 Dữ liệu gửi đi:", data);

  try {
    const response = await axios.post(`${api}/Account/Verify2FACode`, data);
    console.log("✅ Response từ API:", response.data);
    return response.data;
  } catch (error) {
    console.log("❌ Lỗi khi gọi API:", error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : error.message;
  }
},
Disable2FA: async (password) => {
  
  try {
    const response = await axiosInstance.post(`${api}/Account/Disable2FA`, {
      password: password,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
},




};

export default accountApi;