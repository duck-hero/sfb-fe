import axios from "axios";
import { api } from "./api";
import axiosInstance from "./axiosInstance";

const accountApi = {
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
  try {
    const response = await axios.post(`${api}/Account/Verify2FACode`, data);
    // console.log("✅ Response từ API:", response.data);
    return response.data;
  } catch (error) {
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

  getUserList: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`${api}/Account/GetPagedListUser`, {
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

  createUser: async (data) => {
    try {
      const response = await axiosInstance.post(`${api}/Account/CreateUser`, data);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  updateUser: async (data) => {
    try {
      const response = await axiosInstance.put(`${api}/Account/UpdateUser`, data);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  deleteUser: async (id) => {
    try {
      // Assuming DELETE method passing ID, or POST if required by backend specific design
      // Standard REST would be DELETE /Account/DeleteUser?id=... or /Account/DeleteUser/{id}
      // Based on typical patterns here, likely query param or body. 
      // Using query param for DeleteUser?id=... pattern which matches GetPagedListUser style slightly
      const response = await axiosInstance.delete(`${api}/Account/DeleteUser`, {
        params: { id },
      });
      return response.data;
    } catch (error) {
        // Fallback to POST if DELETE is not allowed or implemented differently
        try {
             const response = await axiosInstance.post(`${api}/Account/DeleteUser?id=${id}`);
             return response.data;
        } catch (innerError) {
             throw error.response ? error.response.data : error.message;
        }
    }
  },
};

export default accountApi;