import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

// Component hiển thị trường thông tin (Giữ nguyên)
const DetailField = ({ label, value, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {/* Chiều cao h-10 và rounded-lg */}
    <div className="w-full h-10 flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 text-sm text-gray-800 truncate">
      {value || "N/A"}
    </div>
  </div>
);

// --- SKELETON INPUT (ĐÃ ĐIỀU CHỈNH) ---
const InputSkeleton = () => (
  <div className="flex flex-col gap-1">
    {/* Label Skeleton (Giữ nguyên) */}
    <div className="h-4 w-24 bg-gray-200 rounded-full animate-pulse mb-1"></div>
    {/* Input Box Skeleton (Chiều cao h-10 và rounded-lg) */}
    <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
  </div>
);

// --- SKELETON CONTENT (ĐÃ ĐIỀU CHỈNH) ---
const ContentSkeleton = () => (
  <>
    {/* 1. THÔNG TIN CHUNG (Grid 2 cột) */}
    <div className="mb-3">
        <div className="h-5 w-40 bg-gray-300 rounded-full animate-pulse mb-3"></div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {/* ID Thẻ & Tổng lần thêm */}
            <InputSkeleton />
            <InputSkeleton />
            {/* Số thẻ & Tên chủ thẻ */}
            <InputSkeleton />
            <InputSkeleton />
            {/* Ngày phát hành & Ngày hết hạn */}
            <InputSkeleton />
            <InputSkeleton />
            {/* Trạng thái (col-span-2) */}
            <div className="col-span-2">
                <InputSkeleton />
            </div>
        </div>
    </div>
    
    {/* 2. TÀI KHOẢN NGÂN HÀNG */}
    <div className="border-t pt-4 mb-3">
        <div className="h-5 w-56 bg-gray-300 rounded-full animate-pulse mb-3"></div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <InputSkeleton />
            <InputSkeleton />
        </div>
    </div>

    {/* 3. NGƯỜI SỞ HỮU */}
    <div className="border-t pt-4">
        <div className="h-5 w-48 bg-gray-300 rounded-full animate-pulse mb-3"></div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <InputSkeleton />
            <InputSkeleton />
        </div>
    </div>


    {/* FOOTER BUTTONS */}
    <div className="mt-6 flex justify-end">
        <div className="px-4 py-2 w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
  </>
);

export default function DetailBankCardModal({
// ... (Phần props giữ nguyên)
  open,
  loading,
  cardData, 
  onClose,
}) {
  const isContentReady = !loading;
console.log(cardData)
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
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                <Dialog.Title className="text-xl font-semibold text-center mb-5 border-b pb-3">
                  Chi tiết thẻ ngân hàng
                </Dialog.Title>

                {isContentReady ? (
                  <>
                    <div className="flex flex-col gap-5">
                      
                      {/* --- 1. THÔNG TIN CHUNG VỀ THẺ --- */}
                      <section>
                        <h3 className="text-base font-semibold text-gray-800 mb-3">
                            Thông tin chung
                        </h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            {/* ID Thẻ */}
                            <DetailField
                                label="ID Thẻ"
                                value={cardData?.id}
                            />
                            {/* Tổng lần thêm */}
                            <DetailField
                                label="Tổng lần thêm"
                                value={cardData?.addTotal}
                            />

                            {/* Số thẻ (Đầy đủ/4 số cuối) */}
                            <DetailField
                                label="Số thẻ"
                                value={cardData?.cardNumber || cardData?.cardLastDigits}
                            />
                            {/* Tên chủ thẻ */}
                            <DetailField
                                label="Tên chủ thẻ"
                                value={cardData?.cardHolderName}
                            />

                            {/* Ngày phát hành */}
                            <DetailField
                                label="Ngày phát hành"
                                value={cardData?.issuedDate?.split("T")[0] || "N/A"}
                            />
                            {/* Ngày hết hạn */}
                            <DetailField
                                label="Ngày hết hạn"
                                value={cardData?.expirationDate?.split("T")[0] || "N/A"}
                            />

                            {/* Trạng thái - Dùng 2 cột (col-span-2) */}
                            <DetailField
                                label="Trạng thái"
                                value={cardData?.status}
                                className="col-span-2"
                            />
                        </div>
                      </section>

                      {/* --- 2. THÔNG TIN TÀI KHOẢN NGÂN HÀNG --- */}
                      <section className="border-t pt-4">
                        <h3 className="text-base font-semibold text-gray-800 mb-3">
                          Thông tin Tài khoản Ngân hàng
                        </h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            {/* Tên Ngân hàng */}
                            <DetailField
                                label="Tên Ngân hàng"
                                value={cardData?.bankName}
                            />
                            {/* Số tài khoản */}
                            <DetailField
                                label="Số tài khoản"
                                value={cardData?.bankAccountNumber}
                            />
                        </div>
                      </section>
                      

                      {/* --- 3. THÔNG TIN NGƯỜI SỞ HỮU --- */}
                      <section className="border-t pt-4">
                        <h3 className="text-base font-semibold text-gray-800 mb-3">
                          Thông tin người phụ trách
                        </h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            {/* Người sở hữu (Tên) */}
                            <DetailField
                                label="Người sở hữu (Tên)"
                                value={cardData?.assignedUserName}
                            />
                            {/* Người sở hữu (Email) */}
                            <DetailField
                                label="Người sở hữu (Email)"
                                value={cardData?.assignedUserEmail}
                            />
                        </div>
                      </section>
                    </div>

                    {/* --- FOOTER BUTTONS --- */}
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                      >
                        Đóng
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