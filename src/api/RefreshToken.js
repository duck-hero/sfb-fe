import React from "react";
import { decryptToken, encryptToken } from "./cryptoService";
import { api } from "./api";

const refreshAccessToken = async () => {
  try {
    console.log("chạy refreshAccessToken");
    const encryptedAccessToken = localStorage.getItem("accessToken");
    const encryptedRefreshToken = localStorage.getItem("refreshToken");

    // Giải mã
    const accessToken = decryptToken(encryptedAccessToken);
    const refreshToken = decryptToken(encryptedRefreshToken);

    console.log("access gm", accessToken);
    console.log("refresh gm", refreshToken);
    // Gửi refreshToken tới server để nhận accessToken mới
    const response = await fetch(`${api}/Account/RefreshToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken, refreshToken }),
    });

    const data = await response.json();
    if (response.ok) {
      // Mã hóa accessToken mới và lưu vào localStorage
      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;
      // Mã hóa tokens
      const encryptedAccessToken = encryptToken(accessToken);
      const encryptedRefreshToken = encryptToken(refreshToken);

      localStorage.setItem("accessToken", encryptedAccessToken);
      localStorage.setItem("refreshToken", encryptedRefreshToken);

      console.log("Đã refresh", data);
      return data; // Trả về accessToken mới cho các hoạt động tiếp theo
    } else {
      // Xử lý lỗi, ví dụ: refreshToken không hợp lệ hoặc đã hết hạn
      console.error("Error refreshing token:", data.errors);
      // Có thể bạn muốn đăng xuất người dùng ở đây hoặc thông báo cho họ biết
    }
  } catch (error) {
    console.error("Error during the token refresh:", error);
  }
};

export default refreshAccessToken;
