// TwoFAModal.jsx
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function TwoFAModal({
  isOpen,
  onClose,
  qrCodeUrl,
  secretKey,
  codeInputs = [], // mặc định mảng tránh undefined
  onCodeChange,
  onActivate,
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white p-6 text-left shadow-xl transition-all">
                <Dialog.Title className="text-lg font-semibold mb-4">Two-factor authentication</Dialog.Title>

                <div className="flex flex-col items-center">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-36 h-36" />
                  ) : (
                    <div className="w-36 h-36 bg-gray-100 flex items-center justify-center">No QR</div>
                  )}

                  <p className="text-sm text-gray-600 mt-3 text-center">
                    Scan the QR code using any authentication application on your phone (e.g.
                    <span className="text-blue-600"> Google Authenticator</span>, Duo Mobile, Authy) or enter the following
                    code:
                  </p>

                  <div className="mt-2 p-2 bg-gray-100 rounded text-center text-sm font-mono break-all w-full">
                    {secretKey || "—"}
                  </div>

                  <p className="mt-4 text-sm text-gray-700">Enter the 6-digit confirmation code shown on the app:</p>

                  <div className="mt-2 flex gap-2">
                    {Array.isArray(codeInputs) &&
                      codeInputs.map((value, index) => (
                        <input
                          key={index}
                          maxLength="1"
                          className="w-10 h-12 border rounded text-center text-lg focus:ring-2 focus:ring-blue-500"
                          value={value}
                          onChange={(e) => onCodeChange(index, e.target.value)}
                        />
                      ))}
                  </div>

                  <div className="mt-4 bg-yellow-100 text-yellow-700 text-xs p-3 rounded w-full text-center">
                    You will be logged out from all your devices and browsers that have been used to log in recently for security reasons.
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onClose}>
                    Cancel
                  </button>

                  <button className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600" onClick={onActivate}>
                    Activate
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
