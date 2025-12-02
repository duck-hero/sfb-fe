import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ClipLoader } from "react-spinners";

export default function CreateBankModal({
  open,
  onClose,
  onSave,
  formData,
  onChange,
  saving,
}) {
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

        {/* Modal container */}
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
                  Thêm ngân hàng mới
                </Dialog.Title>

                {/* Input fields */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tên ngân hàng
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={onChange}
                      disabled={saving}
                      className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mã ngân hàng
                    </label>
                    <input
                      type="text"
                      name="bankCode"
                      value={formData.bankCode}
                      onChange={onChange}
                      disabled={saving}
                      className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex justify-end gap-3">
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
                      "Thêm mới"
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
