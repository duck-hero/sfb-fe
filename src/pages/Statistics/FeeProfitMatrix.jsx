import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Calendar, RotateCw, Filter, Download, X, MoreVertical } from "lucide-react";
import dashboardApi from "../../api/dashboardApi";
import { toast } from "react-toastify";

const CellPopover = ({ isOpen, onClose, data, position }) => {
  const popoverRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !data || !position) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN').format(val || 0);
  };

  return (
    <div 
      className="fixed z-[100] animate-in fade-in zoom-in-95 duration-150"
      style={{ 
        top: position.y + 10, 
        left: Math.min(position.x - 70, window.innerWidth - 220) 
      }}
      ref={popoverRef}
    >
      <div className="bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 w-[200px] overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-3 py-2 flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-500 uppercase">Chi tiết phí</span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={12} />
            </button>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Spend</span>
            <span className="text-xs font-bold text-gray-900">{formatCurrency(data.spend)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Fee</span>
            <span className="text-xs font-bold text-purple-600">{formatCurrency(data.fee)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Comm.</span>
            <span className="text-xs font-bold text-orange-600">{formatCurrency(data.commission)}</span>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-50 flex justify-between items-center">
            <span className="text-[10px] text-green-600 font-black uppercase">Profit</span>
            <span className="text-sm font-black text-green-700">{formatCurrency(data.profit)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeeProfitMatrix = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    year: dayjs().year(),
    month: dayjs().month() + 1,
  });

  const [popover, setPopover] = useState({ isOpen: false, data: null, position: null });

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getDailyFeeProfitMatrix(filters.year, filters.month);
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch profit matrix", error);
      toast.error("Không thể tải bảng lợi nhuận phí");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, [filters]);

  const handlePrevMonth = () => {
    setFilters(prev => {
      let newMonth = prev.month - 1;
      let newYear = prev.year;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
      return { year: newYear, month: newMonth };
    });
  };

  const handleNextMonth = () => {
    setFilters(prev => {
      let newMonth = prev.month + 1;
      let newYear = prev.year;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
      return { year: newYear, month: newMonth };
    });
  };

  const formatCurrency = (amount) => {
    if (amount === 0) return "-";
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat('vi-VN', { style: 'decimal', maximumFractionDigits: 0 }).format(amount);
  };

  const handleCellClick = (e, cellData) => {
    if (!cellData) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({
      isOpen: true,
      data: cellData,
      position: { x: rect.left + rect.width / 2, y: rect.bottom }
    });
  };

  return (
    <div className="p-6 flex flex-col h-full space-y-4">
      {/* Header & Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Ma trận Lợi nhuận phí</h1>
          <p className="text-sm text-gray-500">Thống kê lợi nhuận phí chi tiết theo ngày</p>
        </div>

        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-inner">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500 hover:text-blue-600"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 px-4 font-bold text-gray-700 min-w-[140px] justify-center text-sm">
            <Calendar size={16} className="text-blue-500" />
            Tháng {filters.month}, {filters.year}
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500 hover:text-blue-600"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <button
          onClick={fetchMatrix}
          disabled={loading}
          className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
          title="Làm mới"
        >
          <RotateCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Matrix Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3">
            <RotateCw size={40} className="text-blue-500 animate-spin" />
            <p className="text-gray-400 font-medium animate-pulse">Đang xử lý dữ liệu...</p>
          </div>
        ) : !data || !data.rows || data.rows.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-gray-400 italic">
            Không có dữ liệu cho tháng này
          </div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-30">
                <tr className="bg-gray-50/80 backdrop-blur-sm">
                  <th className="sticky left-0 z-40 min-w-[180px] px-2 py-2 text-left text-[10px] font-bold text-gray-500 uppercase border-b border-r border-gray-100 bg-gray-50/90">CODE KHÁCH</th>
                  <th className="sticky left-[180px] z-40 w-[100px] px-2 py-2 text-right text-[10px] font-bold text-blue-600 uppercase border-b border-r border-gray-100 bg-gray-50/90 shadow-[2px_0_5_px_rgba(0,0,0,0.05)]">Tổng LN</th>
                  
                  {Array.from({ length: (data.daysInMonth || 0) }, (_, i) => i + 1).map(day => (
                    <th key={day} className="min-w-[70px] px-1 py-2 text-center text-[10px] font-semibold text-gray-600 border-b border-r border-gray-100">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.rows.map((row) => (
                  <tr key={row.customerId} className="hover:bg-blue-50 transition-colors group">
                    <td className="sticky left-0 z-20 px-2 py-1.5 text-xs font-semibold text-gray-800 border-r border-gray-50 bg-white group-hover:bg-blue-50 truncate" title={row.fullCustomerCode}>{row.fullCustomerCode}</td>
                    <td className={`sticky left-[180px] z-20 px-2 py-1.5 text-xs font-black border-r border-gray-50 bg-white group-hover:bg-blue-50 shadow-[2px_0_5px_rgba(0,0,0,0.02)] text-right ${row.rowTotalProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {formatCurrency(row.rowTotalProfit)}
                    </td>
                    
                    {Array.from({ length: (data.daysInMonth || 0) }, (_, i) => i + 1).map(day => {
                        const cell = row.cells ? row.cells[day.toString()] : null;
                        const profit = cell?.profit || 0;
                        return (
                          <td 
                            key={day} 
                            onClick={(e) => handleCellClick(e, cell)}
                            className={`px-1 py-1.5 text-[11px] text-right font-mono border-r border-gray-50 transition-all ${cell ? 'cursor-pointer hover:bg-blue-100/50 hover:font-bold active:scale-95' : ''} ${profit > 0 ? 'text-gray-900 font-medium' : profit < 0 ? 'text-red-600 bg-red-50/20' : 'text-gray-300'}`}
                          >
                            {formatCurrency(profit)}
                          </td>
                        );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 z-30">
                <tr className="bg-gray-100/95 backdrop-blur-sm font-black">
                  <td className="sticky left-0 z-40 px-2 py-2 text-xs uppercase text-gray-600 border-t border-r border-gray-200 bg-gray-100 truncate">Tổng ngày</td>
                  <td className="sticky left-[180px] z-40 px-2 py-2 text-xs text-right text-blue-900 bg-blue-50 border-t border-r border-gray-200 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                    {formatCurrency(data.monthlySummary?.totalProfit || 0)}
                  </td>
                  
                  {Array.from({ length: (data.daysInMonth || 0) }, (_, i) => i + 1).map(day => {
                    const total = data.dailyTotals ? (data.dailyTotals[day.toString()] || 0) : 0;
                    return (
                        <td key={day} className={`px-1 py-2 text-xs text-right font-mono border-t border-r border-gray-200 ${total >= 0 ? 'text-green-700 font-bold' : 'text-red-700 bg-red-50/50 font-bold'}`}>
                        {formatCurrency(total)}
                        </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <CellPopover 
        isOpen={popover.isOpen}
        onClose={() => setPopover({ ...popover, isOpen: false })}
        data={popover.data}
        position={popover.position}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        /* Custom scrollbar for better density */
        .overflow-auto::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .overflow-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .overflow-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}} />
    </div>
  );
};

export default FeeProfitMatrix;
