// TwoFAModal.jsx
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { ClipLoader } from "react-spinners";

export default function TwoFAModal({
  isOpen,
  onClose,
  qrCodeUrl,
  secretKey,
  onActivate,
  loading = false,
}) {
  const [code, setCode] = useState("");

  const handleCodeChange = (value) => {
    // chỉ cho nhập số, max 6 ký tự
    const sanitized = value.replace(/\D/g, "").slice(0, 6);
    setCode(sanitized);
  };

  const handleActivate = () => {
    onActivate(code);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left shadow-xl transition-all">
                <Dialog.Title className="text-2xl font-semibold text-center mb-4">
                  Xác thực 2 bước (2FA)
                </Dialog.Title>

                <div className="flex flex-col items-center">
                  {/* QR Code */}
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-36 h-36" />
                  ) : (
                    <div className="w-36 h-36 bg-gray-100 flex items-center justify-center text-gray-400">
                      No QR
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mt-3 text-center">
                    Quét mã QR bằng bất kỳ ứng dụng xác thực nào (ví dụ
                    <span className="text-blue-600"> Google Authenticator</span>, Duo Mobile, Mật Khẩu) hoặc nhập mã bên dưới:
                  </p>

                  <div className="mt-2 p-2 bg-gray-100 rounded text-center text-sm font-mono break-all w-full">
                    {secretKey || "—"}
                  </div>

                  <p className="mt-4 text-sm text-gray-700 text-center">
                    Nhập mã xác nhận gồm 6 chữ số hiển thị trên ứng dụng:
                  </p>

                  {/* ✅ 1 ô input duy nhất */}
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

                  {/* Cảnh báo bảo mật */}
                  <div className="mt-4 bg-yellow-100 text-yellow-700 text-xs p-3 rounded w-full text-center">
                    Bạn sẽ bị đăng xuất khỏi mọi thiết bị và trình duyệt bạn sử dụng gần đây vì lý do bảo mật.
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    disabled={loading}
                  >
                    Hủy
                  </button>

<button
  onClick={handleActivate}
  disabled={loading}
  className={`w-full py-3 rounded-xl font-semibold transition ${
    loading
      ? "bg-primary-darkest opacity-50 cursor-not-allowed"
      : "bg-primary-dark text-white hover:bg-primary-darkest"
  }`}
>
  {loading ? (
    <div className="flex justify-center items-center">
      <ClipLoader size={20} color="#fff" />
      <span className="ml-2">Đang xác nhận...</span>
    </div>
  ) : (
    "Xác nhận"
  )}
</button>

                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
