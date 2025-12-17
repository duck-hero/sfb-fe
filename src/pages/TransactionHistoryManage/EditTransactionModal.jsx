import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

// Spinner
const TailwindSpinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-white border-r-white border-b-white border-l-blue-200"></div>
  </div>
);

// Skeleton Content
const ContentSkeleton = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="h-10 bg-gray-200 rounded-xl"></div>
    <div className="h-10 bg-gray-200 rounded-xl"></div>
    <div className="h-20 bg-gray-200 rounded-xl"></div>
    <div className="h-10 bg-gray-200 rounded-xl"></div>
  </div>
);

export default function EditTransactionModal({
  open,
  loading,
  saving,
  formData,
  onChange,
  onClose,
  onSave,
  bankList = [],
  adsAccountList = [], // Pass suggestions or basic list if available
  bankCardList = [], 
}) {
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left shadow-xl transition-all">
                <Dialog.Title className="text-2xl font-semibold text-center mb-5">
                  Cập nhật Giao dịch
                </Dialog.Title>

                {isContentReady ? (
                  <div className="space-y-4">
                    {/* FB Transaction Code */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Mã giao dịch FB
                      </label>
                      <input
                        type="text"
                        name="fbTransactionCode"
                        value={formData.fbTransactionCode || ""}
                        onChange={onChange}
                        disabled={saving}
                        className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    {/* FB Account ID */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        FB Account ID
                      </label>
                      <input
                        type="text"
                        name="fbAccountId"
                        value={formData.fbAccountId || ""}
                        onChange={onChange}
                        disabled={saving}
                        className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    {/* Amount FB */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Số tiền FB (AmountFb)
                      </label>
                      <input
                        type="number"
                        name="amountFb"
                        value={formData.amountFb || ""}
                        onChange={onChange}
                        disabled={saving}
                        className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    
                    {/* Card Last Digits */}
                    <div>
                         <label className="block text-sm font-medium mb-1">
                           Đuôi thẻ (Card last digits)
                         </label>
                         <input
                            type="text"
                            name="cardLastDigits"
                            placeholder="4 số cuối..."
                            value={formData.cardLastDigits || ""}
                            onChange={onChange}
                             disabled={saving}
                             className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                         />
                    </div>

                    {/* Accounting Object */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Đối tượng hạch toán
                      </label>
                      <input
                        type="text"
                        name="accountingObject"
                        value={formData.accountingObject || ""}
                        onChange={onChange}
                        disabled={saving}
                        className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
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
                        onClick={onSave}
                        disabled={saving}
                        className={`px-6 py-2 rounded-xl font-semibold transition flex justify-center items-center text-white ${
                          saving
                            ? "bg-blue-800 opacity-50 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {saving ? (
                          <>
                            <TailwindSpinner />
                            <span className="ml-2 text-sm">Đang lưu...</span>
                          </>
                        ) : (
                          "Cập nhật"
                        )}
                      </button>
                    </div>
                  </div>
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
