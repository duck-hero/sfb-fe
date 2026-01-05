import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Loader2, X, FileText, ChevronRight, ChevronDown, Edit2, Check, XCircle, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import bmSourceApi from "../../api/bmSourceApi";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const SourceDetailModal = ({ open, onClose, source, year, month }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [expandedBms, setExpandedBms] = useState(new Set());
    const [isEditingDiscount, setIsEditingDiscount] = useState(false);
    const [tempDiscount, setTempDiscount] = useState(0);
    const [savingDiscount, setSavingDiscount] = useState(false);
    const [showTransactionsModal, setShowTransactionsModal] = useState(false);

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

    const handleStartEditDiscount = () => {
        setTempDiscount(data?.manualDiscount || 0);
        setIsEditingDiscount(true);
    };

    const handleSaveDiscount = async () => {
        setSavingDiscount(true);
        try {
            const response = await bmSourceApi.updateDiscount({
                sourceId: source.sourceId,
                year: year,
                month: month,
                manualDiscount: Number(tempDiscount)
            });
            if (response.success) {
                toast.success("Cập nhật chiết khấu thành công");
                setIsEditingDiscount(false);
                fetchDetail(); // Refresh data
            } else {
                toast.error(response.message || "Không thể cập nhật chiết khấu");
            }
        } catch (error) {
            console.error("Error saving discount:", error);
            toast.error("Lỗi khi lưu chiết khấu");
        } finally {
            setSavingDiscount(false);
        }
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
                                            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-9 gap-2">
                                                {/* Đầu kỳ */}
                                                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Dư nợ đầu kỳ</div>
                                                    <div className="text-[9px] text-gray-400 mb-1 leading-tight">(Số dư tháng trước)</div>
                                                    <div className="text-sm font-black text-gray-700 truncate" title={formatNumber(data.openingBalance)}>
                                                        {formatNumber(data.openingBalance)}
                                                    </div>
                                                </div>

                                                {/* ADS BLOCK (Parent-Child) */}
                                                <div className="bg-white rounded-lg shadow-sm border border-blue-100 flex overflow-hidden col-span-2">
                                                    {/* Parent: Total Ads */}
                                                    <div className="flex-1 p-2 bg-blue-50/20 border-r border-blue-200 flex flex-col justify-center">
                                                        <div className="text-[10px] text-blue-800 uppercase font-black mb-0.5">Tổng Ads</div>
                                                        <div className="text-[9px] text-blue-400 mb-1 leading-tight">(Tổng chi tiêu)</div>
                                                        <div className="text-sm font-black text-blue-700 truncate" title={formatNumber(data.totalSpend)}>
                                                            {formatNumber(data.totalSpend)}
                                                        </div>
                                                    </div>
                                                    {/* Children */}
                                                    <div className="flex-1 flex flex-col">
                                                        <div className="flex-1 p-1 px-2 border-b border-blue-100 flex flex-col justify-center bg-gray-50/30">
                                                            <div className="text-[8px] text-gray-400 uppercase font-bold">Thẻ đầu tổng</div>
                                                            <div className="text-[11px] font-black text-blue-600 truncate">{formatNumber(data.sourceCardSpent)}</div>
                                                        </div>
                                                        <div className="flex-1 p-1 px-2 flex flex-col justify-center bg-gray-50/30">
                                                            <div className="text-[8px] text-gray-400 uppercase font-bold">Thẻ HDG/KHÁCH</div>
                                                            <div className="text-[11px] font-black text-purple-600 truncate">{formatNumber(data.notSourceCardSpent)}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white p-2 rounded-lg shadow-sm border border-orange-100">
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">
                                                        Phí ({(data.sourceFeePercent * 100).toFixed(1)}%)
                                                    </div>
                                                    <div className="text-[9px] text-gray-400 mb-1 leading-tight">(Ads x {data.sourceFeePercent * 100}% phí)</div>
                                                    <div className="text-sm font-black text-orange-600 truncate" title={formatNumber(data.sourceFeeAmount)}>
                                                        {formatNumber(data.sourceFeeAmount)}
                                                    </div>
                                                </div>
                                                <div className="bg-white p-2 rounded-lg shadow-sm border border-cyan-100">
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Ngưỡng</div>
                                                    <div className="text-[9px] text-gray-400 mb-1 leading-tight">(Ngưỡng)</div>
                                                    <div className="text-sm font-black text-cyan-600 truncate" title={formatNumber(data.totalThresholdCut)}>
                                                        {formatNumber(data.totalThresholdCut)}
                                                    </div>
                                                </div>
                                                <div className="bg-white p-2 rounded-lg shadow-sm border border-indigo-100 group/discount relative overflow-hidden">
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Chiết khấu</div>
                                                    <div className="text-[9px] text-gray-400 mb-1 leading-tight">(Giảm trừ)</div>
                                                    
                                                    {isEditingDiscount ? (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <input 
                                                                type="number"
                                                                value={tempDiscount}
                                                                onChange={(e) => setTempDiscount(e.target.value)}
                                                                className="w-full text-xs font-black p-0.5 border rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                                                autoFocus
                                                            />
                                                            <button 
                                                                onClick={handleSaveDiscount}
                                                                disabled={savingDiscount}
                                                                className="p-0.5 text-green-600 hover:bg-green-50 rounded"
                                                            >
                                                                {savingDiscount ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                            </button>
                                                            <button 
                                                                onClick={() => setIsEditingDiscount(false)}
                                                                className="p-0.5 text-red-600 hover:bg-red-50 rounded"
                                                            >
                                                                <XCircle className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-sm font-black text-indigo-600 truncate" title={formatNumber(data.manualDiscount)}>
                                                                {formatNumber(data.manualDiscount)}
                                                            </div>
                                                            <button 
                                                                onClick={handleStartEditDiscount}
                                                                className="opacity-0 group-hover/discount:opacity-100 p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                                                                title="Sửa chiết khấu"
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div 
                                                    onClick={() => setShowTransactionsModal(true)}
                                                    className="bg-white p-2 rounded-lg shadow-sm border border-green-100 cursor-pointer hover:bg-green-50/50 transition-colors group/paid"
                                                >
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-0.5 flex justify-between">
                                                        <span>Đã thanh toán</span>
                                                        <Clock className="w-3 h-3 opacity-0 group-hover/paid:opacity-100 transition-opacity text-green-500" />
                                                    </div>
                                                    <div className="text-[9px] text-gray-400 mb-1 leading-tight">(Tổng đã chuyển cho nguồn)</div>
                                                    <div className="text-sm font-black text-green-600 truncate" title={formatNumber(data.totalPaid)}>
                                                        {formatNumber(data.totalPaid)}
                                                    </div>
                                                </div>
                                                <div className="bg-white p-2 rounded-lg shadow-sm border border-red-100 bg-red-50/10">
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Dư nợ</div>
                                                    <div className="text-[9px] text-gray-400 mb-1 leading-tight">(Dư + Phí + Ads Thẻ Nguồn + Ngưỡng - Chiết khấu - Đã TT)</div>
                                                    <div className="text-sm font-black text-red-600 truncate" title={formatNumber(data.balance)}>
                                                        {formatNumber(data.balance)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Data Table */}
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                                <div className="overflow-x-auto flex-1">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="bg-[#f8f9fa] text-gray-700 sticky top-0 z-30 shadow-sm text-xs uppercase font-bold tracking-wider">
                                                            <tr>
                                                                <th className="px-4 py-3 sticky left-0 z-40 bg-[#f8f9fa] border-b border-r w-[300px] min-w-[300px] max-w-[300px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                                    <div>Tên / Tài khoản</div>
                                                                    <div className="text-[10px] font-normal text-gray-400 lowercase">(BM / Tài khoản Ads)</div>
                                                                </th>
                                                                <th className="px-4 py-3 sticky left-[300px] z-40 bg-[#f8f9fa] border-b border-r text-right w-[150px] min-w-[150px] max-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                                    <div>Tổng tiêu</div>
                                                                    <div className="text-[10px] font-normal text-gray-400 lowercase">(Tổng chi tiêu tháng)</div>
                                                                </th>
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
                                                                                            {group.groupName === 'THE_NGUON' ? 'Thẻ đầu tổng' : 'Thẻ HDG/KHÁCH'}
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
            {/* Transactions Modal */}
            <Transition appear show={showTransactionsModal} as={Fragment}>
                <Dialog as="div" className="relative z-[60]" onClose={() => setShowTransactionsModal(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px]" />
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
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-xl transition-all border border-gray-100">
                                    <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50">
                                        <Dialog.Title as="h3" className="text-base font-bold text-gray-800 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-green-600" />
                                            Lịch sử thanh toán
                                        </Dialog.Title>
                                        <button onClick={() => setShowTransactionsModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="max-h-[60vh] overflow-y-auto p-4">
                                        {data?.financialTransactions && data.financialTransactions.length > 0 ? (
                                            <table className="w-full text-xs text-left border-collapse">
                                                <thead className="bg-gray-50 text-gray-600 uppercase font-bold sticky top-0">
                                                    <tr>
                                                        <th className="px-3 py-2 border-b">Ngày</th>
                                                        <th className="px-3 py-2 border-b text-center">Loại</th>
                                                        <th className="px-3 py-2 border-b text-right">Số tiền</th>
                                                        <th className="px-3 py-2 border-b">Nội dung</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {data.financialTransactions.map((tx) => (
                                                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-3 py-3 text-gray-500 whitespace-nowrap">
                                                                {dayjs(tx.effectiveDate).format("DD/MM/YYYY HH:mm")}
                                                            </td>
                                                            <td className="px-3 py-3 text-center">
                                                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-bold ${
                                                                    tx.transactionType === "OUT" 
                                                                        ? "bg-red-50 text-red-600" 
                                                                        : "bg-green-50 text-green-600"
                                                                }`}>
                                                                    {tx.transactionType === "OUT" ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                                                    {tx.transactionType}
                                                                </span>
                                                            </td>
                                                            <td className={`px-3 py-3 text-right font-bold ${
                                                                tx.transactionType === "OUT" ? "text-red-600" : "text-green-600"
                                                            }`}>
                                                                {formatNumber(tx.amount)}
                                                            </td>
                                                            <td className="px-3 py-3 text-gray-600 max-w-xs truncate" title={tx.description}>
                                                                {tx.description}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="py-12 text-center text-gray-400 italic">
                                                Không có dữ liệu giao dịch
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-4 py-3 bg-gray-50 border-t flex justify-end">
                                        <button 
                                            onClick={() => setShowTransactionsModal(false)}
                                            className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
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
        </Transition>
    );
};

export default SourceDetailModal;
