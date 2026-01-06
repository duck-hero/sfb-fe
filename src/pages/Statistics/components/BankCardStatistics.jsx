import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import transactionHistoryApi from "../../../api/transactionHistoryApi";
import TableSkeleton from "../../../components/Loading/TableSkeleton";

export default function BankCardStatistics() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  
  // Tooltip state
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, day: 0, total: 0, transactions: [] });
  const closeTimer = useRef(null);
  const containerRef = useRef(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await transactionHistoryApi.getBankCardPaymentStats(year, month);
      setData(res?.data || []);
    } catch (error) {
      toast.error("Lấy thống kê thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Calculate Column Totals
  const columnTotals = days.map((d) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return data.reduce((acc, card) => {
      const dayStat = card.dailyStats.find((s) => s.date.startsWith(dateStr));
      return acc + (dayStat ? dayStat.totalAmount : 0);
    }, 0);
  });

  const grandTotal = data.reduce((acc, card) => acc + card.totalAmount, 0);

  const handleClick = (e, dayStat, d) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Determine if we should show tooltip above or below
    const spaceAbove = rect.top;
    const showBelow = spaceAbove < 350;

    // Determine horizontal position (prevent right overflow)
    const tooltipWidth = 400;
    const windowWidth = window.innerWidth;
    let x = rect.left;
    let arrowX = 24; // default arrow position (left-6 which is 24px)

    if (x + tooltipWidth > windowWidth) {
      // Shift left so it stays in viewport, adding some padding
      const shiftedX = windowWidth - tooltipWidth - 10; 
      arrowX = rect.left - shiftedX + (rect.width / 2) - 8; // center arrow on cell
      x = shiftedX;
    } else {
      // Default left alignment, but center arrow on cell
      arrowX = rect.width / 2 - 8;
    }

    setTooltip({
      show: true,
      x: x,
      y: showBelow ? rect.bottom : rect.top,
      day: d,
      total: dayStat.totalAmount,
      transactions: dayStat.transactions,
      position: showBelow ? 'below' : 'above',
      arrowX: arrowX
    });
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      // Close tooltip if clicking anywhere outside the tooltip itself
      if (tooltip.show) {
        setTooltip((prev) => ({ ...prev, show: false }));
      }
    };

    if (tooltip.show) {
      window.addEventListener("click", handleOutsideClick);
    }

    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [tooltip.show]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200" ref={containerRef}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Thống kê thanh toán thẻ</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white rounded-md transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2 px-3">
              <Calendar size={16} className="text-gray-500" />
              <span className="font-semibold text-sm">
                Tháng {month}/{year}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white rounded-md transition-all shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-4"><TableSkeleton /></div>
        ) : (
          <table className="min-w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 uppercase text-gray-500 font-semibold border-b border-gray-200">
                <th className="px-4 py-3 sticky left-0 z-30 bg-gray-50 border-r border-gray-200 min-w-[200px] w-[200px]">
                  Thẻ / Ngày
                </th>
                <th className="px-4 py-3 sticky left-[200px] z-30 bg-gray-50 border-r border-gray-200 text-right min-w-[120px] w-[120px]">
                  Tổng cộng
                </th>
                {days.map((d) => (
                  <th
                    key={d}
                    className="px-2 py-3 border-r border-gray-200 text-center min-w-[85px] w-[85px]"
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((card) => (
                <tr key={card.bankCardId} className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="px-4 py-3 sticky left-0 z-20 bg-white border-r border-gray-200 shadow-[1px_0_0_rgb(229,231,235)]">
                    <div className="font-semibold text-gray-800 truncate">
                      {card.bankName} - {card.cardLastDigits}
                    </div>
                    <div className="text-gray-500 text-[10px] truncate">
                      {card.cardHolderName}
                    </div>
                  </td>
                  <td className="px-4 py-3 sticky left-[200px] z-20 bg-white border-r border-gray-200 font-bold text-blue-600 text-right shadow-[1px_0_0_rgb(229,231,235)]">
                    {formatCurrency(card.totalAmount)}
                  </td>
                  {days.map((d) => {
                    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                    const dayStat = card.dailyStats.find((s) => s.date.startsWith(dateStr));

                    return (
                      <td
                        key={d}
                        className={`px-2 py-3 border-r border-gray-100 text-center relative transition-colors ${dayStat && dayStat.totalAmount > 0 ? 'hover:bg-blue-50 cursor-pointer' : ''}`}
                        onClick={(e) => dayStat && dayStat.totalAmount > 0 && handleClick(e, dayStat, d)}
                      >
                        {dayStat && dayStat.totalAmount > 0 ? (
                          <div className="font-medium text-gray-700">
                            {formatCurrency(dayStat.totalAmount)}
                          </div>
                        ) : (
                          <span className="text-gray-200">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            {/* Footer with Totals */}
            <tfoot className="bg-gray-50 font-bold text-gray-800">
              <tr className="border-t-2 border-gray-300">
                <td className="px-4 py-3 sticky left-0 z-20 bg-gray-50 border-r border-gray-200">
                  TỔNG CỘNG
                </td>
                <td className="px-4 py-3 sticky left-[200px] z-20 bg-gray-50 border-r border-gray-200 text-right text-red-600">
                  {formatCurrency(grandTotal)}
                </td>
                {columnTotals.map((total, idx) => (
                  <td key={idx} className="px-2 py-3 border-r border-gray-200 text-center bg-gray-50">
                    {total > 0 ? formatCurrency(total) : "-"}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Tooltip Portal */}
      {tooltip.show && createPortal(
        <div 
          className={`fixed z-[9999] pointer-events-auto transform ${tooltip.position === 'below' ? 'mt-3' : '-translate-y-full mb-3'}`}
          style={{ left: tooltip.x, top: tooltip.y }}
          onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing it
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-3 w-[400px]">
            <div className="flex justify-between items-center mb-2 border-b pb-1">
              <span className="font-bold text-gray-700 text-sm">Ngày {tooltip.day}/{month}</span>
              <span className="text-blue-600 font-bold text-sm tracking-tight">{formatCurrency(tooltip.total)} VNĐ</span>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {tooltip.transactions.map((t) => (
                <div key={t.id} className="text-[11px] border-b border-gray-50 pb-2 last:border-0">
                  <div className="flex justify-between items-center gap-2 mb-1">
                    <div className="flex gap-2">
                       <span className="text-blue-600 font-medium bg-blue-50 px-1 rounded">{t.fbAccountId || "N/A"}</span>
                       <span className="text-gray-500 bg-gray-50 px-1 rounded">{t.fbTransactionCode || "N/A"}</span>
                    </div>
                    <span className="text-red-500 font-bold ml-auto">{formatCurrency(t.amount)}</span>
                  </div>
                  <div className="flex justify-between items-start text-gray-400 gap-4">
                    <span className="shrink-0">{new Date(t.transactionDate).toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' })}</span>
                    <span className="truncate flex-1 text-right" title={t.description}>{t.description}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Arrow */}
            <div 
              className={`absolute w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent ${
                tooltip.position === 'below' 
                ? '-top-2 border-b-[8px] border-b-white' 
                : '-bottom-2 border-t-[8px] border-t-white'
              }`}
              style={{ left: `${tooltip.arrowX}px` }}
            ></div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
