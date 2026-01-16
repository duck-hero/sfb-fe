// import React from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import { Fragment } from "react";
import { getBmWorkingOptions } from "../../utils/bmConstants";

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
      <InputSkeleton /> {/* Thêm skeleton cho BM Working */}
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

  // Logic xử lý trạng thái
  const handleStatusChange = (e) => {
    onChange(e);
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
                          BM Gốc
                        </label>
                        <select
                          name="bmAccountId" // Map API: bmAccountId
                          value={formData.bmAccountId || ""}
                          onChange={onChange}
                          disabled={saving}
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">-- BM Gốc --</option>
                          {bmList.map((bm) => (
                            <option key={bm.id} value={bm.id}>
                              {bm.name || bm.bmId || `BM #${bm.id}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Input 4: BM Working (bmWorking) */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          BM Cầm
                        </label>
                        <select
                          name="bmWorking" // Map API: bmWorking
                          value={formData.bmWorking || ""}
                          onChange={onChange}
                          disabled={saving}
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">-- BM Cầm --</option>
                          {getBmWorkingOptions().map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Select: Account Status */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Trạng thái tài khoản
                        </label>
                        <select
                          name="status"
                          value={formData.status || "LIVE"}
                          onChange={handleStatusChange}
                          disabled={saving}
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="LIVE">LIVE</option>
                          <option value="HOLD">HOLD</option>
                          <option value="BACK">BACK</option>
                          <option value="DIE">DIE</option>
                          <option value="UNPAID">UNPAID</option>
                        </select>
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
                        className={`w-32 py-2 rounded-xl font-semibold transition flex justify-center items-center ${saving
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
