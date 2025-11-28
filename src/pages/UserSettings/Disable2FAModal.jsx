import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function Disable2FAModal({ isOpen, onClose, onSubmit }) {
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    onSubmit(password);
    setPassword("");
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white rounded-xl shadow p-6 w-full max-w-sm">
              <Dialog.Title className="text-lg font-bold mb-3">
                Disable Two-Factor Authentication
              </Dialog.Title>

              <p className="text-sm text-gray-600 mb-4">
                Please enter your password to disable 2FA.
              </p>

              <input
                type="password"
                className="w-full p-2 border rounded outline-none focus:ring"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Disable
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
