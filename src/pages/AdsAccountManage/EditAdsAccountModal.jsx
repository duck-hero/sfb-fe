import React from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import { Fragment } from "react";

// Component Spinner CSS nội bộ
const TailwindSpinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-white border-r-white border-b-white border-l-blue-200"></div>
  </div>
);

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
      {/* Skeleton cho Switch */}
      <div className="flex justify-between items-center mt-2">
        <div className="h-4 w-32 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>

    <div className="mt-6 flex justify-end gap-3">
      <div className="px-4 py-2 w-20 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
      <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
    </div>
  </>
);

export default function EditAdsAccountModal({
  open,
  loading,
  saving,
  formData,
  onChange,
  onClose,
  onSave,
  bmList = [], // Danh sách BM để chọn
}) {
  // Logic xử lý khi click nút Lưu
  const handleSaveClick = () => {
    onSave();
  };

  const isContentReady = !loading;

  // --- LOGIC XỬ LÝ TRẠNG THÁI LOCKED ---
  // API: locked = true (Đã khóa), locked = false (Hoạt động)
  // UI Switch: Bật (True) = Hoạt động, Tắt (False) = Khóa
  // => Giá trị Switch ngược với giá trị locked
  const isAccountActive = formData.locked === false;

  const handleStatusChange = (isActive) => {
    // Nếu Switch BẬT (isActive = true) -> locked = false
    // Nếu Switch TẮT (isActive = false) -> locked = true
    onChange({ target: { name: "locked", value: !isActive } });
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
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

        {/* Modal Container */}
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
                {/* Title */}
                <Dialog.Title className="text-2xl font-semibold text-center mb-5">
                  Cập nhật Ads Account
                </Dialog.Title>

                {isContentReady ? (
                  <>
                    <div className="flex flex-col gap-4">
                      {/* Input 1: Tên Ads Account (adsAccountName) */}
                      {/* Input 1: Tên Ads Account */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tên tài khoản
                        </label>
                        <input
                          type="text"
                          name="adAccountName" // Check kỹ dòng này
                          value={formData.adAccountName || ""}
                          onChange={onChange}
                          disabled={saving}
                          placeholder="Nhập tên tài khoản..."
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      {/* Input 2: ID Ads Account */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          ID tài khoản FB
                        </label>
                        <input
                          type="text"
                          name="adAccountIdNumber" // Check kỹ dòng này
                          value={formData.adAccountIdNumber || ""}
                          onChange={onChange}
                          disabled={saving}
                          placeholder="Nhập ID tài khoản..."
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      {/* Input 3: BM Account (bmAccountId) */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Chọn nguồn BM
                        </label>
                        <select
                          name="bmAccountId" // Map API: bmAccountId
                          value={formData.bmAccountId || ""}
                          onChange={onChange}
                          disabled={saving}
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">-- Chọn BM --</option>
                          {bmList.map((bm) => (
                            <option key={bm.id} value={bm.id}>
                              {bm.name || bm.bmId || `BM #${bm.id}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Switch: Locked Status */}
                      <div className="flex items-center justify-between pt-2 pb-2">
                        <label className="block text-sm font-medium">
                          Trạng thái hoạt động
                        </label>
                        <Switch
                          checked={isAccountActive}
                          onChange={handleStatusChange}
                          disabled={saving}
                          className={`${
                            isAccountActive ? "bg-green-600" : "bg-red-600"
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600`}
                        >
                          <span
                            className={`${
                              isAccountActive
                                ? "translate-x-6"
                                : "translate-x-1"
                            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                          />
                        </Switch>

                        <span
                          className={`text-sm font-semibold w-24 text-right ${
                            isAccountActive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isAccountActive ? "Hoạt động" : "Đã khóa"}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 -mt-2 text-right">
                        {isAccountActive
                          ? "Tài khoản đang hoạt động bình thường."
                          : "Tài khoản đang bị khóa/vô hiệu hóa."}
                      </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="mt-8 flex justify-end gap-3">
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
                        className={`w-32 py-2 rounded-xl font-semibold transition flex justify-center items-center ${
                          saving
                            ? "bg-primary-darkest opacity-50 cursor-not-allowed"
                            : "bg-primary-dark text-white hover:bg-primary-darkest"
                        }`}
                      >
                        {saving ? (
                          <div className="flex justify-center items-center">
                            <TailwindSpinner />
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
