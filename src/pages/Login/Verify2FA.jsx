import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import accountApi from "../../api/accountApi";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { encryptToken } from "../../api/cryptoService";
import { ClipLoader } from "react-spinners";

export default function Verify2FA() {
  const navigate = useNavigate();
  const [code, setCode] = useState(""); // ✅ Chỉ 1 input
  const [loading, setLoading] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  const userId = localStorage.getItem("twoFactorUserId");
  const { login } = useAuth();

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, []);

  const handleCodeChange = (value) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 6);
    setCode(sanitized);
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 số.");
      return;
    }

    try {
      setLoading(true);
      const res = await accountApi.verify2FACode({
        code,
        userId,
        rememberDevice,
      });

      if (res.success) {
        const data = res.data;
        data.requires2FA = false;

        const encryptedAccessToken = encryptToken
          ? encryptToken(data.jwToken)
          : data.jwToken;
        const encryptedRefreshToken = encryptToken
          ? encryptToken(data.refreshToken)
          : data.refreshToken;

        localStorage.setItem("accessToken", encryptedAccessToken);
        localStorage.setItem("refreshToken", encryptedRefreshToken);
        localStorage.removeItem("twoFactorUserId");

        toast.success("Xác thực thành công!");
        login(data);
        navigate("/");
      } else {
        const message = res.errors?.[0]?.description || "Mã xác thực không chính xác.";
        toast.error(message);
      }
    } catch (error) {
      console.log("❌ Lỗi khi gọi API:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-lightest p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-center mb-2">Xác thực 2 bước (2FA)</h2>
        <p className="text-sm text-gray-600 text-center mb-4">
          Nhập mã xác minh từ ứng dụng xác thực của bạn
        </p>

        {/* Input mã 6 số */}
        <div className="mt-2 flex justify-center">
          <input
            type="text"
            maxLength={6}
            className="w-48 h-14 border border-gray-300 rounded-lg text-center text-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="mt-4 bg-yellow-100 text-yellow-700 text-xs p-3 rounded text-center">
          Vì lý do bảo mật, việc xác thực 2FA là bắt buộc trước khi tiếp tục.
        </div>

        {/* Button Xác nhận đồng bộ với Login */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className={`w-full mt-5 py-3 rounded-xl font-semibold transition ${
            loading
              ? "bg-primary-darkest opacity-50 cursor-not-allowed"
              : "bg-primary-dark text-white hover:bg-primary-darkest"
          }`}
        >
          {loading ? (
            <div className="flex justify-center items-center">
              <ClipLoader size={20} color="#fff" />
              <span className="ml-2">Đang xác thực...</span>
            </div>
          ) : (
            "Xác nhận"
          )}
        </button>

        {/* Button Hủy */}
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
