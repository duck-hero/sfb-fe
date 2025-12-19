import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Receipt, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import invoiceApi from "../../api/invoiceApi";
import { toast } from "react-toastify";

const InvoiceDetailModal = ({ open, onClose, invoiceData, customer, onConfirmSuccess }) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirmStep, setShowConfirmStep] = useState(false);
  
  // Helper to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);
  };

  const isDraft = invoiceData?.status === 0;

  const handleConfirm = async () => {
    if (!invoiceData?.id) return;
    setIsConfirming(true);
    try {
      await invoiceApi.confirmInvoice(invoiceData.id);
      toast.success("Đã chốt công nợ thành công!");
      if (onConfirmSuccess) onConfirmSuccess();
      onClose();
    } catch (error) {
      toast.error("Không thể chốt công nợ: " + (error.message || "Lỗi không xác định"));
    } finally {
      setIsConfirming(false);
      setShowConfirmStep(false);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[70]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
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
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all relative">
                
                {/* Draft Watermark */}
                {isDraft && (
                   <div className="absolute bottom-25 left-20 z-0 pointer-events-none select-none opacity-5 rotate-[-10deg]">
                       <span className="text-[150px] font-black text-gray-800 uppercase tracking-widest border-8 border-gray-800 p-6 rounded-3xl">
                            NHÁP
                       </span>
                   </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex flex-col">
                        <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 flex items-center gap-2">
                            <Receipt className="w-6 h-6 text-blue-600"/>
                            Chi tiết công nợ tháng {invoiceData?.yearMonth ? `${String(invoiceData.yearMonth).slice(4)}/${String(invoiceData.yearMonth).slice(0,4)}` : ''}
                        </Dialog.Title>
                        {customer && (
                            <div className="flex items-center gap-2 mt-1 ml-8">
                                <span className="text-sm font-bold text-gray-700">{customer.name}</span>
                                <span className="text-xs text-gray-400 font-mono">({customer.customerCode || "No Code"})</span>
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Summary Chips */}
                {/* {invoiceData && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center justify-between border border-gray-100 relative z-10">
                         <div className="flex flex-col">
                             <span className="text-xs uppercase text-gray-500 font-bold mb-1">Tổng chi tiêu</span>
                             <span className="text-lg font-bold text-gray-900">{formatCurrency(invoiceData.totalSpend)}</span>
                         </div>
                         <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                         <div className="flex flex-col">
                             <span className="text-xs uppercase text-gray-500 font-bold mb-1">Tổng phí</span>
                             <span className="text-lg font-bold text-red-600">{formatCurrency(invoiceData.totalFee)}</span>
                         </div>
                         <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                         <div className="flex flex-col">
                             <span className="text-xs uppercase text-gray-500 font-bold mb-1">Tổng Ads + Phí</span>
                             <span className="text-2xl font-bold text-blue-700">{formatCurrency(invoiceData.amountDue)}</span>
                         </div>
                    </div>
                )} */}

                {/* Content Table */}
                <div className="overflow-hidden border border-gray-200 rounded-lg relative z-10 bg-white/80 backdrop-blur-[1px] mb-6">
                    <div className="max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 shadow-sm z-20">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tài khoản</th>
                                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Loại thẻ</th>
                                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Phí %</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiêu</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tiền phí</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50/50">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {invoiceData?.lines?.map((line) => (
                                    <tr key={line.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                            <div className="flex flex-col">
                                                 <span>{line.adAccountName || `ID: ${line.adAccountId}`}</span>
                                                 {line.adAccountIdNumber && <span className="text-xs text-gray-500 font-mono">{line.adAccountIdNumber}</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            {line.paymentModeSnapshot === 1 ? (
                                                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200 font-medium">Khách</span>
                                            ) : (
                                                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded border border-orange-200 font-medium">HDG</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                                            {(line.feePercentSnapshot * 100).toFixed(1)}%
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                                            {formatCurrency(line.spendTotal)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">
                                            {formatCurrency(line.feeAmount)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-blue-700 bg-blue-50/30">
                                            {formatCurrency(line.amountDueLine)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {invoiceData?.lines?.length > 0 && (
                                <tfoot className="bg-gray-100 font-bold sticky bottom-0 border-t-2 border-gray-300">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-right uppercase text-xs text-gray-600">Tổng cộng</td>
                                        <td className="px-4 py-3 text-right text-sm text-gray-900">{formatCurrency(invoiceData.totalSpend)}</td>
                                        <td className="px-4 py-3 text-right text-sm text-red-600">{formatCurrency(invoiceData.totalFee)}</td>
                                        <td className="px-4 py-3 text-right text-sm text-blue-700 bg-blue-100/50">{formatCurrency(invoiceData.amountDue)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>

                {/* Final Calculation Summary */}
                {invoiceData && (
                    <div className="flex flex-col items-end gap-2 text-sm relative z-10 border-t pt-4 border-gray-200">
                         {/* Row: Total Spend + Fee = Amount Due */}
                         <div className="w-full max-w-sm flex justify-between items-center py-1">
                             <span className="text-gray-600">Tổng tiền Ads + Phí:</span>
                             <span className="font-bold text-gray-900 text-base">{formatCurrency(invoiceData.amountDue)}</span>
                         </div>
                         
                         {/* Row: Opening Balance */}
                         <div className="w-full max-w-sm flex justify-between items-center py-1 border-t border-dashed border-gray-200">
                             <span className="text-gray-500">Dư nợ đầu kỳ:</span>
                             <span className={`font-medium ${invoiceData.openingBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                 {formatCurrency(invoiceData.openingBalance)}
                             </span>
                         </div>

                         {/* Row: Paid In Month */}
                         <div className="w-full max-w-sm flex justify-between items-center py-1 border-t border-dashed border-gray-200">
                             <span className="text-gray-500">Khách bank (Đã thanh toán):</span>
                             <span className="font-medium text-green-700">
                                {formatCurrency(invoiceData.paidInMonth)}
                             </span>
                         </div>

                         {/* Row: Closing Balance = Amount Due + Paid + Opening */}
                         <div className="w-full max-w-sm flex justify-between items-center py-2 border-t-2 border-gray-800 mt-2">
                             <span className="text-base font-bold uppercase text-gray-800">
                                 {invoiceData.closingBalance < 0 ? "Khách nợ (Dư nợ):" : "Khách dư:"}
                             </span>
                             <span className={`text-2xl font-black ${invoiceData.closingBalance < 0 ? 'text-red-600' : 'text-blue-700'}`}>
                                 {formatCurrency(Math.abs(invoiceData.closingBalance))}
                             </span>
                         </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="mt-8 flex justify-center gap-4 relative z-10 border-t pt-6 bg-gray-50/50 -mx-6 -mb-6 p-6">
                    <button
                        type="button"
                        className="rounded-lg border border-gray-300 bg-white px-8 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all w-40"
                        onClick={onClose}
                        disabled={isConfirming}
                    >
                        Đóng
                    </button>
                    
                    {isDraft && (
                        <button
                            type="button"
                            className="rounded-lg bg-orange-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-md transition-all flex items-center gap-2 w-48 justify-center disabled:opacity-50"
                            onClick={() => setShowConfirmStep(true)}
                            disabled={isConfirming}
                        >
                            <CheckCircle className="w-4 h-4" />
                            Xác nhận chốt
                        </button>
                    )}
                </div>

                {/* Confirm Step Modal (Overlay) */}
                <Transition show={showConfirmStep} as={Fragment}>
                    <div className="absolute inset-0 z-[80] bg-white/95 flex items-center justify-center p-6 rounded-2xl animate-in fade-in duration-200">
                        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl border border-orange-100 p-8 text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Xác nhận chốt công nợ</h4>
                            <p className="text-gray-500 mb-8">
                                Bạn có chắc chắn muốn xác nhận chốt công nợ tháng này không? 
                                <br/>
                                <span className="font-semibold text-gray-700">Thao tác này sẽ không thể hoàn tác.</span>
                            </p>
                            <div className="flex gap-4">
                                <button
                                    className="flex-1 py-3 px-4 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
                                    onClick={() => setShowConfirmStep(false)}
                                    disabled={isConfirming}
                                >
                                    Bỏ qua
                                </button>
                                <button
                                    className="flex-1 py-3 px-4 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
                                    onClick={handleConfirm}
                                    disabled={isConfirming}
                                >
                                    {isConfirming ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        "Đồng ý chốt"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </Transition>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default InvoiceDetailModal;
