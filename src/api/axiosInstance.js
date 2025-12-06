import axios from "axios";
import refreshAccessToken from "./RefreshToken";

import { decryptToken, encryptToken } from "./cryptoService";

// Tạo một axios instance
const axiosInstance = axios.create();

// Cờ và hàng đợi để xử lý concurrency
let isRefreshing = false;
let failedQueue = [];

// Hàm để xử lý hàng đợi sau khi refresh xong (hoặc thất bại)
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    // console.log("check request");
    const token = localStorage.getItem("accessToken");
    if (token) {
      const accessToken = decryptToken(token);
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu có response lỗi từ server
    if (error.response) {
      const { status, data } = error.response;

      // Điều kiện token hết hạn: 401 VÀ errorCode === 3
      const isTokenExpired =
        status === 401 && data?.errors?.some((err) => err.errorCode === 3);

      if (isTokenExpired && !originalRequest._retry) {
        
        // TRƯỜNG HỢP 1: Đang có một request khác thực hiện refresh
        if (isRefreshing) {
          // console.log("Đang refresh token, xếp request vào hàng đợi...");
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              // Khi được resolve với token mới, gán vào header và chạy lại
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        // TRƯỜNG HỢP 2: Đây là request đầu tiên phát hiện hết hạn
        originalRequest._retry = true;
        isRefreshing = true;

        // console.log("Token hết hạn, bắt đầu refresh...");

        try {
          const newTokens = await refreshAccessToken();
          
          // Refresh thành công
          if (newTokens && newTokens.accessToken) {
             // 1. Xử lý các request đang đợi trong hàng đợi
            processQueue(null, newTokens.accessToken);

            // 2. Xử lý request hiện tại (request đầu tiên bị lỗi)
            originalRequest.headers["Authorization"] = `Bearer ${newTokens.accessToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh thất bại
          console.error("Refresh token thất bại:", refreshError);
          processQueue(refreshError, null);
          
          // Có thể điều hướng về trang login tại đây
          window.location.href = '/login'; 
          
          return Promise.reject(refreshError);
        } finally {
          // Luôn reset cờ về false sau khi xong việc
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
