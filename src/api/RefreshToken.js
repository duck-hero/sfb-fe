import { decryptToken, encryptToken } from "./cryptoService";
import { api } from "./api";

const refreshAccessToken = async () => {
  try {
    console.log("chạy refreshAccessToken");
    const encryptedRefreshToken = localStorage.getItem("refreshToken");

    if (!encryptedRefreshToken) {
      throw new Error("No refresh token found");
    }

    // Giải mã refresh token
    const refreshToken = decryptToken(encryptedRefreshToken);

    console.log("refresh token:", refreshToken);

    // Chỉ gửi refreshToken tới server để nhận tokens mới
    const response = await fetch(`${api}/Account/RefreshToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Mã hóa tokens mới và lưu vào localStorage
      const newAccessToken = data.data.jwToken;
      const newRefreshToken = data.data.refreshToken;

      // Mã hóa tokens
      const encryptedAccessToken = encryptToken(newAccessToken);
      const encryptedRefreshToken = encryptToken(newRefreshToken);

      localStorage.setItem("accessToken", encryptedAccessToken);
      localStorage.setItem("refreshToken", encryptedRefreshToken);

      console.log("Đã refresh token thành công");
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } else {
      // Xử lý lỗi refresh token
      console.error("Error refreshing token:", data.errors || data.message);
      throw new Error(data.errors?.[0]?.description || "Failed to refresh token");
    }
  } catch (error) {
    console.error("Error during token refresh:", error);
    throw error;
  }
};

export default refreshAccessToken;
