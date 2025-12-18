import { Fragment, useEffect, useState, useRef, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, ChevronLeft, ChevronRight, Save , RotateCw} from "lucide-react";
import dailySpendApi from "../../api/dailySpendApi";
import { toast } from "react-toastify";

const SpendTrackingModal = ({ open, customer, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date()); // Keep track of current view (Month/Year)

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
      // Use customer.id
      const res = await dailySpendApi.getSpendGrid(customer.id, year, month);
      setData(res.data || res);
    } catch (error) {
      toast.error("Không tải được bảng chi tiêu");
      setData(null);
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
                <div className="flex items-center justify-between px-4 py-2 border-b bg-white flex-none shadow-sm z-20">
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
                  
                  <div className="flex items-center gap-4">
                      {data?.monthlySummary && (
                          <div className="flex gap-4 text-xs">
                              <div className="bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                                  <span className="text-gray-500 font-medium uppercase mr-2">Tổng Tiêu:</span>
                                  <span className="font-bold text-gray-900 text-sm">{formatCurrency(data.monthlySummary.totalSpend)}</span>
                              </div>
                              <div className="bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                                  <span className="text-gray-500 font-medium uppercase mr-2">Tổng Phí:</span>
                                  <span className="font-bold text-red-600 text-sm">{formatCurrency(data.monthlySummary.totalFee)}</span>
                              </div>
                              <div className="bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                                  <span className="text-gray-500 font-bold uppercase mr-2">Cần Thu khách:</span>
                                  <span className="font-bold text-blue-700 text-sm">{formatCurrency(data.monthlySummary.amountDue)}</span>
                              </div>
                          </div>
                      )}
                      
                      <div className="h-6 w-px bg-gray-200 mx-1"></div>

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
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SpendTrackingModal;
