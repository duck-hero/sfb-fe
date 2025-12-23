import { Fragment, useEffect, useState, useRef, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, ChevronLeft, ChevronRight, Save, RotateCw, Plus, Trash2 } from "lucide-react";
import dailySpendApi from "../../api/dailySpendApi";
import invoiceApi from "../../api/invoiceApi";
import customerApi from "../../api/customerApi";
import InvoiceDetailModal from "./InvoiceDetailModal";
import { toast } from "react-toastify";

const SpendTrackingModal = ({ open, customer, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date()); // Keep track of current view (Month/Year)

  const customerId = customer?.customerId || customer?.id;

  // Manual Payments State
  const [manualPayments, setManualPayments] = useState([]);
  const [loadingManual, setLoadingManual] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualFormData, setManualFormData] = useState({
      amount: "",
      date: new Date().toISOString().split('T')[0],
      note: ""
  });

  // Helper to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const getMonthParams = (date) => {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1 // 1-12
    };
  };

  const fetchGrid = async (date) => {
    setLoading(true);
    try {
      const { year, month } = getMonthParams(date);
      // Use customerId
      const res = await dailySpendApi.getSpendGrid(customerId, year, month);
      setData(res.data || res);
    } catch (error) {
      toast.error("Không tải được bảng chi tiêu");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchManualPayments = async () => {
      if (!customerId) return;
      setLoadingManual(true);
      try {
          const { year, month } = getMonthParams(currentDate);
          const res = await customerApi.getManualPayments(customerId, year, month);
          setManualPayments(res.data || []);
      } catch (error) {
          console.error("Failed to fetch manual payments", error);
      } finally {
          setLoadingManual(false);
      }
  };

  const handleAddManualPayment = async (e) => {
      e.preventDefault();
      if (!manualFormData.amount || Number(manualFormData.amount) <= 0) {
          toast.warning("Vui lòng nhập số tiền hợp lệ");
          return;
      }

      setLoadingManual(true);
      try {
          const { year, month } = getMonthParams(currentDate);
          await customerApi.createManualPayment({
              customerId: customerId,
              amount: Number(manualFormData.amount),
              year: year,
              month: month,
              date: new Date(manualFormData.date).toISOString(),
              note: manualFormData.note
          });
          toast.success("Đã thêm thanh toán thủ công");
          setManualFormData({
              amount: "",
              date: new Date().toISOString().split('T')[0],
              note: ""
          });
          setShowManualForm(false);
          fetchManualPayments();
          fetchGrid(currentDate);
      } catch (error) {
          toast.error(typeof error === 'string' ? error : "Thêm thất bại");
      } finally {
          setLoadingManual(false);
      }
  };

  const handleDeleteManualPayment = async (id) => {
      if (!window.confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) return;

      setLoadingManual(true);
      try {
          await customerApi.deleteManualPayment(id);
          toast.success("Đã xóa giao dịch");
          fetchManualPayments();
          fetchGrid(currentDate);
      } catch (error) {
          toast.error(typeof error === 'string' ? error : "Xóa thất bại");
      } finally {
          setLoadingManual(false);
      }
  };

  useEffect(() => {
      if (showTransactions) {
          fetchManualPayments();
      }
  }, [showTransactions, currentDate]);

  const handleGenerateInvoice = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
        const { year, month } = getMonthParams(currentDate);
        const res = await invoiceApi.generateInvoice(customerId, year, month);
        setInvoiceData(res.data || res);
        setInvoiceModalOpen(true);
    } catch (error) {
        toast.error(typeof error === 'string' ? error : "Tạo thất bại");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (open && customer) {
      fetchGrid(currentDate);
    } else {
        setData(null);
    }
  }, [open, customer, currentDate]);

  const handleMonthChange = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  // Construct date string YYYY-MM-DD
  const getDateString = (year, month, day) => {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const calculateUpdatedSummaries = (newData, rowIndex, day, newSpend, oldSpend) => {
    // 1. Update Row Total
    const row = newData.rows[rowIndex];
    row.rowTotal = (row.rowTotal || 0) - oldSpend + newSpend;

    // 2. Update Daily Total
    const oldDailyTotal = newData.dailyTotals[day] || 0;
    newData.dailyTotals[day] = oldDailyTotal - oldSpend + newSpend;

    // 3. Update Monthly Summary
    let totalSpend = 0;
    let totalFee = 0;
    let amountDue = 0;

    newData.rows.forEach(r => {
        totalSpend += r.rowTotal;
        const rowFee = r.rowTotal * r.feePercent;
        totalFee += rowFee;
        
        // If Customer Card (1), they pay spend directly, so we only charge Fee.
        // If Agency Card (2) or others, we pay spend, so we charge Spend + Fee.
        if (r.paymentMode === 1) {
             amountDue += rowFee;
        } else {
             amountDue += (r.rowTotal + rowFee);
        }
    });

    newData.monthlySummary = {
        totalSpend: totalSpend,
        totalFee: totalFee,
        amountDue: amountDue
    };

    return newData;
  };

  const handleCellChange = (rowIndex, day, value) => {
    // Optimistic Update for local state only (typing)
    const numericValue = value === "" ? 0 : Number(value);
    
    // Prevent NaN
    if (isNaN(numericValue)) return;

    setData(prevData => {
        if (!prevData) return null;
        
        const newData = { ...prevData };
        const row = newData.rows[rowIndex];
        
        // Ensure cells object exists
        if (!row.cells) row.cells = {};
        
        const cell = row.cells[day] || { spend: 0 };
        const oldSpend = cell.spend || 0;
        
        // Update cell
        row.cells[day] = { ...cell, spend: numericValue };

        // Recalculate Totals
        return calculateUpdatedSummaries(newData, rowIndex, day, numericValue, oldSpend);
    });
  };

  const saveCellData = async (rowIndex, day, value) => {
      const numericValue = value === "" ? 0 : Number(value);
      if (isNaN(numericValue)) return;

      const row = data?.rows[rowIndex];
      if (!row) return;

      const customerAdsAccountId = row.customerAdsAccountId;
      const dateStr = getDateString(data.year, data.month, day);

      try {
          if (numericValue > 0) {
              await dailySpendApi.upsertDailySpend({
                  customerAdsAccountId: customerAdsAccountId,
                  date: dateStr,
                  spend: numericValue
              });
          } else {
              await dailySpendApi.deleteDailySpend(customerAdsAccountId, dateStr);
          }
          // Refetch data as requested
          // await fetchGrid(currentDate);
      } catch (error) {
          toast.error(typeof error === 'string' ? error : "Lưu thất bại");
      }
  };

  const handleKeyDown = (e) => {
      if (e.key === "Enter") {
          e.target.blur(); // Trigger blur to save
          return;
      }
      // Prevent "e", "E", "+", "-"
      if (["e", "E", "+", "-"].includes(e.key)) {
          e.preventDefault();
      }
  };

  // Generate Days Array [1, 2, ... daysInMonth]
  const daysArray = useMemo(() => {
    if (!data) return [];
    return Array.from({ length: data.daysInMonth }, (_, i) => i + 1);
  }, [data]);

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
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-[98vw] h-[95vh] flex flex-col transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all border border-gray-200">
                
                {/* Header Section */}
                <div className="flex flex-col border-b bg-white flex-none shadow-sm z-20">
                  {/* Top Bar: Title, Navigation, Actions */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <Dialog.Title className="text-lg font-bold text-gray-800">
                        Theo dõi chi tiêu
                      </Dialog.Title>

                      {customer && (
                          <div className="flex flex-col border-l pl-4 border-gray-300">
                              <span className="font-bold text-gray-900 text-sm leading-tight">{customer.name}</span>
                              <span className="text-xs text-gray-500 font-mono">{customer.customerCode || "No Code"}</span>
                          </div>
                      )}
                      
                      <div className="flex items-center bg-gray-50 rounded-md border border-gray-200 px-1 ml-2">
                          <button onClick={() => handleMonthChange(-1)} className="p-1 hover:bg-gray-200 rounded text-gray-600 transition">
                              <ChevronLeft className="w-4 h-4"/>
                          </button>
                          <span className="mx-2 font-semibold text-gray-700 text-sm min-w-[80px] text-center">
                              {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
                          </span>
                          <button onClick={() => handleMonthChange(1)} className="p-1 hover:bg-gray-200 rounded text-gray-600 transition">
                              <ChevronRight className="w-4 h-4"/>
                          </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-px bg-gray-200 mx-1"></div>

                        <button 
                          onClick={handleGenerateInvoice}
                          className="p-1.5 hover:bg-orange-50 hover:text-orange-600 rounded-md text-orange-500 transition"
                          title="Chốt công nợ"
                        >
                          Chốt công nợ
                        </button>

                        <button 
                          onClick={() => fetchGrid(currentDate)}
                          className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-md text-green-500 transition"
                          title="Refresh"
                        >
                          <RotateCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        
                        <button onClick={onClose} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md text-red-400 transition">
                          <X className="w-5 h-5" />
                        </button>
                    </div>
                  </div>

                  {/* Bottom Bar: Financial Summaries */}
                  {(data?.monthlySummary || data?.balancePanel) && (
                      <div className="flex items-center px-4 py-2 bg-[#f8f9fa] gap-4 overflow-x-auto whitespace-nowrap border-b border-gray-200">
                          {/* Balance Panel */}
                          {data?.balancePanel && (
                              <div className="flex gap-4 items-center border-r border-gray-300 pr-4 mr-2">
                                  <div className="flex flex-col">
                                      <span className="text-[10px] uppercase text-gray-500 font-bold">Dư nợ đầu kì</span>
                                      <span className={`text-sm font-bold ${data.balancePanel.openingBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                          {formatCurrency(data.balancePanel.openingBalance)}
                                      </span>
                                  </div>
                                  
                                   {/* CLICKABLE KHÁCH BANK (COMBINED) */}
                                  <div 
                                    className="flex flex-col cursor-pointer group relative border-r border-gray-300 pr-4 mr-2"
                                    onClick={() => setShowTransactions(true)}
                                  >
                                      <span className="text-[10px] uppercase text-gray-500 font-bold group-hover:text-blue-600 transition-colors flex items-center gap-1 mb-0.5">
                                          Khách bank
                                          <span className="bg-blue-100 text-blue-600 rounded-full px-1.5 py-0.5 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">Chi tiết</span>
                                      </span>
                                      <div className="flex gap-4">
                                          <div className="flex flex-col border-l-2 border-green-200 pl-1.5">
                                              <span className="text-[9px] text-gray-400 uppercase font-medium leading-tight">Tự động</span>
                                              <span className="text-sm font-bold text-green-700 underline decoration-dotted decoration-green-300 underline-offset-4 group-hover:text-blue-700 transition-all">
                                                  {formatCurrency(data.balancePanel.paidInMonth)}
                                              </span>
                                          </div>
                                          <div className="flex flex-col border-l-2 border-teal-200 pl-1.5">
                                              <span className="text-[9px] text-gray-400 uppercase font-medium leading-tight">Thủ công</span>
                                              <span className="text-sm font-bold text-teal-700 underline decoration-dotted decoration-teal-300 underline-offset-4 group-hover:text-blue-700 transition-all">
                                                  {formatCurrency(data.balancePanel.paidInMonthManual || 0)}
                                              </span>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="flex flex-col">
                                      <span className="text-[10px] uppercase text-gray-500 font-bold">Số tiền còn lại</span>
                                      <span className={`text-sm font-bold ${data.balancePanel.closingBalance < 0 ? 'text-red-600' : 'text-purple-700'}`}>
                                          {formatCurrency(data.balancePanel.closingBalance)}
                                      </span>
                                  </div>
                              </div>
                          )}

                          {/* Monthly Summary */}
                          {data?.monthlySummary && (
                              <div className="flex gap-4 items-center">
                                  <div className="flex flex-col">
                                      <span className="text-[10px] uppercase text-gray-500 font-bold">Tổng Ads</span>
                                      <span className="text-sm font-bold text-gray-900">
                                          {formatCurrency(data.monthlySummary.totalSpend)}
                                      </span>
                                  </div>
                                  <div className="flex flex-col">
                                      <span className="text-[10px] uppercase text-gray-500 font-bold">Tổng Phí</span>
                                      <span className="text-sm font-bold text-red-600">
                                          {formatCurrency(data.monthlySummary.totalFee)}
                                      </span>
                                  </div>
                                  <div className="flex flex-col">
                                      <span className="text-[10px] uppercase text-gray-500 font-bold">Tổng tiền Ads + Phí</span>
                                      <span className="text-sm font-bold text-blue-700">
                                          {formatCurrency(data.monthlySummary.amountDue)}
                                      </span>
                                  </div>
                              </div>
                          )}
                      </div>
                  )}

                  {/* Transactions Modal (Nested) */}
                  <Transition appear show={showTransactions} as={Fragment}>
                    <Dialog as="div" className="relative z-[60]" onClose={() => setShowTransactions(false)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/25" />
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
                                    <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all h-[80vh] flex flex-col">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center mb-4 flex-none"
                                        >
                                            <div className="flex flex-col">
                                                <span>Chi tiết giao dịch</span>
                                                <span className="text-xs text-gray-500 font-normal">Tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()}</span>
                                            </div>
                                            <button onClick={() => setShowTransactions(false)} className="text-gray-400 hover:text-gray-600">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </Dialog.Title>
                                        
                                        <div className="flex-1 overflow-hidden flex gap-6">
                                            {/* LEFT COLUMN: BANK TRANSACTIONS */}
                                            <div className="flex-1 flex flex-col border border-gray-100 rounded-xl overflow-hidden bg-gray-50/30">
                                                <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center">
                                                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                        Ghi nhận tự động
                                                    </h4>
                                                    <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                                                        {data?.transactions?.length || 0} Giao dịch
                                                    </span>
                                                </div>
                                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                    {data?.transactions && data.transactions.length > 0 ? (
                                                        <table className="min-w-full divide-y divide-gray-100">
                                                            <thead className="bg-gray-50/50 sticky top-0">
                                                                <tr>
                                                                    <th scope="col" className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ngày</th>
                                                                    <th scope="col" className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nội dung</th>
                                                                    <th scope="col" className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Số tiền</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-transparent divide-y divide-gray-100">
                                                                {data.transactions.map((tx) => (
                                                                    <tr key={tx.id} className="hover:bg-white transition-colors">
                                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                                            <div className="text-xs font-semibold text-gray-900">
                                                                                {new Date(tx.effectiveDate).toLocaleDateString('vi-VN')}
                                                                            </div>
                                                                            <div className="text-[10px] text-gray-500">
                                                                                {new Date(tx.effectiveDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute:'2-digit'})}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <div className="text-xs text-gray-600 break-words line-clamp-2 max-w-[200px]" title={tx.description}>
                                                                                {tx.description}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                                                            <span className={`text-xs font-bold ${tx.transactionType === "IN" ? "text-green-600" : "text-red-600"}`}>
                                                                                {tx.transactionType === "IN" ? "+" : "-"}{formatCurrency(tx.amount)}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center text-gray-400 text-xs italic">Không có giao dịch bank</div>
                                                    )}
                                                </div>
                                                <div className="px-4 py-2 bg-blue-50/50 border-t border-blue-100 flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-blue-700 uppercase">Tổng bank</span>
                                                    <span className="text-sm font-bold text-blue-700">{formatCurrency(data?.balancePanel?.paidInMonth || 0)}</span>
                                                </div>
                                            </div>

                                            {/* RIGHT COLUMN: MANUAL PAYMENTS */}
                                            <div className="flex-1 flex flex-col border border-gray-100 rounded-xl overflow-hidden bg-gray-50/30">
                                                <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center">
                                                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                                        Ghi nhận thủ công
                                                    </h4>
                                                    <button 
                                                        onClick={() => setShowManualForm(!showManualForm)}
                                                        className={`p-1 rounded-md transition-colors ${showManualForm ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'}`}
                                                    >
                                                        {showManualForm ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                                                    </button>
                                                </div>

                                                {/* Add Manual Form */}
                                                {showManualForm && (
                                                    <form onSubmit={handleAddManualPayment} className="p-4 bg-teal-50/50 border-b border-teal-100 animate-in slide-in-from-top duration-200">
                                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                                            <div className="flex flex-col gap-1">
                                                                <label className="text-[10px] font-bold text-teal-700 uppercase">Số tiền</label>
                                                                <input 
                                                                    type="number"
                                                                    required
                                                                    placeholder="0"
                                                                    className="px-2 py-1.5 rounded-lg border border-teal-200 text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                                                                    value={manualFormData.amount}
                                                                    onChange={(e) => setManualFormData({...manualFormData, amount: e.target.value})}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <label className="text-[10px] font-bold text-teal-700 uppercase">Ngày</label>
                                                                <input 
                                                                    type="date"
                                                                    required
                                                                    className="px-2 py-1.5 rounded-lg border border-teal-200 text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                                                                    value={manualFormData.date}
                                                                    onChange={(e) => setManualFormData({...manualFormData, date: e.target.value})}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1 mb-3">
                                                            <label className="text-[10px] font-bold text-teal-700 uppercase">Ghi chú</label>
                                                            <input 
                                                                type="text"
                                                                placeholder="Nhập ghi chú..."
                                                                className="px-2 py-1.5 rounded-lg border border-teal-200 text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                                                                value={manualFormData.note}
                                                                onChange={(e) => setManualFormData({...manualFormData, note: e.target.value})}
                                                            />
                                                        </div>
                                                        <button 
                                                            type="submit"
                                                            disabled={loadingManual}
                                                            className="w-full py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 shadow-sm transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            {loadingManual ? <RotateCw className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3"/>}
                                                            Lưu giao dịch
                                                        </button>
                                                    </form>
                                                )}

                                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                    {manualPayments.length > 0 ? (
                                                        <table className="min-w-full divide-y divide-gray-100">
                                                            <thead className="bg-gray-50/50 sticky top-0">
                                                                <tr>
                                                                    <th scope="col" className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ngày</th>
                                                                    <th scope="col" className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ghi chú</th>
                                                                    <th scope="col" className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Số tiền</th>
                                                                    <th scope="col" className="px-4 py-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider"></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-transparent divide-y divide-gray-100">
                                                                {manualPayments.map((mp) => (
                                                                    <tr key={mp.id} className="hover:bg-white transition-colors group">
                                                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-gray-900">
                                                                            {new Date(mp.date).toLocaleDateString('vi-VN')}
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <div className="text-xs text-gray-600 break-words line-clamp-2" title={mp.note}>
                                                                                {mp.note || "---"}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-bold text-teal-600">
                                                                            {formatCurrency(mp.amount)}
                                                                        </td>
                                                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                                                            <button 
                                                                                onClick={() => handleDeleteManualPayment(mp.id)}
                                                                                className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5"/>
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center text-gray-400 text-xs italic">Không có giao dịch thủ công</div>
                                                    )}
                                                </div>
                                                <div className="px-4 py-2 bg-teal-50/50 border-t border-teal-100 flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-teal-700 uppercase">Tổng thủ công</span>
                                                    <span className="text-sm font-bold text-teal-700">{formatCurrency(manualPayments.reduce((acc, curr) => acc + curr.amount, 0))}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end gap-3 flex-none">
                                            <button
                                                type="button"
                                                className="px-6 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors"
                                                onClick={() => setShowTransactions(false)}
                                            >
                                                Đóng
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                  </Transition>
                </div>

                {/* Content Section - The Grid */}
                <div className="flex-1 overflow-auto relative bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-50">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : !data ? (
                     <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">Không có dữ liệu</div>
                  ) : (
                    <table className="border-collapse w-full text-xs">
                      <thead className="bg-[#f8f9fa] sticky top-0 z-40 shadow-sm text-gray-700">
                        <tr>
                            <th className="sticky left-0 z-50 bg-[#fff3cd] border-b border-r border-[#ffeeba] px-2 py-2 min-w-[180px] text-left font-bold uppercase tracking-wider text-[#856404]">
                                Tài khoản
                            </th>
                            <th className="sticky left-[180px] z-50 bg-[#fff3cd] border-b border-r border-[#ffeeba] px-2 py-2 w-[100px] text-right font-bold uppercase tracking-wider text-[#856404]">
                                Tổng
                            </th>
                            {daysArray.map(day => (
                                <th key={day} className="border-b border-r border-gray-300 px-1 py-2 min-w-[70px] text-center font-semibold text-gray-600">
                                    {day}
                                </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                          {data.rows.map((row, rowIndex) => (
                              <tr key={row.customerAdsAccountId} className="hover:bg-blue-50/30 transition-colors">
                                  {/* Info Column */}
                                  <td className="sticky left-0 z-30 bg-[#fff9db] group-hover:bg-[#fff9db] border-r border-[#ffeeba] px-2 py-1.5 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                      <div className="flex flex-col gap-1">
                                          <span className="font-semibold text-gray-800 text-xs truncate max-w-[160px]" title={row.adAccountName}>
                                              {row.adAccountName}
                                          </span>
                                          <span className="text-[10px] text-gray-500 font-mono tracking-tighter leading-none">{row.adAccountIdNumber || row.adAccountId}</span>
                                          
                                          <div className="flex items-center gap-1 mt-0.5">
                                              {/* Payment Mode Badge */}
                                              {row.paymentMode === 1 && (
                                                  <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200 font-medium whitespace-nowrap">
                                                      Thẻ khách
                                                  </span>
                                              )}
                                              {row.paymentMode === 2 && (
                                                  <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200 font-medium whitespace-nowrap">
                                                      Thẻ HDG
                                                  </span>
                                              )}
                                              
                                              {/* Fee Badge */}
                                              <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 font-medium">
                                                  {(row.feePercent * 100).toFixed(1)}%
                                              </span>
                                          </div>
                                      </div>
                                  </td>
                                  
                                  {/* Row Total */}
                                  <td className="sticky left-[180px] z-30 bg-[#fff9db] group-hover:bg-[#fff9db] border-r border-[#ffeeba] px-2 py-1 text-right font-bold text-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                      {formatCurrency(row.rowTotal)}
                                  </td>

                                  {/* Day Cells */}
                                  {daysArray.map(day => {
                                      const cellData = row.cells?.[day];
                                      const spend = cellData?.spend || "";
                                      
                                      // Date Logic
                                      const currentYear = data.year;
                                      const currentMonth = data.month;
                                      // Create Date Object for the cell (set time to end of day or use string comparison)
                                      // Using simple YYYY-MM-DD string update might be safer or just set Hours to 0
                                      const cellDate = new Date(Date.UTC(currentYear, currentMonth - 1, day));
                                      
                                      const startAtDate = row.startAt ? new Date(row.startAt) : null;
                                      const endAtDate = row.endAt ? new Date(row.endAt) : null;
                                      
                                      // Normalize times for accurate comparison
                                      if (startAtDate) startAtDate.setUTCHours(0,0,0,0);
                                      if (endAtDate) endAtDate.setUTCHours(0,0,0,0);
                                      
                                      let isDisabled = false;
                                      const isLocked = data?.balancePanel?.isLocked || false;
                                      
                                      if (isLocked) isDisabled = true;
                                      if (startAtDate && cellDate < startAtDate) isDisabled = true;
                                      if (endAtDate && cellDate > endAtDate) isDisabled = true;

                                      return (
                                          <td key={day} className={`border-r border-gray-200 p-0 relative h-8 ${isDisabled ? 'bg-gray-100' : ''}`}>
                                              <input
                                                  type="number"
                                                  min="0"
                                                  disabled={isDisabled}
                                                  className={`w-full h-full text-right px-1 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 transition-all font-mono text-[11px]
                                                      ${spend > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'}
                                                      ${isDisabled ? 'bg-gray-200 cursor-not-allowed opacity-50' : (spend > 0 ? 'bg-white' : 'bg-gray-50/30')}
                                                  `}
                                                  placeholder={isDisabled ? "" : "-"}
                                                  value={spend}
                                                  onChange={(e) => handleCellChange(rowIndex, day, e.target.value)}
                                                  onBlur={(e) => saveCellData(rowIndex, day, e.target.value)}
                                                  onKeyDown={handleKeyDown}
                                              />
                                          </td>
                                      )
                                  })}
                              </tr>
                          ))}
                      </tbody>
                      <tfoot className="bg-gray-100 sticky bottom-0 z-40 border-t-2 border-gray-300 shadow-inner">
                          <tr className="font-bold text-gray-800 text-xs">
                             <td className="sticky left-0 z-50 bg-gray-100 border-r border-gray-300 px-2 py-2">
                                 TỔNG CỘNG
                             </td>
                             <td className="sticky left-[180px] z-50 bg-blue-50 border-r border-gray-300 px-2 py-2 text-right text-blue-900">
                                {formatCurrency(data.monthlySummary.totalSpend)}
                             </td>
                             {daysArray.map(day => (
                                 <td key={day} className="border-r border-gray-300 px-1 py-1.5 text-right font-mono">
                                     {data.dailyTotals[day] > 0 ? formatCurrency(data.dailyTotals[day]) : ''}
                                 </td>
                             ))}
                          </tr>
                      </tfoot>
                    </table>
                  )}

                  {/* Stamp for Confirmed Invoice */}
                  {data?.balancePanel?.invoiceStatus === 1 && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none select-none">
                          <div className="border-[8px] border-red-500/30 rounded-xl p-4 rotate-[-15deg] flex flex-col items-center justify-center bg-white/10 backdrop-blur-[1px]">
                              <span className="text-4xl md:text-6xl font-black text-red-500/30 uppercase tracking-[0.2em] whitespace-nowrap">
                                  ĐÃ CHỐT CÔNG NỢ
                              </span>
                              <span className="text-base md:text-xl font-bold text-red-500/30 uppercase tracking-widest mt-2">
                                  {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
                              </span>
                          </div>
                      </div>
                  )}
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
      
      {/* Invoice Modal */}
      <InvoiceDetailModal 
          open={invoiceModalOpen} 
          onClose={() => setInvoiceModalOpen(false)} 
          invoiceData={invoiceData}
          customer={customer}
          onConfirmSuccess={() => fetchGrid(currentDate)}
      />
    </Transition>
  );
};

export default SpendTrackingModal;
