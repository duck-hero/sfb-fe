import { Fragment, useEffect, useState, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, ChevronLeft, ChevronRight, RotateCw, Eye, BarChart3, Plus, Save, Trash2, FileSpreadsheet } from "lucide-react";
import customerGroupApi from "../../api/customerGroupApi";
import invoiceApi from "../../api/invoiceApi";
import { toast } from "react-toastify";
import InvoiceDetailModal from "./InvoiceDetailModal";

const GroupSpendTrackingModal = ({ open, group, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [showTransactions, setShowTransactions] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isDirty, setIsDirty] = useState(false); // For consistency, though grid is read-only for now

    // Invoice modal states
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const [loadingInvoice, setLoadingInvoice] = useState(false);

    // Manual payment states
    const [manualPayments, setManualPayments] = useState([]);
    const [loadingManual, setLoadingManual] = useState(false);
    const [showManualForm, setShowManualForm] = useState(false);
    const [manualFormData, setManualFormData] = useState({
        amount: "",
        date: new Date().toISOString().split('T')[0],
        note: ""
    });

    const groupId = group?.id;

    // Helper to format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN").format(value || 0);
    };

    const getMonthParams = (date) => {
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1 // 1-12
        };
    };

    const fetchGrid = async (date) => {
        if (!groupId) return;
        setLoading(true);
        try {
            const { year, month } = getMonthParams(date);
            const res = await customerGroupApi.getSpendGrid(groupId, year, month);
            setData(res.data || res);
        } catch (error) {
            toast.error("Không tải được bảng chi tiêu nhóm");
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchManualPayments = async (date) => {
        if (!groupId) return;
        try {
            const { year, month } = getMonthParams(date);
            const res = await customerGroupApi.getManualPayments(groupId, year, month);
            if (res.success) {
                setManualPayments(res.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch manual payments", error);
        }
    };

    const handleAddManualPayment = async (e) => {
        e.preventDefault();
        if (!groupId) return;
        setLoadingManual(true);
        try {
            const { year, month } = getMonthParams(currentDate);
            // Format date to ISO string with Z (end of day or just as is)
            const dateObj = new Date(manualFormData.date);

            const payload = {
                customerGroupId: groupId,
                amount: parseFloat(manualFormData.amount),
                date: dateObj.toISOString(),
                month: month,
                year: year,
                note: manualFormData.note
            };
            const res = await customerGroupApi.createManualPayment(payload);
            if (res.success) {
                toast.success("Đã lưu giao dịch thủ công");
                setManualFormData({
                    amount: "",
                    date: new Date().toISOString().split('T')[0],
                    note: ""
                });
                setShowManualForm(false);
                fetchManualPayments(currentDate);
                fetchGrid(currentDate); // Refresh grid to update balance panel
            }
        } catch (error) {
            toast.error(typeof error === 'string' ? error : "Lưu thất bại");
        } finally {
            setLoadingManual(false);
        }
    };

    const handleDeleteManualPayment = async (paymentId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) return;
        try {
            const res = await customerGroupApi.deleteManualPayment(paymentId);
            if (res.success) {
                toast.success("Đã xóa giao dịch");
                fetchManualPayments(currentDate);
                fetchGrid(currentDate);
            }
        } catch (error) {
            toast.error(typeof error === 'string' ? error : "Xóa thất bại");
        }
    };

    const handleViewInvoice = async () => {
        if (!groupId) return;
        setLoadingInvoice(true);
        try {
            const { year, month } = getMonthParams(currentDate);
            const res = await invoiceApi.getGroupInvoice(groupId, year, month);

            if (res.success && res.data) {
                setInvoiceData(res.data);
                setShowInvoiceModal(true);
            } else {
                toast.info(`Chưa có dữ liệu công nợ chốt cho tháng ${month}/${year}`);
            }
        } catch (error) {
            console.error("Failed to fetch group invoice", error);
            toast.error("Không thể lấy thông tin công nợ");
        } finally {
            setLoadingInvoice(false);
        }
    };


    useEffect(() => {
        if (open && groupId) {
            fetchGrid(currentDate);
            fetchManualPayments(currentDate);
        } else {
            setData(null);
            setManualPayments([]);
        }
    }, [open, groupId, currentDate]);

    const handleMonthChange = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    // Generate Days Array [1, 2, ... daysInMonth]
    const daysArray = useMemo(() => {
        if (!data) return [];
        return Array.from({ length: data.daysInMonth }, (_, i) => i + 1);
    }, [data]);

    // Group rows by customer
    const groupedData = useMemo(() => {
        if (!data || !data.rows) return [];

        const groups = {};
        data.rows.forEach(row => {
            const cId = row.customerId || 'unknown';
            if (!groups[cId]) {
                groups[cId] = {
                    customerId: cId,
                    customerName: row.customerName || 'Không xác định',
                    rows: [],
                    subTotals: {
                        rowTotal: 0,
                        daily: {}
                    }
                };
            }
            groups[cId].rows.push(row);
            groups[cId].subTotals.rowTotal += (row.rowTotal || 0);

            if (row.cells) {
                Object.entries(row.cells).forEach(([day, cell]) => {
                    groups[cId].subTotals.daily[day] = (groups[cId].subTotals.daily[day] || 0) + (cell.spend || 0);
                });
            }
        });

        return Object.values(groups);
    }, [data]);

    return (
        <>
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
                                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <Dialog.Title className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                                    Chi tiêu nhóm
                                                </Dialog.Title>

                                                {group && (
                                                    <div className="flex flex-col border-l pl-4 border-gray-300">
                                                        <span className="font-bold text-gray-900 text-sm leading-tight">{group.name}</span>
                                                        <span className="text-xs text-gray-500">ID: #{group.id}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center bg-gray-50 rounded-md border border-gray-200 px-1 ml-2">
                                                    <button onClick={() => handleMonthChange(-1)} className="p-1 hover:bg-gray-200 rounded text-gray-600 transition">
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <span className="mx-2 font-semibold text-gray-700 text-sm min-w-[80px] text-center">
                                                        {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
                                                    </span>
                                                    <button onClick={() => handleMonthChange(1)} className="p-1 hover:bg-gray-200 rounded text-gray-600 transition">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleViewInvoice}
                                                    disabled={loadingInvoice || !data}
                                                    className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                                                    title="Xem chi tiết công nợ chốt tháng"
                                                >
                                                    {loadingInvoice ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                                                    Chi tiết công nợ
                                                </button>

                                                {data?.googleSheetId && (
                                                    <a
                                                        href={`https://docs.google.com/spreadsheets/d/${data.googleSheetId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 hover:bg-green-50 text-green-600 rounded-md transition"
                                                        title="Mở Google Sheet"
                                                    >
                                                        <FileSpreadsheet className="w-5 h-5" />
                                                    </a>
                                                )}

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

                                        {/* Financial Summaries Panel */}
                                        {(data?.monthlySummary || data?.balancePanel) && (
                                            <div className="flex items-center px-4 py-2 bg-[#f8f9fa] gap-6 overflow-x-auto whitespace-nowrap border-b border-gray-200">
                                                {data?.balancePanel && (
                                                    <div className="flex gap-6 items-center border-r border-gray-300 pr-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase text-gray-500 font-bold">Dư nợ đầu kì</span>
                                                            <span className={`text-sm font-bold ${data.balancePanel.openingBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                                {formatCurrency(data.balancePanel.openingBalance)}
                                                            </span>
                                                        </div>

                                                        <div
                                                            className="flex flex-col cursor-pointer group relative"
                                                            onClick={() => setShowTransactions(true)}
                                                        >
                                                            <span className="text-[10px] uppercase text-gray-500 font-bold group-hover:text-blue-600 transition-colors flex items-center gap-1 mb-0.5">
                                                                Đã thanh toán
                                                                <span className="bg-blue-100 text-blue-600 rounded-full px-1.5 py-0.5 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">Chi tiết</span>
                                                            </span>
                                                            <div className="flex gap-4">
                                                                <div className="flex flex-col border-l-2 border-green-200 pl-1.5">
                                                                    <span className="text-[9px] text-gray-400 uppercase font-medium leading-tight">Bank</span>
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
                                                            <span className="text-[10px] uppercase text-gray-500 font-bold">Dư nợ cuối kì</span>
                                                            <span className={`text-sm font-bold ${data.balancePanel.closingBalance < 0 ? 'text-red-600' : 'text-purple-700'}`}>
                                                                {formatCurrency(data.balancePanel.closingBalance)}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-col border-l border-gray-300 pl-6">
                                                            <span className="text-[10px] uppercase text-orange-500 font-bold">Chiết khấu ngưỡng</span>
                                                            <span className="text-sm font-bold text-orange-600">
                                                                {formatCurrency(data.balancePanel.thresholdCredit || 0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {data?.monthlySummary && (
                                                    <div className="flex gap-6 items-center">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase text-gray-500 font-bold">Tổng Chi tiêu</span>
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
                                                            <span className="text-[10px] uppercase text-gray-500 font-bold">Tổng cộng</span>
                                                            <span className="text-sm font-bold text-blue-700">
                                                                {formatCurrency(data.monthlySummary.amountDue)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Transactions List (Nested Modal-like Overlay) */}
                                        <Transition appear show={showTransactions} as={Fragment}>
                                            <Dialog as="div" className="relative z-[60]" onClose={() => setShowTransactions(false)}>
                                                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                    <div className="fixed inset-0 bg-black/25" />
                                                </Transition.Child>

                                                <div className="fixed inset-0 overflow-y-auto">
                                                    <div className="flex min-h-full items-center justify-center p-4">
                                                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                                            <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all h-[80vh] flex flex-col border border-gray-100">
                                                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                                                                    <div className="flex flex-col">
                                                                        <h3 className="text-lg font-bold text-gray-800">Chi tiết thanh toán</h3>
                                                                        <span className="text-xs text-gray-500 font-normal">Tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()}</span>
                                                                    </div>
                                                                    <button onClick={() => setShowTransactions(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                                                        <X className="w-6 h-6" />
                                                                    </button>
                                                                </div>

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
                                                                        <div className="flex-1 overflow-y-auto">
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
                                                                                                        {new Date(tx.effectiveDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
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
                                                                            <span className="text-sm font-bold text-blue-700">
                                                                                {formatCurrency((data?.transactions || []).reduce((acc, tx) => acc + (tx.transactionType === "IN" ? tx.amount : -tx.amount), 0))}
                                                                            </span>
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
                                                                                {showManualForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
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
                                                                                            onChange={(e) => setManualFormData({ ...manualFormData, amount: e.target.value })}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="flex flex-col gap-1">
                                                                                        <label className="text-[10px] font-bold text-teal-700 uppercase">Ngày</label>
                                                                                        <input
                                                                                            type="date"
                                                                                            required
                                                                                            className="px-2 py-1.5 rounded-lg border border-teal-200 text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                                                                                            value={manualFormData.date}
                                                                                            onChange={(e) => setManualFormData({ ...manualFormData, date: e.target.value })}
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
                                                                                        onChange={(e) => setManualFormData({ ...manualFormData, note: e.target.value })}
                                                                                    />
                                                                                </div>
                                                                                <button
                                                                                    type="submit"
                                                                                    disabled={loadingManual}
                                                                                    className="w-full py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 shadow-sm transition-colors flex items-center justify-center gap-2"
                                                                                >
                                                                                    {loadingManual ? <RotateCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                                                                    Lưu giao dịch
                                                                                </button>
                                                                            </form>
                                                                        )}

                                                                        <div className="flex-1 overflow-y-auto">
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
                                                                                                        <Trash2 className="w-3.5 h-3.5" />
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

                                    {/* Main Content - Grid Table */}
                                    <div className="flex-1 overflow-auto relative bg-gray-50/30">
                                        {loading ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-50">
                                                <RotateCw className="w-10 h-10 animate-spin text-blue-500" />
                                            </div>
                                        ) : !data || !data.rows ? (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm italic py-20">Không có dữ liệu chi tiêu trong tháng này</div>
                                        ) : (
                                            <table className="border-collapse w-full text-[11px]">
                                                <thead className="bg-white sticky top-0 z-40 shadow-sm text-gray-700">
                                                    <tr>
                                                        <th className="sticky left-0 z-50 bg-[#fff3cd] border-b border-r border-orange-100 px-3 py-2.5 min-w-[220px] text-left font-bold uppercase tracking-wider text-orange-800">
                                                            Tài khoản / Khách hàng
                                                        </th>
                                                        <th className="sticky left-[220px] z-50 bg-[#fff3cd] border-b border-r border-orange-100 px-3 py-2.5 w-[110px] text-right font-bold uppercase tracking-wider text-orange-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                            Tổng cộng
                                                        </th>
                                                        {daysArray.map(day => (
                                                            <th key={day} className="border-b border-r border-gray-200 px-1 py-2 min-w-[65px] text-center font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                                                                {day}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {groupedData.map((group) => (
                                                        <Fragment key={group.customerId}>
                                                            {/* Customer Header Row */}
                                                            <tr className="bg-blue-50/50 border-y-2 border-blue-100 z-10 sticky top-[41px]">
                                                                <td className="sticky left-0 z-30 bg-blue-100 border-r border-blue-200 px-3 py-2 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                                                        <span className="font-black text-blue-900 uppercase">Khách hàng: {group.customerName}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="sticky left-[220px] z-30 bg-blue-100 border-r border-blue-200 px-3 py-2 text-right font-black text-blue-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                                    {formatCurrency(group.subTotals.rowTotal)}
                                                                </td>
                                                                {daysArray.map(day => (
                                                                    <td key={day} className="border-r border-blue-100 px-1 py-2 text-center font-black text-blue-800">
                                                                        {group.subTotals.daily[day] ? formatCurrency(group.subTotals.daily[day]) : '-'}
                                                                    </td>
                                                                ))}
                                                            </tr>

                                                            {/* Account Rows for this customer */}
                                                            {group.rows.map((row, rowIndex) => (
                                                                <tr key={`${row.customerAdsAccountId}-${rowIndex}`} className="hover:bg-blue-50/40 transition-colors group">
                                                                    {/* Info Column */}
                                                                    <td className="sticky left-0 z-20 bg-[#fff9db] group-hover:bg-[#fff9db] border-r border-orange-50 px-3 py-2 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                                        <div className="flex flex-col gap-0.5 ml-4 border-l-2 border-blue-200 pl-3">
                                                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                                                <span className="font-bold text-gray-800 truncate" title={row.adAccountName}>
                                                                                    {row.adAccountName}
                                                                                </span>
                                                                            </div>
                                                                            <span className="text-[10px] text-gray-500 font-mono tracking-tighter">{row.adAccountIdNumber || row.adAccountId}</span>

                                                                            <div className="flex items-center gap-1 mt-1">
                                                                                {row.paymentMode === 1 && (
                                                                                    <span className="text-[8px] bg-purple-100 text-purple-700 px-1 py-0.5 rounded font-bold uppercase">Thẻ khách</span>
                                                                                )}
                                                                                {row.paymentMode === 2 && (
                                                                                    <span className="text-[8px] bg-orange-100 text-orange-700 px-1 py-0.5 rounded font-bold uppercase">Thẻ HDG</span>
                                                                                )}
                                                                                {row.paymentMode === 3 && (
                                                                                    <span className="text-[8px] bg-teal-100 text-teal-700 px-1 py-0.5 rounded font-bold uppercase">Thẻ đầu tổng</span>
                                                                                )}
                                                                                <span className="text-[9px] bg-blue-50 text-blue-700 px-1 py-0.5 rounded font-bold border border-blue-100">{(row.feePercent * 100).toFixed(1)}%</span>
                                                                            </div>
                                                                        </div>
                                                                    </td>

                                                                    {/* Row Total */}
                                                                    <td className="sticky left-[220px] z-20 bg-[#fff9db] group-hover:bg-[#fff9db] border-r border-orange-100 px-3 py-2 text-right font-black text-gray-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                                        {formatCurrency(row.rowTotal)}
                                                                    </td>

                                                                    {/* Day Cells */}
                                                                    {daysArray.map(day => {
                                                                        const cell = row.cells?.[day] || {};
                                                                        const spend = cell.spend || 0;
                                                                        return (
                                                                            <td key={day} className={`border-r border-gray-100 px-1 py-2 text-center group-hover:bg-blue-50/20 transition-colors ${spend > 0 ? 'bg-green-50/10' : ''}`}>
                                                                                <span className={`font-medium ${spend > 0 ? 'text-blue-600 font-bold' : 'text-gray-300'}`}>
                                                                                    {spend > 0 ? formatCurrency(spend) : '-'}
                                                                                </span>
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            ))}
                                                        </Fragment>
                                                    ))}

                                                    {/* Summary Totals Row */}
                                                    <tr className="bg-gray-100 z-30 sticky bottom-0 border-t-2 border-gray-300">
                                                        <td className="sticky left-0 bg-gray-100 border-r border-gray-300 px-3 py-3 text-xs font-black text-gray-700 uppercase">
                                                            Tổng chi tiêu ngày
                                                        </td>
                                                        <td className="sticky left-[220px] bg-gray-100 border-r border-gray-300 px-3 py-3 text-right font-black text-blue-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                            {formatCurrency(data.monthlySummary?.totalSpend)}
                                                        </td>
                                                        {daysArray.map(day => (
                                                            <td key={day} className="border-r border-gray-200 px-1 py-3 text-center bg-gray-50 font-black text-gray-800">
                                                                {data.dailyTotals?.[day] ? formatCurrency(data.dailyTotals[day]) : '-'}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                </tbody>
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

                                    {/* Footer Section - Legend */}
                                    <div className="flex-none bg-white p-2 border-t flex justify-between items-center px-4">
                                        <div className="flex items-center gap-4 text-[10px] text-gray-500 font-medium">
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-orange-100 border border-orange-200"></div>
                                                <span>Thẻ HDG</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-purple-100 border border-purple-200"></div>
                                                <span>Thẻ khách</span>
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-gray-400 italic">
                                            Dữ liệu được tổng hợp từ tất cả khách hàng trong nhóm.
                                        </div>
                                    </div>

                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Invoice Detail Modal */}
            <InvoiceDetailModal
                open={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                invoiceData={invoiceData}
                group={group}
                onConfirmSuccess={() => {
                    fetchGrid(currentDate);
                }}
            />
        </>
    );
};

export default GroupSpendTrackingModal;
