import { Fragment, useEffect, useState, useRef, useMemo } from "react";
import { Dialog, Transition, Menu } from "@headlessui/react";
import { X, ChevronLeft, ChevronRight, Save, RotateCw, Plus, Trash2, ChevronDown, Eye, FileSpreadsheet, History, User, Clock, ArrowRight, Upload } from "lucide-react";
import dailySpendApi from "../../api/dailySpendApi";
import invoiceApi from "../../api/invoiceApi";
import customerApi from "../../api/customerApi";
import InvoiceDetailModal from "./InvoiceDetailModal";
import ImportSpendModal from "./ImportSpendModal";
import { toast } from "react-toastify";

const SpendTrackingModal = ({ open, customer, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [showTransactions, setShowTransactions] = useState(false);
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date()); // Keep track of current view (Month/Year)
    const [isDirty, setIsDirty] = useState(false);

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

    // History Sidebar State
    const [showHistorySidebar, setShowHistorySidebar] = useState(false);

    // Import Modal State
    const [showImportModal, setShowImportModal] = useState(false);

    const [auditData, setAuditData] = useState([]);
    const [loadingAudit, setLoadingAudit] = useState(false);
    const [selectedAuditCell, setSelectedAuditCell] = useState(null); // { accountName, date, customerAdsAccountId }

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
            setIsDirty(false); // Reset dirty state on fetch
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

    const handleSaveInvoice = async () => {
        if (!customerId) return;
        setLoading(true);
        try {
            const { year, month } = getMonthParams(currentDate);
            let res;
            // Check if customer belongs to a group based on the grid data
            if (data?.customerGroupId) {
                res = await invoiceApi.generateGroupInvoice(data.customerGroupId, customerId, year, month);
            } else {
                res = await invoiceApi.generateInvoice(customerId, year, month);
            }
            toast.success("Đã lưu thành công");
            setIsDirty(false); // Reset dirty state on save
            // Optionally refetch grid to see if status changed
            fetchGrid(currentDate);
        } catch (error) {
            toast.error(typeof error === 'string' ? error : "Lưu thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleViewInvoice = async () => {
        if (!customerId) return;
        setLoading(true);
        try {
            const { year, month } = getMonthParams(currentDate);
            let res;
            // Use group invoice if customer is in a group
            if (data?.customerGroupId) {
                res = await invoiceApi.getGroupInvoice(data.customerGroupId, year, month);
            } else {
                res = await invoiceApi.getInvoice(customerId, year, month);
            }
            setInvoiceData(res.data || res);
            setInvoiceModalOpen(true);
        } catch (error) {
            toast.error(typeof error === 'string' ? error : "Không lấy được dữ liệu công nợ");
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

    // Keyboard Shortcut: Ctrl + S for Save
    useEffect(() => {
        const handleKeyDownGlobal = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSaveInvoice();
            }
        };

        if (open) {
            window.addEventListener('keydown', handleKeyDownGlobal);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDownGlobal);
        };
    }, [open, handleSaveInvoice]);

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
        // Remove dots (thousands separators) to support copy-paste (e.g., 1.234.545 -> 1234545)
        // Also trim whitespace for cleaner input
        const cleanedValue = value.toString().trim().replace(/\./g, '');

        // Optimistic Update for local state only (typing)
        const numericValue = cleanedValue === "" ? 0 : Number(cleanedValue);

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

            setIsDirty(true); // Mark as modified

            // Recalculate Totals
            return calculateUpdatedSummaries(newData, rowIndex, day, numericValue, oldSpend);
        });
    };

    const saveCellData = async (rowIndex, day, value) => {
        const cleanedValue = value.toString().trim().replace(/\./g, '');
        const numericValue = cleanedValue === "" ? 0 : Number(cleanedValue);
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

    const fetchCellAudit = async (rowIndex, day) => {
        const row = data?.rows[rowIndex];
        if (!row) return;

        const customerAdsAccountId = row.customerAdsAccountId;
        const dateStr = getDateString(data.year, data.month, day);

        setSelectedAuditCell({
            accountName: row.adAccountName,
            date: dateStr,
            customerAdsAccountId
        });

        if (!showHistorySidebar) return; // Only fetch if sidebar is open? 
        // User said: "mỗi lần tôi chọn ô thì nó đều call api để load lên còn về nút có icon history chỉ là bấm vào để ẩn hiển cái đó"
        // So we call it regardless of sidebar state.

        setLoadingAudit(true);
        try {
            const res = await dailySpendApi.getDailySpendAudit(customerAdsAccountId, dateStr);
            setAuditData(res.data || []);
        } catch (error) {
            console.error("Failed to fetch audit history", error);
            setAuditData([]);
        } finally {
            setLoadingAudit(false);
        }
    };

    // Auto-fetch when sidebar opens if a cell is already selected
    useEffect(() => {
        if (showHistorySidebar && selectedAuditCell && auditData.length === 0) {
            const { customerAdsAccountId, date } = selectedAuditCell;
            const refetch = async () => {
                setLoadingAudit(true);
                try {
                    const res = await dailySpendApi.getDailySpendAudit(customerAdsAccountId, date);
                    setAuditData(res.data || []);
                } catch (error) {
                    setAuditData([]);
                } finally {
                    setLoadingAudit(false);
                }
            };
            refetch();
        }
    }, [showHistorySidebar]);

    // Generate Days Array [1, 2, ... daysInMonth]
    const daysArray = useMemo(() => {
        if (!data) return [];
        return Array.from({ length: data.daysInMonth }, (_, i) => i + 1);
    }, [data]);

    return (
        <Fragment>
            <ImportSpendModal
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                customerId={customerId}
                onSuccess={() => fetchGrid(currentDate)}
            />
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
                                                        <span className="font-bold text-gray-900 text-sm leading-tight">{customer.fullCustomerCode}{data?.customerGroupId ? ' ( ' + data?.customerGroupName + ' )' : ''}</span>
                                                        <span className="text-xs text-gray-500 font-mono">{customer.name}</span>
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
                                                {/* Divider */}
                                                <div className="h-6 w-px bg-gray-200 mx-1"></div>

                                                <button
                                                    onClick={() => setShowImportModal(true)}
                                                    className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-md text-blue-500 transition flex items-center gap-1"
                                                    title="Import Excel"
                                                >
                                                    <Upload className="w-5 h-5" />
                                                </button>

                                                {/* Divider */}
                                                <div className="h-6 w-px bg-gray-200 mx-1"></div>

                                                <div className="flex items-center gap-0">
                                                    <button
                                                        onClick={handleSaveInvoice}
                                                        disabled={loading}
                                                        title="Lưu (Ctrl + S)"
                                                        className={`h-8 px-3 rounded-l-md text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm
                              ${isDirty
                                                                ? 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-500/20'
                                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}
                              disabled:opacity-50`}
                                                    >
                                                        <Save className="w-3.5 h-3.5" />
                                                        Lưu
                                                    </button>

                                                    {!data?.customerGroupId && (
                                                        <Menu as="div" className="relative h-8">
                                                            <Menu.Button
                                                                disabled={loading}
                                                                className={`h-full px-1.5 rounded-r-md border-l transition-all disabled:opacity-50
                                    ${isDirty
                                                                        ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
                                                                        : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'}`}
                                                            >
                                                                <ChevronDown className="w-4 h-4" />
                                                            </Menu.Button>

                                                            <Transition
                                                                as={Fragment}
                                                                enter="transition ease-out duration-100"
                                                                enterFrom="transform opacity-0 scale-95"
                                                                enterTo="transform opacity-100 scale-100"
                                                                leave="transition ease-in duration-75"
                                                                leaveFrom="transform opacity-100 scale-100"
                                                                leaveTo="transform opacity-0 scale-95"
                                                            >
                                                                <Menu.Items className="absolute right-0 mt-1 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[70]">
                                                                    <div className="py-1">
                                                                        <Menu.Item>
                                                                            {({ active }) => (
                                                                                <button
                                                                                    onClick={handleViewInvoice}
                                                                                    className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                                                        } flex w-full items-center px-4 py-2 text-xs font-medium gap-2`}
                                                                                >
                                                                                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                                                                                    Chi tiết công nợ
                                                                                </button>
                                                                            )}
                                                                        </Menu.Item>
                                                                    </div>
                                                                </Menu.Items>
                                                            </Transition>
                                                        </Menu>
                                                    )}
                                                </div>

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
                                                            className={`flex flex-col relative border-r border-gray-300 pr-4 mr-2 ${data?.customerGroupId
                                                                ? 'opacity-50 cursor-not-allowed'
                                                                : 'cursor-pointer group'
                                                                }`}
                                                            onClick={data?.customerGroupId ? undefined : () => setShowTransactions(true)}
                                                        >
                                                            <span className={`text-[10px] uppercase text-gray-500 font-bold flex items-center gap-1 mb-0.5 ${!data?.customerGroupId && 'group-hover:text-blue-600 transition-colors'
                                                                }`}>
                                                                Khách bank
                                                                {!data?.customerGroupId && (
                                                                    <span className="bg-blue-100 text-blue-600 rounded-full px-1.5 py-0.5 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">Chi tiết</span>
                                                                )}
                                                            </span>
                                                            <div className="flex gap-4">
                                                                <div className="flex flex-col border-l-2 border-green-200 pl-1.5">
                                                                    <span className="text-[9px] text-gray-400 uppercase font-medium leading-tight">Tự động</span>
                                                                    <span className={`text-sm font-bold text-green-700 underline decoration-dotted decoration-green-300 underline-offset-4 ${!data?.customerGroupId && 'group-hover:text-blue-700 transition-all'
                                                                        }`}>
                                                                        {formatCurrency((data?.transactions || []).reduce((acc, tx) => acc + (tx.transactionType === "IN" ? tx.amount : -tx.amount), 0))}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-col border-l-2 border-teal-200 pl-1.5">
                                                                    <span className="text-[9px] text-gray-400 uppercase font-medium leading-tight">Thủ công</span>
                                                                    <span className={`text-sm font-bold text-teal-700 underline decoration-dotted decoration-teal-300 underline-offset-4 ${!data?.customerGroupId && 'group-hover:text-blue-700 transition-all'
                                                                        }`}>
                                                                        {formatCurrency(manualPayments.reduce((acc, curr) => acc + curr.amount, 0))}
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
                                                        <div className="flex flex-col border-l border-gray-300 pl-6">
                                                            <span className="text-[10px] uppercase text-orange-500 font-bold">Chiết khấu ngưỡng</span>
                                                            <span className="text-sm font-bold text-orange-600">
                                                                {formatCurrency(data.balancePanel.thresholdCredit || 0)}
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

                                                <div className="ml-auto flex items-center pr-2">
                                                    <button
                                                        onClick={() => setShowHistorySidebar(!showHistorySidebar)}
                                                        className={`p-2 rounded-lg transition-all flex items-center gap-2 border ${showHistorySidebar
                                                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                            }`}
                                                        title="Lịch sử thay đổi"
                                                    >
                                                        <History className={`w-4 h-4 ${showHistorySidebar ? 'animate-pulse' : ''}`} />
                                                    </button>
                                                </div>
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
                                                                        {row.paymentMode === 3 && (
                                                                            <span className="text-[9px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200 font-medium whitespace-nowrap">
                                                                                Thẻ đầu tổng
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
                                                                if (startAtDate) startAtDate.setUTCHours(0, 0, 0, 0);
                                                                if (endAtDate) endAtDate.setUTCHours(0, 0, 0, 0);

                                                                let isDisabled = false;
                                                                const isLocked = data?.balancePanel?.isLocked || false;

                                                                if (isLocked) isDisabled = true;
                                                                if (startAtDate && cellDate < startAtDate) isDisabled = true;
                                                                if (endAtDate && cellDate > endAtDate) isDisabled = true;

                                                                return (
                                                                    <td key={day} className={`border-r border-gray-200 p-0 relative h-8 ${isDisabled ? 'bg-gray-100' : ''}`}>
                                                                        <input
                                                                            type="text"
                                                                            inputMode="numeric"
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
                                                                            onFocus={() => fetchCellAudit(rowIndex, day)}
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

                                    {/* History Sidebar */}
                                    <Transition
                                        show={showHistorySidebar}
                                        as={Fragment}
                                        enter="transform transition ease-in-out duration-300"
                                        enterFrom="translate-x-full"
                                        enterTo="translate-x-0"
                                        leave="transform transition ease-in-out duration-300"
                                        leaveFrom="translate-x-0"
                                        leaveTo="translate-x-full"
                                    >
                                        <div className="absolute top-0 right-0 w-80 h-full bg-white border-l border-gray-200 z-50 flex flex-col shadow-2xl">
                                            <div className="flex-none p-4 border-b bg-gray-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <History className="w-4 h-4 text-blue-600" />
                                                    <h3 className="font-bold text-gray-800 text-sm italic">Lịch sử thay đổi</h3>
                                                </div>
                                                <button
                                                    onClick={() => setShowHistorySidebar(false)}
                                                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </div>

                                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                                {!selectedAuditCell ? (
                                                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                            <History className="w-6 h-6 text-gray-300" />
                                                        </div>
                                                        <p className="text-sm text-gray-500 font-medium">Chọn một ô chi tiêu để xem lịch sử</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">Đang xem</p>
                                                            <p className="text-xs font-bold text-gray-900 leading-tight">{selectedAuditCell.accountName}</p>
                                                            <p className="text-[11px] text-gray-500 mt-1 font-mono">{selectedAuditCell.date}</p>
                                                        </div>

                                                        {loadingAudit ? (
                                                            <div className="flex flex-col items-center justify-center py-12">
                                                                <RotateCw className="w-6 h-6 text-blue-500 animate-spin mb-2" />
                                                                <span className="text-xs text-gray-400">Đang tải lịch sử...</span>
                                                            </div>
                                                        ) : auditData.length === 0 ? (
                                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                                <p className="text-xs text-gray-400 italic">Không có bản ghi thay đổi nào cho ô này</p>
                                                            </div>
                                                        ) : (
                                                            <div className="divide-y divide-gray-100 border-t border-b border-gray-100 -mx-4">
                                                                {auditData.map((item, index) => (
                                                                    <div key={index} className="px-4 py-2 hover:bg-gray-50 transition-colors">
                                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                                <span className={`flex-none text-[9px] font-bold px-1 rounded-sm uppercase ${item.action === 'Insert' ? 'text-green-600 bg-green-50' :
                                                                                    item.action === 'Update' ? 'text-blue-600 bg-blue-50' :
                                                                                        'text-red-600 bg-red-50'
                                                                                    }`}>
                                                                                    {item.action === 'Insert' ? 'Thêm' : item.action === 'Update' ? 'Sửa' : 'Xóa'}
                                                                                </span>
                                                                                <span className="text-[11px] text-gray-700 font-bold truncate">
                                                                                    {item.changedByName || "Hệ thống"}
                                                                                </span>
                                                                            </div>
                                                                            <span className="flex-none text-[9px] text-gray-400 font-mono">
                                                                                {new Date(item.changedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {new Date(item.changedAt).toLocaleDateString('vi-VN')}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex items-center gap-1.5 text-[11px]">
                                                                            <span className="text-gray-400 line-through">
                                                                                {formatCurrency(item.oldSpend || 0)}
                                                                            </span>
                                                                            <ArrowRight className="w-2.5 h-2.5 text-gray-300" />
                                                                            <span className="font-bold text-gray-900">
                                                                                {formatCurrency(item.newSpend || 0)}
                                                                            </span>
                                                                        </div>

                                                                        {item.reason && (
                                                                            <p className="mt-1 text-[10px] text-gray-500 italic leading-tight">
                                                                                "{item.reason}"
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Transition>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>

                <InvoiceDetailModal
                    open={invoiceModalOpen}
                    onClose={() => setInvoiceModalOpen(false)}
                    invoiceData={invoiceData}
                    customer={customer}
                    onConfirmSuccess={() => fetchGrid(currentDate)}
                />
            </Transition>
        </Fragment>
    );
};

export default SpendTrackingModal;
