import React, { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ClipLoader } from "react-spinners";

// Skeleton Input
const InputSkeleton = () => (
  <div className="flex flex-col gap-1">
    <div className="h-4 w-24 bg-gray-200 rounded-full animate-pulse mb-1"></div>
    <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
  </div>
);

// Skeleton Content
const ContentSkeleton = () => (
  <>
    <div className="flex flex-col gap-4">
      <InputSkeleton />
      <InputSkeleton />
      <InputSkeleton />
      <InputSkeleton />
    </div>

    <div className="mt-6 flex justify-end gap-3">
      <div className="px-4 py-2 w-20 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
      <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
    </div>
  </>
);

export default function EditBankAccountModal({
  open,
  loading,
  saving,
  formData,
  onChange,
  onClose,
  onSave,
  bankList,
}) {
  const [passwordInput, setPasswordInput] = useState("******");
  const [isPasswordEdited, setIsPasswordEdited] = useState(false);

  useEffect(() => {
    if (open) {
      setPasswordInput("******");
      setIsPasswordEdited(false);
    }
  }, [open]);

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPasswordInput(val);
    setIsPasswordEdited(true);

    onChange({ target: { name: "loginPassword", value: val } });
  };

  const handleSaveClick = () => {
    if (!isPasswordEdited) {
      onChange({ target: { name: "loginPassword", value: null } });
    }
    onSave();
  };

  const isContentReady = !loading;

  return (
    <Transition appear show={open} as={Fragment}>
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
                <Dialog.Title className="text-2xl font-semibold text-center mb-5">
                  Chỉnh sửa tài khoản ngân hàng
                </Dialog.Title>

                {isContentReady ? (
                  <>
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Số tài khoản</label>
                        <input
                          name="accountBankNumber"
                          value={formData.accountBankNumber || ""}
                          onChange={onChange}
                          disabled={saving}
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Chủ tài khoản</label>
                        <input
                          name="accountBankHolderName"
                          value={formData.accountBankHolderName || ""}
                          onChange={onChange}
                          disabled={saving}
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
                        <input
                          name="loginUsername"
                          value={formData.loginUsername || ""}
                          onChange={onChange}
                          disabled={saving}
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Mật khẩu</label>
                        <input
                          type="password"
                          value={passwordInput}
                          disabled={saving}
                          onChange={handlePasswordChange}
                          onFocus={() => {
                            if (!isPasswordEdited) {
                              setIsPasswordEdited(true);
                              setPasswordInput("");
                              onChange({ target: { name: "loginPassword", value: "" } });
                            }
                          }}
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs mt-1 text-gray-500">Nếu không sửa mật khẩu, hệ thống sẽ giữ nguyên.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Ngân hàng</label>
                        <select
                          name="bankId"
                          value={formData.bankId || ""}
                          onChange={onChange}
                          disabled={saving}
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">-- Chọn ngân hàng --</option>
                          {bankList?.map((bank) => (
                            <option key={bank.id} value={bank.id}>
                              {bank.codeBank} - {bank.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                        disabled={saving}
                      >
                        Hủy
                      </button>

                      <button
                        onClick={handleSaveClick}
                        disabled={saving}
                        className={`w-32 py-2 rounded-xl font-semibold transition ${
                          saving
                            ? "bg-primary-darkest opacity-50 cursor-not-allowed"
                            : "bg-primary-dark text-white hover:bg-primary-darkest"
                        }`}
                      >
                        {saving ? (
                          <div className="flex justify-center items-center">
                            <ClipLoader size={18} color="#fff" />
                            <span className="ml-2 text-sm">Đang lưu...</span>
                          </div>
                        ) : (
                          "Cập nhật"
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <ContentSkeleton />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}