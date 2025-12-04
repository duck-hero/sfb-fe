import React, { useEffect, useState } from "react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import { Fragment } from "react";

// Component Spinner CSS nội bộ
const TailwindSpinner = () => (
  <div className="flex justify-center items-center">
    {/* CSS Spinner */}
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
      {/* Chỉ cần 3 skeleton cho 3 trường input chính */}
    </div>

    <div className="mt-6 flex justify-end gap-3">
      <div className="px-4 py-2 w-20 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
      <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
    </div>
  </>
);

export default function EditBmAccountModal({
  open,
  loading,
  saving,
  formData,
  onChange,
  onClose,
  onSave,
  bmSourceList = [],
}) {
  // Loại bỏ state passwordInput và isPasswordEdited do không cần thiết cho API update BM Account
  
  // Logic xử lý khi trạng thái (status) thay đổi
  const handleStatusChange = (enabled) => {
    const newStatus = enabled ? "ACTIVE" : "INACTIVE";
    // Gọi onChange để cập nhật status trong formData của component cha
    onChange({ target: { name: "status", value: newStatus } });
  };

  // Logic xử lý khi click nút Lưu
  const handleSaveClick = () => {
    // Gọi hàm onSave của component cha
    onSave();
  };

  const isContentReady = !loading;
  // Tính toán trạng thái ACTIVE dựa trên formData.status. Mặc định là 'INACTIVE' nếu chưa có status.
  const isStatusActive = formData.status === "ACTIVE"; 
  
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
                  Chỉnh sửa BM Account
                </Dialog.Title>

                {isContentReady ? (
                  <>
                    <div className="flex flex-col gap-4">
                      
                      {/* Input 1: Tên Account (name) - Hiện giá trị mặc định từ formData.name */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Tên Account</label>
                        <input
                          name="name"
                          value={formData.name || ""}
                          onChange={onChange}
                          disabled={saving}
                          placeholder="Nhập tên BM Account..."
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      {/* Input 2: Chọn Nguồn BM (bmSourceId) - Hiện giá trị mặc định từ formData.bmSourceId */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Chọn nguồn BM</label>
                        <select
                          name="bmSourceId"
                          // Giá trị mặc định được lấy từ formData.bmSourceId
                          value={formData.bmSourceId || ""} 
                          onChange={onChange}
                          disabled={saving}
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">-- Chọn nguồn --</option>
                          {bmSourceList.map((source) => (
                            <option key={source.id} value={source.id}>
                              {source.sourceName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Input 3: Status (ACTIVE/INACTIVE) - Hiển thị trạng thái mặc định */}
                      <div className="flex items-center justify-between pt-2 pb-2">
                        <label className="block text-sm font-medium">Trạng thái (Status)</label>
                        <Switch
                          // 'checked' được đặt dựa trên giá trị của formData.status
                          checked={isStatusActive}
                          onChange={handleStatusChange}
                          disabled={saving}
                          className={`${
                            isStatusActive ? 'bg-green-600' : 'bg-red-600'
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600`}
                        >
                          <span
                            className={`${
                              isStatusActive ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                          />
                        </Switch>
                        <span className={`text-sm font-semibold w-20 text-right ${isStatusActive ? 'text-green-600' : 'text-red-600'}`}>
                           {/* Hiển thị giá trị status hiện tại */}
                           {formData.status || 'INACTIVE'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 -mt-2">Trạng thái hiện tại: {formData.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}.</div>

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
                        className={`w-32 py-2 rounded-xl font-semibold transition flex justify-center items-center ${
                          saving
                            ? "bg-primary-darkest opacity-50 cursor-not-allowed"
                            : "bg-primary-dark text-white hover:bg-primary-darkest"
                        }`}
                      >
                        {saving ? (
                          <div className="flex justify-center items-center">
                            <TailwindSpinner /> {/* Sử dụng spinner mới */}
                            <span className="ml-2 text-sm">Đang lưu...</span>
                          </div>
                        ) : (
                          "Cập nhật"
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  // Thay đổi số lượng Skeleton Input để phù hợp với 3 trường input chính
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