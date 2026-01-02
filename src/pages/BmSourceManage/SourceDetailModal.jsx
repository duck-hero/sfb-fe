import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Loader2, X, FileText, ChevronRight, ChevronDown } from "lucide-react";
import bmSourceApi from "../../api/bmSourceApi";
import { toast } from "react-toastify";

const SourceDetailModal = ({ open, onClose, source, year, month }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [expandedBms, setExpandedBms] = useState(new Set());

    useEffect(() => {
        if (open && source?.sourceId) {
            fetchDetail();
            setExpandedBms(new Set()); // Reset expansions
        } else {
            setData(null);
        }
    }, [open, source, year, month]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await bmSourceApi.getReconciliation(source.sourceId, year, month);
            if (response.success) {
                setData(response.data);
                // Auto-expand all BMs by default for better visibility
                if (response.data.bmDetails) {
                    const allBmIds = new Set(response.data.bmDetails.map(bm => bm.bmId));
                    setExpandedBms(allBmIds);
                }
            } else {
                toast.error(response.message || "Không thể tải chi tiết");
            }
        } catch (error) {
            console.error("Error loading reconciliation details:", error);
            toast.error("Lỗi khi tải dữ liệu chi tiết");
        } finally {
            setLoading(false);
        }
    };

    const toggleBm = (bmId) => {
        setExpandedBms(prev => {
            const next = new Set(prev);
            if (next.has(bmId)) next.delete(bmId);
            else next.add(bmId);
            return next;
        });
    };

    const formatNumber = (num, minFractionDigits = 0) => {
        if (num === undefined || num === null) return "-";
        return num.toLocaleString("vi-VN", { minimumFractionDigits: minFractionDigits, maximumFractionDigits: 2 });
    };

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
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
                            <Dialog.Panel className="w-full max-w-[95vw] h-[90vh] flex flex-col transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-gray-100 text-sm">
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-20 shadow-sm">
                                    <Dialog.Title as="h3" className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span>Chi tiết công nợ - {source?.sourceName}</span>
                                            <span className="text-xs font-normal text-gray-500">Tháng {month}/{year}</span>
                                        </div>
                                    </Dialog.Title>
                                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-auto bg-gray-50/50 p-6">
                                    {loading ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                                            <Loader2 className="w-10 h-10 animate-spin text-primary-dark" />
                                            <span>Đang tải dữ liệu...</span>
                                        </div>
                                    ) : data ? (
                                        <div className="flex flex-col gap-6">
                                            {/* Summary Cards */}
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-2 tracking-wider">Chi tiêu thẻ nguồn</div>
                                                    <div className="text-xl font-black text-blue-600 truncate" title={formatNumber(data.sourceCardSpent)}>
                                                        {formatNumber(data.sourceCardSpent)}
                                                    </div>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-2 tracking-wider">Chi tiêu thẻ khác</div>
                                                    <div className="text-xl font-black text-purple-600 truncate" title={formatNumber(data.notSourceCardSpent)}>
                                                        {formatNumber(data.notSourceCardSpent)}
                                                    </div>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-2 tracking-wider">
                                                        Phí ngoại tệ ({(data.sourceFeePercent * 100).toFixed(1)}%)
                                                    </div>
                                                    <div className="text-xl font-black text-orange-600 truncate" title={formatNumber(data.sourceFeeAmount)}>
                                                        {formatNumber(data.sourceFeeAmount)}
                                                    </div>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 bg-green-50/10">
                                                    <div className="text-xs text-gray-500 uppercase font-bold mb-2 tracking-wider">Phải thanh toán</div>
                                                    <div className="text-xl font-black text-green-600 truncate" title={formatNumber(data.amountDue)}>
                                                        {formatNumber(data.amountDue)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Data Table */}
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                                <div className="overflow-x-auto flex-1">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="bg-[#f8f9fa] text-gray-700 sticky top-0 z-30 shadow-sm text-xs uppercase font-bold tracking-wider">
                                                            <tr>
                                                                <th className="px-4 py-3 sticky left-0 z-40 bg-[#f8f9fa] border-b border-r w-[300px] min-w-[300px] max-w-[300px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Tên / Tài khoản</th>
                                                                <th className="px-4 py-3 sticky left-[300px] z-40 bg-[#f8f9fa] border-b border-r text-right w-[150px] min-w-[150px] max-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Tổng tiêu</th>
                                                                {daysArray.map(day => (
                                                                    <th key={day} className="px-2 py-3 border-b border-r text-center min-w-[80px]">
                                                                        {day}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 text-xs">
                                                            {data.bmDetails.map((bm, index) => {
                                                                const isBmExpanded = expandedBms.has(bm.bmId);
                                                                const isEven = index % 2 === 0;

                                                                // Define Theme Colors
                                                                const theme = isEven ? {
                                                                    bmBg: "bg-green-100 hover:bg-green-200",
                                                                    bmBorder: "border-green-300",
                                                                    groupBg: "bg-green-50",
                                                                    groupBorder: "border-green-200",
                                                                    accBg: "bg-green-50/30 hover:bg-green-50", // Account very light green
                                                                    accBorder: "border-green-100",
                                                                    text: "text-green-900",
                                                                    indicator: "bg-green-600"
                                                                } : {
                                                                    bmBg: "bg-blue-100 hover:bg-blue-200",
                                                                    bmBorder: "border-blue-300",
                                                                    groupBg: "bg-blue-50",
                                                                    groupBorder: "border-blue-200",
                                                                    accBg: "bg-blue-50/30 hover:bg-blue-50", // Account very light blue
                                                                    accBorder: "border-blue-100",
                                                                    text: "text-blue-900",
                                                                    indicator: "bg-blue-600"
                                                                };
                                                                
                                                                return (
                                                                    <React.Fragment key={bm.bmId}>
                                                                        {/* BM HEADER ROW */}
                                                                        <tr 
                                                                            onClick={() => toggleBm(bm.bmId)} 
                                                                            className={`${theme.bmBg} cursor-pointer transition-colors border-b ${theme.bmBorder}`}
                                                                        >
                                                                            <td className={`px-4 py-3 font-bold sticky left-0 z-20 bg-inherit border-r ${theme.bmBorder} ${theme.text} w-[300px] min-w-[300px] max-w-[300px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]`}>
                                                                                <div className="flex items-center gap-2">
                                                                                     {isBmExpanded ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
                                                                                     <span className={`w-2 h-2 rounded-full ${theme.indicator}`}></span>
                                                                                     <span className="truncate" title={bm.bmName}>{bm.bmName}</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className={`px-4 py-3 text-right font-bold sticky left-[300px] z-20 bg-inherit border-r ${theme.bmBorder} ${theme.text} w-[150px] min-w-[150px] max-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]`}>
                                                                                {formatNumber(bm.totalSpend)}
                                                                            </td>
                                                                            {daysArray.map(day => <td key={day} className={`border-r ${theme.bmBorder} bg-opacity-50`}></td>)}
                                                                        </tr>

                                                                        {/* BM CONTENT */}
                                                                        {isBmExpanded && bm.cardGroups && bm.cardGroups.map((group, gIdx) => (
                                                                             <React.Fragment key={`g-${bm.bmId}-${gIdx}`}>
                                                                                 {/* GROUP HEADER */}
                                                                                 {(group.totalSpend > 0 || group.adAccountDetails?.length > 0) && (
                                                                                     <tr className={`${theme.groupBg} border-b ${theme.groupBorder}`}>
                                                                                          <td className={`px-4 py-2 pl-12 font-semibold text-gray-600 sticky left-0 z-20 bg-inherit border-r uppercase text-[11px] ${theme.groupBorder} w-[300px] min-w-[300px] max-w-[300px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]`}>
                                                                                              {group.groupName === 'THE_NGUON' ? 'Thẻ nguồn' : 'Thẻ khác'}
                                                                                          </td>
                                                                                          <td className={`px-4 py-2 text-right font-semibold text-gray-600 sticky left-[300px] z-20 bg-inherit border-r ${theme.groupBorder} w-[150px] min-w-[150px] max-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]`}>
                                                                                              {formatNumber(group.totalSpend)}
                                                                                          </td>
                                                                                          {daysArray.map(day => <td key={day} className={`border-r ${theme.groupBorder} bg-opacity-30`}></td>)}
                                                                                     </tr>
                                                                                 )}

                                                                                 {/* ACCOUNTS */}
                                                                                 {group.adAccountDetails && group.adAccountDetails.map(acc => {
                                                                                     const dailySpendMap = {};
                                                                                     acc.dailySpends?.forEach(ds => dailySpendMap[new Date(ds.date).getDate()] = ds.spend);

                                                                                     return (
                                                                                        <tr key={acc.adAccountId} className={`${theme.accBg} transition-colors group border-b ${theme.accBorder}`}>
                                                                                            <td className={`px-4 py-2 pl-16 sticky left-0 z-20 bg-inherit border-r ${theme.accBorder} group-hover:brightness-95 w-[300px] min-w-[300px] max-w-[300px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]`}>
                                                                                                <div className="flex flex-col">
                                                                                                    <span className="font-bold text-gray-700 truncate" title={acc.adAccountName}>{acc.adAccountName}</span>
                                                                                                    <span className="text-[10px] text-gray-400 font-mono">{acc.adAccountIdNumber}</span>
                                                                                                </div>
                                                                                            </td>
                                                                                            <td className={`px-4 py-2 text-right font-bold text-gray-800 sticky left-[300px] z-20 bg-inherit border-r ${theme.accBorder} w-[150px] min-w-[150px] max-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]`}>
                                                                                                {formatNumber(acc.totalSpend)}
                                                                                            </td>
                                                                                             {daysArray.map(day => {
                                                                                                 const val = dailySpendMap[day];
                                                                                                 return (
                                                                                                     <td key={day} className={`px-2 py-2 text-center border-r ${theme.accBorder} ${val > 0 ? 'text-gray-900 font-medium' : 'text-gray-300'}`}>
                                                                                                         {val ? formatNumber(val) : '-'}
                                                                                                     </td>
                                                                                                 );
                                                                                             })}
                                                                                        </tr>
                                                                                     );
                                                                                 })}
                                                                             </React.Fragment>
                                                                        ))}
                                                                    </React.Fragment>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-400 italic">Không có dữ liệu chi tiết</div>
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

export default SourceDetailModal;
