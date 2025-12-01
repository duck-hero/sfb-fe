import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ClipLoader } from "react-spinners";

export default function Disable2FAModal({ isOpen, onClose, onSubmit, loading = false }) {
  const [password, setPassword] = useState("");

  // Reset password khi modal mở/đóng
  useEffect(() => {
    if (isOpen) {
      setPassword("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onSubmit(password);
    // Không reset password tại đây vì modal sẽ reset khi đóng
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
              <Dialog.Title className="text-lg font-semibold mb-3">
                Tắt phương thức xác thực 2 yếu tố (2FA)
              </Dialog.Title>

              <p className="text-sm text-gray-600 mb-4">
               Vui lòng nhập mật khẩu của bạn để tắt 2FA.
              </p>

              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading} // disable input khi loading
              />

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg transition ${
                    loading
                      ? "bg-gray-200 opacity-50 cursor-not-allowed"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Hủy
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-semibold text-white transition ${
                    loading
                      ? "bg-red-600 opacity-50 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <ClipLoader size={18} color="#fff" />
                      <span>Đang xác nhận...</span>
                    </div>
                  ) : (
                    "Xác nhận"
                  )}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
