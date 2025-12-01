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

function UserInfo() {
  // ---------- STATES ----------
  const [userData, setUserData] = useState(null);
  const [twoFAStatus, setTwoFAStatus] = useState(null);

  const [open2FAModal, setOpen2FAModal] = useState(false);
  const [openDisableModal, setOpenDisableModal] = useState(false);

  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const [loading2FA, setLoading2FA] = useState(false);
  const [loadingDisable2FA, setLoadingDisable2FA] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  // Toggle state (UI)
  const [toggleState, setToggleState] = useState(false);

  // Lưu trạng thái cũ để khôi phục nếu user cancel modal hoặc khi thao tác thất bại
  const [pendingToggle, setPendingToggle] = useState(null);

  // ---------- FETCH USER ----------
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const user = await accountApi.getUser();
        setUserData(user);

        const res2FA = await accountApi.get2FAStatus();
        setTwoFAStatus(res2FA);
      } catch (error) {
        toast.error("Vui lòng đăng nhập lại!");
        navigate("/login");
      }
    };

    fetchInit();
  }, [navigate]);

  // Đồng bộ toggle ban đầu
  useEffect(() => {
    if (twoFAStatus) {
      setToggleState(!!twoFAStatus.is2FAEnabled);
    }
  }, [twoFAStatus]);

  // ---------- BẬT 2FA (Verify mã OTP) ----------
const handleEnable2FA = async (code) => {
  try {
    if (!code || code.length !== 6) {
      toast.error("Mã 2FA phải đủ 6 số!");
      return;
    }

    setLoading2FA(true);

    const res = await accountApi.Verify2FASetup(code);

    if (res.success) {
      toast.success("Kích hoạt 2FA thành công! Đang đăng xuất...");
      setOpen2FAModal(false);
      setPendingToggle(null);

      setTimeout(() => {
        logout();
        navigate("/login", { replace: true });
      }, 600);
    } else {
      toast.error(res.message || "Mã xác thực không đúng!");

      // Option B → đóng modal & revert toggle
      setOpen2FAModal(false);
      setToggleState(pendingToggle);
      setPendingToggle(null);
    }
  } catch (err) {
    console.error(err);
    toast.error("Kích hoạt 2FA thất bại!");

    // Option B → đóng modal & revert toggle
    setOpen2FAModal(false);
    setToggleState(pendingToggle);
    setPendingToggle(null);
  } finally {
    setLoading2FA(false);
  }
};


  // ---------- TẮT 2FA (Verify password) ----------
const handleDisable2FA = async (password) => {
  try {
    if (!password || password.length < 6) {
      toast.error("Vui lòng nhập mật khẩu hợp lệ!");
      return;
    }

    setLoadingDisable2FA(true);

    const res = await accountApi.Disable2FA(password);

    if (res.success) {
      toast.success("Đã tắt 2FA. Đang đăng xuất...");
      setOpenDisableModal(false);
      setPendingToggle(null);

      setTimeout(() => {
        logout();
        navigate("/login", { replace: true });
      }, 600);
    } else {
      toast.error(res.message || "Password không chính xác!");

      // Option B → đóng modal & revert toggle
      setOpenDisableModal(false);
      setToggleState(pendingToggle);
      setPendingToggle(null);
    }
  } catch (err) {
    console.error(err);
    toast.error("Tắt 2FA thất bại!");

    // Option B → đóng modal & revert toggle
    setOpenDisableModal(false);
    setToggleState(pendingToggle);
    setPendingToggle(null);
  } finally {
    setLoadingDisable2FA(false);
  }
};


  // ---------- MỞ MODAL & TẠO QR ----------
