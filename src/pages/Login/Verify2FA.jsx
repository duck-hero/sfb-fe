import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import accountApi from "../../api/accountApi";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { encryptToken } from "../../api/cryptoService";


export default function Verify2FA() {
  const navigate = useNavigate();
  const [codeInputs, setCodeInputs] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false); // ✅ Thêm state cho checkbox

  const userId = localStorage.getItem("twoFactorUserId");
      const { login } = useAuth();

//   useEffect(() => {
//     if (!userId) navigate("/login");
//   }, [userId]);

useEffect(() => {
  const twoFactorUserId = localStorage.getItem("twoFactorUserId");
  if (!twoFactorUserId) {
    navigate("/login");
  }
}, []); // chạy 1 lần khi mount


  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;

    const newInputs = [...codeInputs];
    newInputs[index] = value.replace(/\D/g, ""); // chỉ cho số
    setCodeInputs(newInputs);

    // Tự động chuyển sang ô kế tiếp
    if (value && index < 5) {
      const next = document.getElementById(`digit-${index + 1}`);
      next?.focus();
    }
  };

const handleVerify = async () => {
  const code = codeInputs.join("");

  if (code.length !== 6) {
    toast.error("Vui lòng nhập đủ 6 số.");
    return;
  }

  try {
    setLoading(true);

    // Gửi dữ liệu
    const res = await accountApi.verify2FACode({
      code,
      userId,
      rememberDevice,
    });
    // Kiểm tra success
    if (res.success) {
  const data = res.data;

  // ÉP requires2FA về false
  data.requires2FA = false;

  const encryptedAccessToken = encryptToken ? encryptToken(data.jwToken) : data.jwToken;
  const encryptedRefreshToken = encryptToken ? encryptToken(data.refreshToken) : data.refreshToken;

  localStorage.setItem("accessToken", encryptedAccessToken);
  localStorage.setItem("refreshToken", encryptedRefreshToken);

  localStorage.removeItem("twoFactorUserId");

  toast.success("Xác thực thành công!");

  login(data);   // <- Login dùng data đã sửa
  navigate("/");
}
 else {
      // Hiện lỗi từ API
      const message = res.errors?.[0]?.description || "Mã xác thực không chính xác.";
      toast.error(message);
    }
  } catch (error) {
  console.log("❌ Lỗi khi gọi API:", error.response?.data || error);

  // Chỉ throw nếu STATUS thật sự là lỗi
  if (error.response && error.response.status !== 200) {
    throw error.response.data;
  }

  // Nếu status 200 nhưng axios báo lỗi → coi như thành công
  return error.response?.data;
}
 finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-6">
        <h2 className="text-xl font-semibold text-center mb-2">Two-Factor Authentication</h2>
        <p className="text-sm text-gray-600 text-center mb-4">
          Nhập mã 6 số từ ứng dụng Google Authenticator để tiếp tục.
        </p>

        <div className="mt-2 flex justify-center gap-2">
          {codeInputs.map((value, index) => (
            <input
              key={index}
              id={`digit-${index}`}
              maxLength="1"
              className="w-12 h-14 border rounded text-center text-xl font-semibold focus:ring-2 focus:ring-blue-500"
              value={value}
              onChange={(e) => handleCodeChange(index, e.target.value)}
            />
          ))}
        </div>

        {/* ✅ Checkbox ghi nhớ thiết bị */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberDevice"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="rememberDevice" className="text-sm text-gray-700">
            Ghi nhớ thiết bị này
          </label>
        </div>

        <div className="mt-4 bg-yellow-100 text-yellow-700 text-xs p-3 rounded text-center">
          Vì lý do bảo mật, việc xác thực 2FA là bắt buộc trước khi tiếp tục.
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className={`w-full mt-5 py-3 rounded-lg text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Đang xác thực..." : "Xác nhận"}
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-3 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300"
        >
          Hủy
        </button>
      </div>

      <ToastContainer />
    </div>
  );
}
