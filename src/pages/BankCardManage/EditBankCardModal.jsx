import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ClipLoader } from "react-spinners";

// Skeleton Input (Giữ nguyên)
const InputSkeleton = () => (
  <div className="flex flex-col gap-1">
    <div className="h-4 w-24 bg-gray-200 rounded-full animate-pulse mb-1"></div>
    <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
  </div>
);

// Skeleton Content (Giữ nguyên)
const ContentSkeleton = () => (
  <>
    <div className="grid grid-cols-1 gap-4">
      <InputSkeleton />
      <InputSkeleton />
      <InputSkeleton />
      <div className="grid grid-cols-2 gap-4">
        <InputSkeleton />
        <InputSkeleton />
      </div>
      <InputSkeleton />
      <InputSkeleton />
    </div>

    <div className="mt-6 flex justify-end gap-3">
      <div className="px-4 py-2 w-20 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
      <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
    </div>
  </>
);

export default function EditBankCardModal({
  open,
  loading,
  saving,
  formData,
  onChange,
  onClose,
  onSave,
  userList = [],
  bankAccounts = [],
}) {
  // --- STATE CHO CVV (Logic Password) ---
  const [cvvInput, setCvvInput] = useState("***");
  const [isCvvEdited, setIsCvvEdited] = useState(false);

  // --- STATE CHO SỐ THẺ (Logic Click-to-Clear) ---
  const [isCardNumberTouched, setIsCardNumberTouched] = useState(false);

  useEffect(() => {
    if (open) {
      // 1. Reset CVV về dạng ẩn
      setCvvInput("***");
      setIsCvvEdited(false);

      // 2. Reset trạng thái "đã chạm" của Số thẻ về false
      setIsCardNumberTouched(false);
    }
  }, [open]);

  // Handle thay đổi CVV (Local State)
  const handleCvvChange = (e) => {
    const val = e.target.value;
    setCvvInput(val);
    setIsCvvEdited(true);
    onChange({ target: { name: "cvvCode", value: val } });
  };

  // Handle Focus vào SỐ THẺ
  const handleCardNumberFocus = () => {
    // Chỉ xóa trắng trong lần đầu tiên người dùng focus vào ô này
    if (!isCardNumberTouched) {
      setIsCardNumberTouched(true);
      // Xóa giá trị trong formData để người dùng nhập mới
      onChange({ target: { name: "cardNumber", value: "" } });
    }
  };

  // Handle Save
const handleSaveClick = () => {
    // 1. Tạo bản sao của formData hiện tại
    const payload = { ...formData };

    // 2. Xử lý logic CVV ngay trên payload (KHÔNG gọi onChange)
    if (!isCvvEdited) {
      payload.cvvCode = null; // Backend sẽ hiểu là không update field này
    }

    // 3. Xử lý logic Số thẻ (nếu cần thiết)
    // Nếu người dùng click vào xóa nhưng không nhập gì (chuỗi rỗng), 
    // có thể bạn muốn gửi null hoặc giữ nguyên logic tùy backend.
    // Ở đây giả sử backend chấp nhận chuỗi rỗng hoặc bạn đã validate required.
    
    // 4. Gọi onSave và truyền payload đã xử lý sang cha
    onSave(payload); 
  };
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
                  Chỉnh sửa thẻ ngân hàng
                </Dialog.Title>

                {isContentReady ? (
                  <>
                    <div className="flex flex-col gap-4">
                      {/* --- SỐ THẺ (Có logic Click-to-Clear) --- */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Số thẻ
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          // Hiển thị trực tiếp giá trị thực
                          value={formData.cardNumber || ""}
                          onChange={onChange}
                          onFocus={handleCardNumberFocus} // <-- Logic xóa khi click ở đây
                          disabled={saving}
                          placeholder="Nhập số thẻ mới..."
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {/* Gợi ý nhỏ cho user hiểu hành vi */}
                        {!isCardNumberTouched && formData.cardNumber && (
                          <p className="text-xs mt-1 text-gray-500">
                            Nhấp vào để nhập lại số thẻ mới.
                          </p>
                        )}
                      </div>

                      {/* --- TÊN CHỦ THẺ --- */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tên chủ thẻ
                        </label>
                        <input
                          type="text"
                          name="cardHolderName"
                          value={formData.cardHolderName || ""}
                          onChange={onChange}
                          disabled={saving}
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      {/* --- MÃ CVV (Logic Password: Hiện ***, click vào mới clear) --- */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Mã CVV
                        </label>
                        <input
                          type="text"
                          name="cvvCode"
                          value={cvvInput}
                          onChange={handleCvvChange}
                          disabled={saving}
                          onFocus={() => {
                            if (!isCvvEdited) {
                              setIsCvvEdited(true);
                              setCvvInput(""); // Clear hiển thị
                              onChange({
                                target: { name: "cvvCode", value: "" },
                              }); // Clear data gửi đi
                            }
                          }}
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs mt-1 text-gray-500">
                          {isCvvEdited
                            ? "Đang nhập mã CVV mới..."
                            : "Nếu không nhập mới, hệ thống sẽ giữ nguyên mã CVV cũ."}
                        </p>
                      </div>

                      {/* --- NGÀY THÁNG --- */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Ngày phát hành
                          </label>
                          <input
                            type="date"
                            name="issuedDate"
                            value={
                              formData.issuedDate
                                ? formData.issuedDate.split("T")[0]
                                : ""
                            }
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
                            value={
                              formData.expirationDate
                                ? formData.expirationDate.split("T")[0]
                                : ""
                            }
                            onChange={onChange}
                            disabled={saving}
                            className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      {/* --- BANK ACCOUNT SELECT --- */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tài khoản ngân hàng
                        </label>
                        <select
                          name="bankAccountId"
                          value={formData.bankAccountId || ""}
                          onChange={onChange}
                          disabled={saving}
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">-- Chọn tài khoản --</option>
                          {bankAccounts?.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.accountBankNumber} -{" "}
                              {acc.accountBankHolderName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* --- ASSIGNED USER SELECT --- */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Người sở hữu
                        </label>
                        <select
                          name="assignedToUserId"
                          value={formData.assignedToUserId || ""}
                          onChange={onChange}
                          disabled={saving}
                          className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">-- Chọn user --</option>
                          {userList?.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.userName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* --- FOOTER BUTTONS --- */}
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