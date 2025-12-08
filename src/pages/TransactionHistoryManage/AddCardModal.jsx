import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ClipLoader } from "react-spinners";

export default function AddCardModal({
  open,
  onClose,
  onSave,
  saving,
  transactionData,
}) {
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
                  Thêm thẻ vào tài khoản quảng cáo
                </Dialog.Title>

                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Bạn đang thêm thẻ cho Tài khoản quảng cáo:
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Tài khoản quảng cáo:</span>
                        <span className="text-gray-900">{transactionData?.fbAccountId || "N/A"}</span>
                      </div>
                      
                      {/* <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Tài khoản ngân hàng:</span>
                        <span className="text-gray-900">{transactionData?.bankAccountId || "N/A"}</span>
                      </div> */}
                      
                      {transactionData?.cardLastDigits && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Số thẻ cuối:</span>
                          <span className="text-gray-900">****{transactionData.cardLastDigits}</span>
                        </div>
                      )}

                      {/* {transactionData?.amount && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Số tiền:</span>
                          <span className="text-gray-900 font-semibold">
                            {new Intl.NumberFormat('vi-VN').format(transactionData.amount)} VNĐ
                          </span>
                        </div>
                      )} */}
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 text-center">
                    Hệ thống sẽ ghi nhận liên kết thẻ với tài khoản quảng cáo.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition disabled:opacity-50"
                  >
                    Hủy
                  </button>

                  <button
                    onClick={onSave}
                    disabled={saving}
                    className={`w-32 py-2 rounded-xl font-semibold transition ${
                      saving
                        ? "bg-blue-600 opacity-50 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {saving ? (
                      <div className="flex justify-center items-center">
                        <ClipLoader size={18} color="#fff" />
                        <span className="ml-2 text-sm">Đang lưu...</span>
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
