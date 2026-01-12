import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, RotateCw, RefreshCw, ChevronDown, ChevronUp, Users, CreditCard, TrendingUp, DollarSign } from "lucide-react";
import dashboardApi from "../../api/dashboardApi";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const CTVStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getCTVSummary(year, month);
      if (response.success) {
        setData(response.data || []);
      } else {
        toast.error(response.message || "Không thể tải dữ liệu");
      }
    } catch (error) {
      console.error("Error fetching CTV stats:", error);
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [year, month]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  // Calculate totals
  const totals = data.reduce(
    (acc, ctv) => ({
      totalSpend: acc.totalSpend + (ctv.totalSpend || 0),
      totalCommission: acc.totalCommission + (ctv.totalCommission || 0),
      customerCount: acc.customerCount + (ctv.customerCount || 0),
    }),
    { totalSpend: 0, totalCommission: 0, customerCount: 0 }
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-sm font-bold uppercase text-primary-darkest">
            Thống kê hoa hồng CTV
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors border border-transparent hover:border-gray-200"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>

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

      {loading ? (
        <div className="flex justify-center items-center h-64 flex-1">
          <RotateCw className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-lg flex-1 custom-scrollbar">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-20">
              <tr>
                <th className="px-4 py-2 font-bold uppercase border-b border-r border-gray-100">Cộng tác viên / Khách hàng</th>
                <th className="px-4 py-2 font-bold uppercase border-b border-r border-gray-100 text-right w-32">Chi tiêu</th>
                <th className="px-4 py-2 font-bold uppercase border-b border-r border-gray-100 text-right w-24">Tỷ lệ</th>
                <th className="px-4 py-2 font-bold uppercase border-b border-gray-100 text-right w-40">Hoa hồng</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {data && data.length > 0 ? (
                data.map((ctv) => (
                  <React.Fragment key={ctv.collaboratorId}>
                    {/* CTV Row */}
                    <tr className="bg-blue-50/50 font-bold border-t border-gray-100">
                      <td className="px-4 py-2 border-r border-gray-100">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-blue-600" />
                          <span className="text-gray-900">{ctv.collaboratorName}</span>
                          <span className="text-[10px] text-gray-400 font-mono">({ctv.collaboratorCode})</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right border-r border-gray-100 text-gray-900">
                        {formatCurrency(ctv.totalSpend)}
                      </td>
                      <td className="px-4 py-2 text-right border-r border-gray-100 text-gray-400 font-normal">
                        {ctv.customerCount} Khách
                      </td>
                      <td className="px-4 py-2 text-right font-black text-blue-700 bg-blue-50/30">
                        {formatCurrency(ctv.totalCommission)}
                      </td>
                    </tr>

                    {/* Customer Rows */}
                    {ctv.customers &&
                      ctv.customers.map((customer) => (
                        <tr key={customer.customerId} className="hover:bg-gray-50 transition-colors border-t border-gray-50">
                          <td className="px-4 py-1.5 pl-10 border-r border-gray-100">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-700">{customer.fullCustomerCode}</span>
                              <span className="text-[9px] text-gray-400">{customer.customerName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-1.5 text-right border-r border-gray-100 text-gray-600">
                            {formatCurrency(customer.spend)}
                          </td>
                          <td className="px-4 py-1.5 text-right border-r border-gray-100">
                            <span className="text-orange-600 font-bold">
                              {(customer.commissionRate * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-1.5 text-right text-green-600 font-bold">
                            {formatCurrency(customer.commissionAmount)}
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">
                    Không có dữ liệu cho tháng này
                  </td>
                </tr>
              )}
            </tbody>

            {/* Footer Totals */}
            {data && data.length > 0 && (
              <tfoot className="bg-gray-100 font-bold sticky bottom-0 z-10 shadow-inner border-t border-gray-200">
                <tr>
                  <td className="px-4 py-2 uppercase text-gray-600">
                    Tổng cộng ({data.length} CTV)
                  </td>
                  <td className="px-4 py-2 text-right text-gray-900 border-r border-gray-100">
                    {formatCurrency(totals.totalSpend)}
                  </td>
                  <td className="px-4 py-2 text-right border-r border-gray-100 text-purple-700">
                    {totals.customerCount} Khách
                  </td>
                  <td className="px-4 py-2 text-right text-green-700 font-black">
                    {formatCurrency(totals.totalCommission)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
};

export default CTVStatistics;
