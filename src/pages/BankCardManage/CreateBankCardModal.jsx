import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ClipLoader } from "react-spinners";

export default function CreateBankCardModal({
  open,
  onClose,
  onSave,
  formData,
  onChange,
  saving,
  userList = [],
  bankAccounts = [],
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
              {/* Cập nhật style Panel giống EditModal */}
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left shadow-xl transition-all">
                
                <Dialog.Title className="text-2xl font-semibold text-center mb-5">
                  Tạo thẻ ngân hàng
                </Dialog.Title>

                <div className="flex flex-col gap-4">
                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Số thẻ</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={onChange}
                      disabled={saving}
                      placeholder="Nhập số thẻ..."
                      className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Card Holder */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tên chủ thẻ
                    </label>
                    <input
                      type="text"
                      name="cardHolderName"
                      value={formData.cardHolderName}
                      onChange={onChange}
                      disabled={saving}
                      placeholder="Nhập tên in trên thẻ..."
                      className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* CVV */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Mã CVV</label>
                    <input
                      type="number"
                      name="cvvCode"
                      value={formData.cvvCode}
                      onChange={onChange}
                      disabled={saving}
                      placeholder="Nhập mã 3 số mặt sau..."
                      className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Issued Date & Expiration - Gộp thành 2 cột giống EditModal */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Ngày phát hành
                      </label>
                      <input
                        type="date"
                        name="issuedDate"
                        value={formData.issuedDate}
                        onChange={onChange}
                        disabled={saving}
                        className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Ngày hết hạn
                      </label>
                      <input
                        type="date"
                        name="expirationDate"
                        value={formData.expirationDate}
                        onChange={onChange}
                        disabled={saving}
                        className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Bank Account ID */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tài khoản ngân hàng (BankAccount)
                    </label>

                    <select
                      name="bankAccountId"
                      value={formData.bankAccountId}
                      onChange={onChange}
                      disabled={saving}
                      className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">-- Chọn tài khoản ngân hàng --</option>
                      {bankAccounts?.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.accountBankNumber} - {acc.accountBankHolderName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assigned User */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Gán cho người dùng
                    </label>
                    <select
                      name="assignedToUserId"
                      value={formData.assignedToUserId}
                      onChange={onChange}
                      disabled={saving}
                      className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">-- Chọn user --</option>
                      {userList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.userName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Footer Buttons - Style giống EditModal */}
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
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