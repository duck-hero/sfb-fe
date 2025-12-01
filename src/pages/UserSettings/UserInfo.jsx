// UserInfo.jsx
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import accountApi from "../../api/accountApi";
import Loading from "../../components/Loading/Loading";
import { ToastContainer, toast } from "react-toastify";
import TwoFAModal from "./TwoFAModal";
import Disable2FAModal from "./Disable2FAModal";
import { useAuth } from "../../context/AuthContext";
import Switch from "@mui/material/Switch";

function UserInfo() {
  // ---------- HOOKS ----------
  const [userData, setUserData] = useState(null);
  const [twoFAStatus, setTwoFAStatus] = useState(null);
  const [open2FAModal, setOpen2FAModal] = useState(false);
  const [openDisableModal, setOpenDisableModal] = useState(false);

  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const { user, logout } = useAuth();
  const navigate = useNavigate();
 const [loading2FA, setLoading2FA] = useState(false);       // loading cho bật 2FA
const [loadingDisable2FA, setLoadingDisable2FA] = useState(false); // loading cho tắt 2FA



  // ---------- FETCH USER & 2FA STATUS ----------
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const user = await accountApi.getUser();
        setUserData(user);

        const res2FA = await accountApi.get2FAStatus();
        setTwoFAStatus(res2FA);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Vui lòng đăng nhập lại!");
        navigate("/login");
      }
    };

    fetchInit();
  }, [navigate]);

  // ---------- HANDLER KÍCH HOẠT 2FA ----------
const handleEnable2FA = async (code) => {
  try {
    if (code.length !== 6) {
      toast.error("Mã 2FA phải đủ 6 số!");
      return;
    }

    setLoading2FA(true); // bật loading
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
  } finally {
    setLoading2FA(false); // tắt loading
  }
};



  // ---------- OPEN 2FA MODAL ----------
  const handleOpen2FAModal = async () => {
    try {
      const res = await accountApi.enable2FA();
      const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        res.qrCodeUri ?? res.otpauth
      )}`;
      setQrCodeUrl(qrImage);
      setSecretKey(res.sharedKey ?? res.shared_key ?? "");

      setOpen2FAModal(true);
    } catch (error) {
      console.error(error);
      toast.error("Không thể bật 2FA.");
    }
  };

  // ---------- DISABLE 2FA ----------
const handleDisable2FA = async (password) => {
  try {
    setLoadingDisable2FA(true); // bật loading
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
    setLoadingDisable2FA(false); // tắt loading
    setOpenDisableModal(false);
  }
};


  // ---------- LOADING STATE ----------
  if (!userData || !twoFAStatus) {
    return <Loading />;
  }

  return (
    <>
      <Navbar hasSidebar={false} />

      <div className="container mx-auto px-4 pt-20 pb-10 max-w-5xl">
        <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PROFILE CARD */}
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

          {/* SETTINGS */}
          <div className="md:col-span-2 space-y-6">
            {/* Sign-in & Security */}
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
                    if (twoFAStatus.is2FAEnabled) {
                      setOpenDisableModal(true);
                    } else {
                      handleOpen2FAModal();
                    }
                  }}
                  color="success"
                />
              </div>
            </div>

            {/* Social Sign In */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Social Sign In</h3>
              <p className="text-gray-500 text-sm">
                (Social identity providers will appear here)
              </p>
            </div>

            {/* Trusted Devices */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Trusted Devices</h3>
              <p className="text-gray-500 text-sm">Devices that have accessed your account.</p>
            </div>
          </div>
        </div>

        <ToastContainer position="top-center" theme="colored" autoClose={250} />
      </div>

      {/* TWO-FA MODAL */}
<TwoFAModal
key={open2FAModal ? "open" : "close"}
  isOpen={open2FAModal}
  onClose={() => setOpen2FAModal(false)}
  qrCodeUrl={qrCodeUrl}
  secretKey={secretKey}
  onActivate={handleEnable2FA}
  loading={loading2FA} // ✅ truyền loading
/>


      {/* DISABLE 2FA MODAL */}
      <Disable2FAModal
        isOpen={openDisableModal}
        onClose={() => setOpenDisableModal(false)}
        onSubmit={handleDisable2FA}
         loading={loadingDisable2FA}
         key={open2FAModal ? "open" : "close"}
      />
    </>
  );
}

export default UserInfo;
