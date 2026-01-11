import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Loader2, Calendar, FileText, RefreshCw, ChevronLeft, ChevronRight, Receipt, UsersRound } from "lucide-react";
import dashboardApi from "../../api/dashboardApi";
import { toast } from "react-toastify";

const CollaboratorDebtSummary = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [year, setYear] = useState(dayjs().year());
    const [month, setMonth] = useState(dayjs().month() + 1);

    const fetchData = async (isRefresh = false) => {
        setLoading(true);
        try {
            const res = await dashboardApi.getCTVDebtSummary(year, month, isRefresh);
            if (res.success) {
                setData(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch collaborator debt", error);
            toast.error("Không thể tải báo cáo công nợ CTV");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(false);
    }, [year, month]);

    const handlePrevMonth = () => {
        if (month === 1) {
            setMonth(12);
            setYear(prev => prev - 1);
        } else {
            setMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (month === 12) {
            setMonth(1);
            setYear(prev => prev + 1);
        } else {
            setMonth(prev => prev + 1);
        }
    };

    const formatNumber = (num) => {
        if (num === undefined || num === null) return "-";
        return num.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <Receipt className="w-6 h-6 text-orange-500" />
                    Công nợ CTV tháng {month}/{year}
                </h2>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchData(true)}
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
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="overflow-x-auto border rounded-xl shadow-sm flex-1 scrollbar-thin scrollbar-thumb-gray-200">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-[#f8f9fa] text-gray-700 sticky top-0 z-20">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-600 border-b border-r min-w-[200px]">CTV</th>
                                <th className="px-4 py-4 font-bold text-gray-600 border-b border-r text-right min-w-[140px]">
                                    <div>Dư đầu kỳ</div>
                                    <div className="text-[10px] font-normal text-gray-400">(dư nợ tháng trước)</div>
                                </th>
                                <th className="px-4 py-4 font-bold text-teal-600 border-b border-r text-right min-w-[140px]">
                                    <div>Hoa hồng</div>
                                    <div className="text-[10px] font-normal text-teal-400">(Commission)</div>
                                </th>
                                <th className="px-4 py-4 font-bold text-purple-600 border-b border-r text-right min-w-[140px]">
                                    <div>Chiết khấu</div>
                                    <div className="text-[10px] font-normal text-purple-400">(Discount)</div>
                                </th>
                                <th className="px-4 py-4 font-bold text-green-600 border-b border-r text-right min-w-[140px]">
                                    <div>Đã thanh toán</div>
                                    <div className="text-[10px] font-normal text-green-400">(Paid)</div>
                                </th>
                                <th className="px-4 py-4 font-bold text-blue-700 border-b text-right bg-blue-50/50 min-w-[150px]">
                                    <div>Dư cuối kỳ</div>
                                    <div className="text-[10px] font-normal text-blue-400">(dư + hh - ck - đã tt)</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {data && data.collaborators && data.collaborators.length > 0 ? (
                                data.collaborators.map((ctv) => {
                                    return (
                                        <tr key={ctv.collaboratorId} className="hover:bg-blue-50/50 transition-all group">
                                            <td className="px-6 py-4 font-bold text-gray-800 border-r border-gray-100 group-hover:text-blue-600 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                        {ctv.collaboratorName && ctv.collaboratorName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span>{ctv.collaboratorCode}</span>
                                                        <span className="text-[10px] font-normal text-gray-400 group-hover:text-blue-400 transition-colors">{ctv.collaboratorName}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right text-gray-700 border-r border-gray-100 font-medium">{formatNumber(ctv.openingBalance)}</td>

                                            <td className="px-4 py-4 text-right text-teal-600 border-r border-gray-100 font-medium">{formatNumber(ctv.commissionAmount)}</td>

                                            <td className="px-4 py-4 text-right text-purple-600 border-r border-gray-100 font-medium">{formatNumber(ctv.discountAmount)}</td>

                                            <td className="px-4 py-4 text-right text-green-600 border-r border-gray-100 font-medium">{formatNumber(ctv.paidAmount)}</td>

                                            <td className={`px-4 py-4 text-right font-bold bg-blue-50/10 ${ctv.closingBalance > 0 ? 'text-blue-600' : ctv.closingBalance < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                                {formatNumber(ctv.closingBalance)}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 bg-gray-50 italic">
                                        <div className="flex flex-col items-center gap-2">
                                            <UsersRound className="w-8 h-8 text-gray-300" />
                                            Không có dữ liệu công nợ CTV cho tháng này
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {/* Footer Totals */}
                        {data && data.total && (
                            <tfoot className="bg-gray-100 font-bold border-t-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] sticky bottom-0 z-20">
                                <tr>
                                    <td className="px-6 py-4 uppercase text-gray-600" colSpan={1}>Tổng cộng</td>
                                    <td className="px-4 py-4 text-right text-gray-800 border-r border-gray-200">{formatNumber(data.total.openingBalance)}</td>
                                    <td className="px-4 py-4 text-right text-teal-700 border-r border-gray-200">{formatNumber(data.total.commissionAmount)}</td>
                                    <td className="px-4 py-4 text-right text-purple-700 border-r border-gray-200">{formatNumber(data.total.discountAmount)}</td>
                                    <td className="px-4 py-4 text-right text-green-700 border-r border-gray-200">{formatNumber(data.total.paidAmount)}</td>
                                    <td className="px-4 py-4 text-right text-blue-800 bg-blue-100/50">{formatNumber(data.total.closingBalance)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}
        </div>
    );
};

export default CollaboratorDebtSummary;