const handleOpen2FAModal = async () => {
  try {
    const res = await accountApi.enable2FA();
    const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      res.qrCodeUri ?? res.otpauth ?? ""
    )}`;

    setQrCodeUrl(qrImage);
    setSecretKey(res.sharedKey ?? res.shared_key ?? "");
    setOpen2FAModal(true);

  } catch (error) {
    console.error(error);
    toast.error("Không thể bật 2FA.");

    // Option B → revert toggle & CLEAN state
    setToggleState(pendingToggle);
    setPendingToggle(null);
  }
};


  // ---------- HANDLE TOGGLE (UI phản hồi ngay, mở modal) ----------
  const handleToggle = () => {
    const nextState = !toggleState;

    // Trượt ngay lập tức cho phản hồi UX
    setToggleState(nextState);

    // Lưu trạng thái cũ để revert nếu cancel / thất bại
    setPendingToggle(toggleState);

    // Nếu đang bật và user muốn tắt -> mở modal tắt
    if (toggleState) {
      setOpenDisableModal(true);
    } else {
      // Nếu đang tắt và user muốn bật -> chuẩn bị QR và mở modal
      handleOpen2FAModal();
    }
  };

  // ---------- LOADING ----------
  if (!userData || twoFAStatus === null) {
    return <Loading />;
  }

  // ---------- TOGGLE COMPONENT ----------
  const Toggle = ({ enabled, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
        enabled ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <div className="bg-primary-lightest min-h-screen">
      <Navbar hasSidebar={false} />

      <div className="container mx-auto px-4 pt-20 pb-10 max-w-6xl">
        <h2 className="text-2xl font-semibold mb-8">Cài đặt và quyền riêng tư</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PROFILE */}
          <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-5xl">👤</span>
            </div>

            <h3 className="mt-4 text-lg font-semibold">{userData.userName}</h3>
            <p className="text-gray-500">{userData.name}</p>

            <button
              onClick={() => navigate("edit")}
              className="mt-4 px-5 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-medium"
            >
              Chỉnh sửa
            </button>
          </div>

          {/* SETTINGS */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white shadow-xl rounded-2xl p-6 space-y-4">
              <h3 className="text-xl font-semibold mb-2">Thông tin</h3>

              <div className="flex flex-col">
                <span className="text-gray-700">Tài khoản</span>
                <span className="font-medium">{userData.userName}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-700">Tên người dùng</span>
                <span className="font-medium">{userData.name}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-700">Email</span>
                <span className="font-medium">{userData.email}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-700">Số điện thoại</span>
                <span className="font-medium">{userData.phoneNumber}</span>
              </div>
                            <div className="flex flex-col">
                <span className="text-gray-700">Mật khẩu</span>
               <div className="flex justify-between items-center"> <p className="font-bold">●●●●●●●●●●●●</p>  <button className="text-primary-darkest hover:underline font-medium">Đổi mật khẩu</button></div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <p className="font-bold">Xác thực 2 bước</p>
                <Toggle enabled={toggleState} onToggle={handleToggle} />
              </div>
            </div>

            <div className="bg-white shadow-xl rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2">Thiết bị đáng tin cậy</h3>
              <p className="text-gray-500 text-sm">Danh sách thiết bị đăng nhập đã tin cậy.</p>
            </div>
          </div>
        </div>

        <ToastContainer position="top-center" theme="colored" autoClose={250} />
      </div>

      {/* MODAL BẬT 2FA */}
      <TwoFAModal
        key={open2FAModal ? "open" : "close"}
        isOpen={open2FAModal}
        onClose={() => {
          // User HỦY modal -> restore toggle và clear pending
          setOpen2FAModal(false);
          if (pendingToggle !== null) setToggleState(pendingToggle);
          setPendingToggle(null);
        }}
        qrCodeUrl={qrCodeUrl}
        secretKey={secretKey}
        onActivate={handleEnable2FA}
        loading={loading2FA}
      />

      {/* MODAL TẮT 2FA */}
      <Disable2FAModal
        key={openDisableModal ? "open" : "close"}
        isOpen={openDisableModal}
        onClose={() => {
          // User HỦY modal -> restore toggle và clear pending
          setOpenDisableModal(false);
          if (pendingToggle !== null) setToggleState(pendingToggle);
          setPendingToggle(null);
        }}
        onSubmit={handleDisable2FA}
        loading={loadingDisable2FA}
      />
    </div>
  );
}

export default UserInfo;
