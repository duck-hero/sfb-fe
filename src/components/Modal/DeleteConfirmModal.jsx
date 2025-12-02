import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ClipLoader } from "react-spinners";

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  loading = false,
}) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={loading ? () => {} : onClose}>
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-90"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-90"
            >
              <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
                <Dialog.Title className="text-xl font-bold text-gray-800">
                  {title}
                </Dialog.Title>

                <p className="mt-2 text-gray-600">{message}</p>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    disabled={loading}
                    onClick={onClose}
                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                  >
                    Hủy
                  </button>

                  <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <ClipLoader size={18} color="white" />}
                    Xóa
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
