import React, { useState, useEffect } from "react";
import dashboardApi from "../../api/dashboardApi";
import dayjs from "dayjs";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, RefreshCw, Layers, ChevronDown, ChevronRight as ChevronRightIcon, Calendar } from "lucide-react";

/**
 * Page: Báo cáo doanh số nhân viên
 */
const EmployeeSalesReport = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [expandedRows, setExpandedRows] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getEmployeeSalesReport(year, month);
      if (response && response.success) {
        setData(response.data);
      } else {
        setData(null);
      }
    } catch (error) {
      console.error("Failed to fetch employee sales report:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, month]);

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

  const toggleRow = (userId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <Layers className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              BC doanh số nhân viên
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Thống kê chi tiết doanh số theo nhân viên và khách hàng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors border border-transparent hover:border-gray-200"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
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

      {/* Table Section */}
      {loading ? (
        <div className="flex justify-center items-center h-64 flex-1">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : !data ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 flex-1">
          <AlertCircle className="w-12 h-12 mb-2 opacity-20" />
          <p>Không có dữ liệu cho tháng này</p>
        </div>
      ) : (
        <div className="overflow-auto flex-1 relative custom-scrollbar">
          <table className="w-full text-xs border-separate border-spacing-0">
            <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
              <tr>
                <th className="px-2 py-2 text-left font-semibold text-gray-600 border-b border-gray-200 border-r min-w-[150px]">
                  Nhân viên
                </th>
                <th className="px-2 py-2 text-left font-semibold text-gray-600 border-b border-gray-200 border-r min-w-[200px]">
                  Khách hàng
                </th>
                <th className="px-2 py-2 text-right font-semibold text-gray-600 border-b border-gray-200 border-r w-[150px]">
                  Lợi nhuận (Khách)
                </th>
                <th className="px-2 py-2 text-right font-semibold text-gray-600 border-b border-gray-200 w-[150px]">
                  Tổng lợi nhuận (NV)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.employees?.map((emp) => {
                const customerCount = emp.customers?.length || 0;
                // Style for the bottom border of the employee group
                const groupBorderClass = "border-b-2 border-gray-300";
                
                if (customerCount === 0) {
                   return (
                    <tr key={emp.userId} className="hover:bg-gray-50">
                        <td className={`px-2 py-1.5 ${groupBorderClass} border-r align-top font-medium text-gray-900 bg-white`}>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] ring-1 ring-white shadow-sm">
                                    {emp.userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900 line-clamp-1">{emp.userName}</span>
                                    <span className="text-[10px] text-gray-500">#{emp.userCode}</span>
                                </div>
                            </div>
                        </td>
                        <td className={`px-2 py-1.5 ${groupBorderClass} border-r text-gray-400 italic`}>No customers</td>
                        <td className={`px-2 py-1.5 ${groupBorderClass} border-r text-right text-gray-400`}>-</td>
                        <td className={`px-2 py-1.5 ${groupBorderClass} text-right font-bold text-green-600 bg-green-50/10`}>
                             {new Intl.NumberFormat('vi-VN').format(emp.totalProfit)}
                        </td>
                    </tr>
                   )
                }

                return emp.customers.map((cust, index) => {
                  const isLastRow = index === customerCount - 1;
                  const rowBorderClass = isLastRow ? groupBorderClass : "border-b border-gray-100";

                  return (
                    <tr key={`${emp.userId}-${cust.customerId}`} className="hover:bg-gray-50/50">
                      {index === 0 && (
                        <td 
                          rowSpan={customerCount} 
                          className={`px-2 py-1.5 ${groupBorderClass} border-r align-top font-medium text-gray-900 bg-white`}
                        >
                           <div className="flex items-center gap-2 sticky top-10 pt-1">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] ring-1 ring-white shadow-sm">
                                  {emp.userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                  <span className="font-medium text-gray-900 line-clamp-1">{emp.userCode}</span>
                                  <span className="text-[10px] text-gray-500">{emp.userName}</span>
                              </div>
                          </div>
                        </td>
                      )}
                      <td className={`px-2 py-1.5 ${rowBorderClass} border-r text-gray-800`}>
                          <div className="flex flex-col">
                              <span className="font-medium line-clamp-1">{cust.fullCustomerCode}</span>
                              <span className="text-[10px] text-gray-500">{cust.customerName}</span>
                          </div>
                      </td>
                      <td className={`px-2 py-1.5 ${rowBorderClass} border-r text-right font-medium text-blue-600`}>
                          {new Intl.NumberFormat('vi-VN').format(cust.profit)}
                      </td>
                      {index === 0 && (
                          <td 
                              rowSpan={customerCount} 
                              className={`px-2 py-1.5 ${groupBorderClass} text-right font-bold text-green-700 bg-green-50/10 align-middle`}
                          >
                              {new Intl.NumberFormat('vi-VN').format(emp.totalProfit)}
                          </td>
                      )}
                    </tr>
                  );
                });
              })}
            </tbody>
            <tfoot className="bg-gray-100 sticky bottom-0 z-20 font-bold text-gray-900 shadow-inner">
                 <tr>
                    <td className="px-2 py-2 border-t border-gray-200 text-left uppercase text-gray-600" colSpan={2}>
                        Tổng cộng
                    </td>
                     <td className="px-2 py-2 border-t border-gray-200 text-right text-blue-700">
                         - 
                    </td>
                    <td className="px-2 py-2 border-t border-gray-200 text-right text-green-700 text-sm">
                        {data.total ? new Intl.NumberFormat('vi-VN').format(data.total.totalProfit) : 0}
                    </td>
                 </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeSalesReport;
