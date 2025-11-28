// UserInfo.jsx
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import accountApi from "../../api/accountApi";
import Loading from "../../components/Loading/Loading";
import { ToastContainer, toast } from "react-toastify";
import TwoFAModal from "./TwoFAModal";
import Switch from "@mui/material/Switch";
import Disable2FAModal from "./Disable2FAModal";
import { useAuth } from "../../context/AuthContext";

function UserInfo() {
  // ---------- ALL HOOKS AT TOP (KHÔNG ĐƯỢC DI CHUYỂN) ----------
  const [userData, setUserData] = useState(null);
  const [twoFAStatus, setTwoFAStatus] = useState(null);
  const [open2FAModal, setOpen2FAModal] = useState(false);
const [openDisableModal, setOpenDisableModal] = useState(false);
  const { user, logout } = useAuth();

  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");

  // 6 ô nhập mã 2FA
  const [codeInputs, setCodeInputs] = useState(["", "", "", "", "", ""]);

  const navigate = useNavigate();

  // -------------------------------------------------------------
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const user = await accountApi.getUser();
        setUserData(user);

        const res2FA = await accountApi.get2FAStatus();
        // server có thể trả về object { is2FAEnabled: true/false, ... }
        setTwoFAStatus(res2FA);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Vui lòng đăng nhập lại!");
        navigate("/login");
      }
    };

    fetchInit();
  }, [navigate]);

  // handle change 1 ký tự input
  const handleCodeChange = (index, value) => {
    // chỉ lấy chữ số nếu muốn: value = value.replace(/\D/g, "");
    const newInputs = [...codeInputs];
    newInputs[index] = value.slice(-1); // giữ 1 ký tự
    setCodeInputs(newInputs);

    // tự focus ô tiếp theo có thể thêm sau nếu muốn
  };

  const handleEnable2FA = async () => {
  try {
    const code = codeInputs.join("");

    if (code.length !== 6) {
      toast.error("Mã 2FA phải đủ 6 số!");
      return;
    }
console.log(code);
    const res = await accountApi.Verify2FASetup(code);

    if (res.success) {
      toast.success("Kích hoạt 2FA thành công! Đang đăng xuất...");

      setTimeout(() => {
            logout();
        navigate("/login", { replace: true });
      }, 600);
    } else {
      toast.error(res.message || "Mã xác thực không đúng!");
    }
  } catch (err) {
    console.error(err);
    toast.error("Kích hoạt 2FA thất bại!");
  }
};


  const handleOpen2FAModal = async () => {
    try {
      // gọi backend để tạo sharedKey / qrCodeUri (nếu backend trả cả hai)
      const res = await accountApi.enable2FA();

      // Backend trả qrCodeUri dạng otpauth://... hoặc res.qrCodeUri, res.sharedKey
      const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        res.qrCodeUri ?? res.otpauth
      )}`;

      setQrCodeUrl(qrImage);
      setSecretKey(res.sharedKey ?? res.shared_key ?? "");

      // reset input mã khi mở modal
      setCodeInputs(["", "", "", "", "", ""]);

      setOpen2FAModal(true);
    } catch (error) {
      console.error(error);
      toast.error("Không thể bật 2FA.");
    }
  };

  const handleDisable2FA = async (password) => {
  try {
    const res = await accountApi.Disable2FA(password);

    if (res.success) {
      toast.success("Đã tắt xác thực 2FA. Đang đăng xuất...");

      setTimeout(() => {
         logout();
        navigate("/login", { replace: true });
      }, 600);
    } else {
      toast.error(res.message || "Password không chính xác!");
    }
  } catch (err) {
    console.error(err);
    toast.error(err.description || "Tắt 2FA thất bại!");
  } finally {
    setOpenDisableModal(false);
  }
};


  // Nếu chưa load dữ liệu, vẫn return Loading (nhưng hooks đã được khai báo ở trên)
  if (!userData || !twoFAStatus) {
    return <Loading />;
  }

  return (
    <>
      <Navbar hasSidebar={false} />

      <div className="container mx-auto px-4 pt-20 pb-10 max-w-5xl">
        <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 text-4xl">👤</span>
            </div>

            <h3 className="mt-4 text-lg font-semibold">{userData.userName}</h3>
            <p className="text-gray-500">{userData.name}</p>

            <button
              onClick={() => navigate("edit")}
              className="mt-4 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
            >
              Edit Personal Info
            </button>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Sign-in & Security</h3>

              <div className="flex justify-between py-2 border-b">
                <span>Username</span>
                <span className="font-medium">{userData.userName}</span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span>Password</span>
                <button className="text-blue-600 hover:underline">Reset</button>
              </div>

              <div className="flex justify-between items-center py-2">
                <span>2-Step Verification</span>

                <Switch
                  checked={!!twoFAStatus.is2FAEnabled}
                  onClick={(e) => {
                    e.preventDefault();
                    // nếu đã bật: có thể dẫn tới trang quản lý 2FA, nếu chưa bật: mở modal
                  if (twoFAStatus.is2FAEnabled) {
  // Đang bật → hỏi password để tắt
  setOpenDisableModal(true);
} else {
  // Chưa bật → mở modal kích hoạt
  handleOpen2FAModal();
}

                  }}
                  color="success"
                />
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Social Sign In</h3>
              <p className="text-gray-500 text-sm">
                (Social identity providers will appear here)
              </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Trusted Devices</h3>
              <p className="text-gray-500 text-sm">Devices that have accessed your account.</p>
            </div>
          </div>
        </div>

        <ToastContainer position="top-center" theme="colored" autoClose={250} />
      </div>

      <TwoFAModal
        isOpen={open2FAModal}
        onClose={() => setOpen2FAModal(false)}
        qrCodeUrl={qrCodeUrl}
        secretKey={secretKey}
        codeInputs={codeInputs}
        onCodeChange={handleCodeChange}
        onActivate={handleEnable2FA}
      />
      <Disable2FAModal
  isOpen={openDisableModal}
  onClose={() => setOpenDisableModal(false)}
  onSubmit={handleDisable2FA}
/>

    </>
  );
}

export default UserInfo;
