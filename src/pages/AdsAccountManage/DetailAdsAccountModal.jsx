import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import AddCardApi from "../../api/AddCardApi";

// Component hiển thị trường thông tin
const DetailField = ({ label, value, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="w-full h-10 flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 text-sm text-gray-800 truncate">
      {value || "N/A"}
    </div>
  </div>
);

// Skeleton Input
const InputSkeleton = () => (
  <div className="flex flex-col gap-1">
    <div className="h-4 w-24 bg-gray-200 rounded-full animate-pulse mb-1"></div>
    <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
  </div>
);

// Skeleton Content
const ContentSkeleton = () => (
  <>
    <div className="mb-3">
      <div className="h-5 w-40 bg-gray-300 rounded-full animate-pulse mb-3"></div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <InputSkeleton />
        <InputSkeleton />
        <InputSkeleton />
        <InputSkeleton />
        <InputSkeleton />
        <InputSkeleton />
      </div>
    </div>
    
    <div className="border-t pt-4 mb-3">
      <div className="h-5 w-56 bg-gray-300 rounded-full animate-pulse mb-3"></div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <InputSkeleton />
        <InputSkeleton />
      </div>
    </div>

    <div className="mt-6 flex justify-end">
      <div className="px-4 py-2 w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
  </>
);

export default function DetailAdsAccountModal({
  open,
  loading,
  accountData,
  onClose,
  refreshData,
}) {
  const [updatingId, setUpdatingId] = useState(null);

  const handleUpdateStatus = async (addCardId, newStatus) => {
    if (!addCardId) {
        toast.error("Không tìm thấy ID liên kết");
        return;
    }
    setUpdatingId(addCardId);
    try {
      await AddCardApi.updateAddCard(addCardId, newStatus);
      toast.success("Cập nhật trạng thái thành công!");
      if (refreshData) refreshData();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Cập nhật thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  const isContentReady = !loading;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "0";
    return Number(value).toLocaleString('vi-VN');
  };

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
                  Chi tiết tài khoản quảng cáo
                </Dialog.Title>

                {isContentReady ? (
                  <>
                    {/* Two Column Layout - Equal Width */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* LEFT COLUMN: Account Details */}
                      <div className="flex flex-col gap-5">
                        
                        {/* --- 1. THÔNG TIN TÀI KHOẢN --- */}
                        <section>
                          <h3 className="text-base font-semibold text-gray-800 mb-3">
                            Thông tin tài khoản
                          </h3>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            {/* ID */}
                            {/* <DetailField
                              label="ID"
                              value={accountData?.id}
                            /> */}
                            {/* ID tài khoản */}
                            <DetailField
                              label="ID tài khoản"
                              value={accountData?.adAccountIdNumber}
                            />
                            {/* Trạng thái tài khoản */}
                            <div className="flex flex-col">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Trạng thái
                              </label>
                              <div className="w-full h-10 flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3">
                                {accountData?.locked ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    🔒 Đã khóa
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    ✓ Hoạt động
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Tên tài khoản */}
                            <DetailField
                              label="Tên tài khoản"
                              value={accountData?.adAccountName}
                              className="col-span-2"
                            />

                            {/* Dư nợ hiện tại */}
                            <DetailField
                              label="Dư nợ hiện tại"
                              value={formatCurrency(accountData?.currentDebt)}
                            />
                            {/* Đơn vị tiền tệ */}
                            <DetailField
                              label="Đơn vị tiền tệ"
                              value={accountData?.currencyCode}
                            />

                            {/* Thời gian cập nhật dư nợ */}
                            <DetailField
                              label="Thời gian cập nhật dư nợ"
                              value={formatDate(accountData?.debtUpdatedAt)}
                            //   className="col-span-2"
                            />

                            {/* Tổng thẻ đã add */}
                            <DetailField
                              label="Tổng thẻ đã add"
                              value={accountData?.totalAddBankCards || 0}
                            />
                            
                          </div>
                        </section>

                        {/* --- 2. THÔNG TIN BM ACCOUNT --- */}
                        <section className="border-t pt-4">
                          <h3 className="text-base font-semibold text-gray-800 mb-3">
                            Thông tin BM Account
                          </h3>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            {/* BM Account */}
                            <DetailField
                              label="BM Account"
                              value={accountData?.bmAccountname}
                              className="col-span-2"
                            />
                          </div>
                        </section>
                      </div>

                      {/* RIGHT COLUMN: Bank Cards List */}
                      <div className="border-l pl-6">
                        <h3 className="text-base font-semibold text-gray-800 mb-3">
                          Danh sách thẻ đã ADD ({accountData?.linkedBankCards?.length || 0})
                        </h3>
                        <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3">
                          {accountData?.linkedBankCards && accountData.linkedBankCards.length > 0 ? (
                            accountData.linkedBankCards.map((card, index) => (
                              <div
                                key={card.bankCardId || index}
                                className={`group flex items-center justify-between p-2 bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-all ${
                                  card.cardStatus === 'Active' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
                                }`}
                              >
                                {/* Left: Card Info */}
                                <div className="flex-1 min-w-0 mr-2">
                                  {/* Card Number & Status */}
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <p className="text-sm font-mono font-semibold text-gray-900 truncate">
                                      {card.cardNumber ? card.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ') : `**** **** **** ${card.cardLastDigits}`}
                                    </p>
                                    {card.cardStatus === 'Active' ? (
                                      <span className="text-[10px]" title="Thẻ hoạt động">✅</span>
                                    ) : (
                                      <span className="text-[10px]" title="Thẻ không hoạt động">❌</span>
                                    )}
                                  </div>
                                  
                                  {/* Details: Holder - Bank - Handler */}
                                  <div className="text-[10px] text-gray-500 space-y-0.5">
                                    <div className="flex gap-2">
                                       <span className="uppercase font-medium text-gray-700">{card.cardHolderName || 'N/A'}</span>
                                       <span>|</span>
                                       <span className="font-medium text-gray-900">{card.codeBank || 'N/A'}</span>
                                       <span>|</span>
                                       <span>{card.bankAccountNumber || 'N/A'}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                      Vận hành: <span className="font-medium text-gray-600" title={card.assignedUserEmail}>{card.assignedUserName || 'N/A'}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Right: Status badges */}
                                <div className="flex flex-col items-end gap-1">
                                  {/* Link Status */}
                                  {/* Link Status Dropdown */}
                                  <div className="relative">
                                    <select
                                      value={card.linkStatus || 'NEW'}
                                      onChange={(e) => handleUpdateStatus(card.id, e.target.value)}
                                      disabled={updatingId === card.id}
                                      onClick={(e) => e.stopPropagation()}
                                      className={`text-[10px] font-bold cursor-pointer outline-none bg-transparent py-0.5 pl-1 pr-0 text-right ${
                                        card.linkStatus === 'NEW' ? 'text-blue-700' :
                                        card.linkStatus === 'OUT' ? 'text-red-700' :
                                        'text-gray-700'
                                      } ${updatingId === card.id ? 'opacity-50 cursor-wait' : ''}`}
                                    >
                                      <option value="NEW">Add thẻ</option>
                                      <option value="OUT">Đá thẻ</option>
                                    </select>
                                    {updatingId === card.id && (
                                       <span className="absolute -left-3 top-1/2 -translate-y-1/2">
                                          <svg className="animate-spin h-2.5 w-2.5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                       </span>
                                    )}
                                  </div>

                                  {/* Readded Status */}
                                  {card.isReadded && (
                                    <span className="text-[9px] font-medium text-amber-600 bg-amber-50 px-1 py-0.5 rounded border border-amber-100">
                                      Re-added
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              <p className="text-sm">Chưa có thẻ ngân hàng nào</p>
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
