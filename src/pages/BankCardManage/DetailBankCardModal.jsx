import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import AddCardApi from "../../api/AddCardApi";
import { toast } from "react-toastify";

// Component hiển thị trường thông tin (Giữ nguyên)
const DetailField = ({ label, value, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {/* Chiều cao h-10 và rounded-lg */}
    <div className="w-full h-10 flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 text-sm text-gray-800 truncate">
      {value || "-"}
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
        {/* Ngày hết hạn */}
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

    {/* 3. Vận hành */}
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
  refreshData, // New prop to refresh data after update
}) {
  const [updatingId, setUpdatingId] = useState(null);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await AddCardApi.updateAddCard(id, newStatus);
      toast.success("Cập nhật trạng thái thành công!");
      if (refreshData) refreshData(); // Refresh data from parent
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Cập nhật thất bại");
    } finally {
      setUpdatingId(null);
    }
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
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                <Dialog.Title className="text-xl font-semibold text-center mb-5 border-b pb-3">
                  Chi tiết thẻ ngân hàng
                </Dialog.Title>

                {isContentReady ? (
                  <>
                    {/* Two Column Layout - Equal Width */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* LEFT COLUMN: Card Details */}
                      <div className="flex flex-col gap-5">

                        {/* --- 1. THÔNG TIN CHUNG VỀ THẺ --- */}
                        <section>
                          <h3 className="text-base font-semibold text-gray-800 mb-3">
                            Thông tin chung
                          </h3>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            {/* ID Thẻ */}
                            {/* <DetailField
                                  label="ID Thẻ"
                                  value={cardData?.id}
                              /> */}
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
                            {/* Ngày hết hạn */}
                            <DetailField
                              label="Ngày hết hạn"
                              value={cardData?.expirationDate?.split("T")[0] || "N/A"}
                            />
                            {/* Tổng lần thêm */}
                            <DetailField
                              label="Tổng lần thêm"
                              value={cardData?.addTotal}
                            />


                            {/* Trạng thái - Dùng 2 cột (col-span-2) */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Trạng thái
                              </label>
                              <div className="w-full h-10 flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3">
                                {cardData?.status === 'ACTIVE' ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    ✓ Hoạt động
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    🔒 Khóa
                                  </span>
                                )}
                              </div>
                            </div>
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


                        {/* --- 3. THÔNG TIN VẬN HÀNH --- */}
                        <section className="border-t pt-4">
                          <h3 className="text-base font-semibold text-gray-800 mb-3">
                            Thông tin Vận hành
                          </h3>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            {/* Người phụ trách (Tên) */}
                            <DetailField
                              label="Người phụ trách (Tên)"
                              value={cardData?.assignedUserName}
                            />
                            {/* Người phụ trách (Email) */}
                            <DetailField
                              label="Người phụ trách (Email)"
                              value={cardData?.assignedUserEmail}
                            />
                          </div>
                        </section>
                      </div>

                      {/* RIGHT COLUMN: Ad Accounts List */}
                      <div className="border-l pl-6">
                        <h3 className="text-base font-semibold text-gray-800 mb-3">
                          Tài khoản quảng cáo ({cardData?.adAccounts?.length || 0})
                        </h3>
                        <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3">
                          {cardData?.adAccounts && cardData.adAccounts.length > 0 ? (
                            cardData.adAccounts.map((account) => (
                              <div
                                key={account.adAccountId}
                                className={`group flex items-center justify-between p-2 bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-all ${(() => {
                                  switch (account.status) {
                                    case 'LIVE': return 'border-l-4 border-l-green-500';
                                    case 'HOLD': return 'border-l-4 border-l-orange-500';
                                    case 'BACK': return 'border-l-4 border-l-blue-500';
                                    case 'DIE': return 'border-l-4 border-l-red-500';
                                    case 'UNPAID': return 'border-l-4 border-l-red-500';
                                    default: return 'border-l-4 border-l-gray-300';
                                  }
                                })()}`}
                              >
                                {/* Left: Info */}
                                <div className="flex-1 min-w-0 mr-2">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <p className="text-sm font-medium text-gray-900 truncate" title={account.adAccountName}>
                                      {account.adAccountName}
                                    </p>
                                    {(() => {
                                      switch (account.status) {
                                        case 'LIVE': return <span className="text-[10px] text-green-600 font-bold" title="LIVE">LIVE</span>;
                                        case 'HOLD': return <span className="text-[10px] text-orange-600 font-bold" title="HOLD">HOLD</span>;
                                        case 'BACK': return <span className="text-[10px] text-blue-600 font-bold" title="BACK">BACK</span>;
                                        case 'DIE': return <span className="text-[10px] text-red-600 font-bold" title="DIE">DIE</span>;
                                        case 'UNPAID': return <span className="text-[10px] text-red-600 font-bold" title="UNPAID">UNPAID</span>;
                                        default: return null;
                                      }
                                    })()}
                                  </div>
                                  <p className="text-[11px] text-gray-500">
                                    ID: {account.adAccountIdNumber}
                                  </p>
                                </div>

                                {/* Right: Status & Action */}
                                <div className="flex flex-col items-end gap-1">
                                  {/* Minimal Dropdown */}
                                  <div className="relative">
                                    <select
                                      value={account.linkStatus || 'NEW'}
                                      onChange={(e) => handleUpdateStatus(account.id, e.target.value)}
                                      disabled={updatingId === account.id}
                                      className={`text-xs font-semibold cursor-pointer outline-none bg-transparent py-0.5 pl-1 pr-0 text-right ${account.linkStatus === 'NEW' ? 'text-blue-600' :
                                          account.linkStatus === 'OUT' ? 'text-red-500' : 'text-gray-600'
                                        } ${updatingId === account.id ? 'opacity-50 cursor-wait' : ''}`}
                                    >
                                      <option value="NEW">Add mới</option>
                                      <option value="OUT">Đá thẻ</option>
                                    </select>
                                    {updatingId === account.id && (
                                      <span className="absolute -left-3 top-1/2 -translate-y-1/2">
                                        <svg className="animate-spin h-2.5 w-2.5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                      </span>
                                    )}
                                  </div>

                                  {/* Readded Label */}
                                  {account.isReadded && (
                                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                      Đã thêm lại
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                              <p className="text-sm">Chưa có tài khoản quảng cáo nào</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* --- FOOTER BUTTONS --- */}
                    <div className="mt-6 flex justify-end border-t pt-4">
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