import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { Loader2, TrendingUp, TrendingDown, RefreshCw, ChevronDown, ChevronUp, GripVertical, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import bankAccountApi from "../../api/bankAccountApi";
import { toast } from "react-toastify";

const TransactionStatistics = () => {
    const [year, setYear] = useState(dayjs().year());
    const [month, setMonth] = useState(dayjs().month() + 1);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [reports, setReports] = useState({}); // Map: bankAccountId -> { loading, data, error }
    const [expandedIds, setExpandedIds] = useState([]); // Set of expanded bankAccountIds
    const [initLoading, setInitLoading] = useState(false);
    
    // Balance Edit State
    const [editingBalanceId, setEditingBalanceId] = useState(null);
    const [newOpeningBalance, setNewOpeningBalance] = useState("");
    const [savingBalance, setSavingBalance] = useState(false);

    // Drag and Drop state
    const dragItem = useRef();
    const dragOverItem = useRef();

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

    // Fetch list of bank accounts
    const fetchBankAccounts = async () => {
        setInitLoading(true);
        try {
            const res = await bankAccountApi.getBankList(1, 100);
            const accounts = res.data || res.items || [];
            if(accounts.length > 0) {
                 // Sort or default order? Let's just keep API order initially.
                 setBankAccounts(accounts);
            }
             setReports({}); // Reset reports on new account list or just keep cache? 
             // If month/year changed, we should probably clear reports.
        } catch (error) {
            console.error("Failed to fetch bank accounts", error);
            toast.error("Không thể tải danh sách tài khoản");
        } finally {
            setInitLoading(false);
        }
    };

    const fetchReportForAccount = async (bankAccountId, type) => {
        // If already loaded for this month/year, don't refetch unless forced
        setReports(prev => ({
            ...prev,
            [bankAccountId]: { ...prev[bankAccountId], loading: true, error: null }
        }));

        try {
            const res = await bankAccountApi.generateBankAccountReport(bankAccountId, month, year, type);
            if (res.success) {
                setReports(prev => ({
                    ...prev,
                    [bankAccountId]: { loading: false, data: res.data, error: null }
                }));
            } else {
                 setReports(prev => ({
                    ...prev,
                    [bankAccountId]: { loading: false, data: null, error: "Không có dữ liệu" }
                }));
            }
        } catch (error) {
            console.error(`Failed to fetch report for account ${bankAccountId}`, error);
            setReports(prev => ({
                ...prev,
                [bankAccountId]: { loading: false, data: null, error: "Lỗi tải dữ liệu" }
            }));
        }
    };
    
    const handleEditBalance = (accountId, currentBalance) => {
        setEditingBalanceId(accountId);
        setNewOpeningBalance(currentBalance?.toString() || "0");
    };

    const handleSaveOpeningBalance = async (accountId, type) => {
        setSavingBalance(true);
        try {
            const balanceValue = parseFloat(newOpeningBalance);
            if (isNaN(balanceValue)) {
                toast.error("Vui lòng nhập số hợp lệ");
                return;
            }

            const res = await bankAccountApi.generateBankAccountReport(accountId, month, year, type, balanceValue);
            if (res.success) {
                toast.success("Cập nhật số dư thành công");
                setReports(prev => ({
                    ...prev,
                    [accountId]: { loading: false, data: res.data, error: null }
                }));
                setEditingBalanceId(null);
            } else {
                toast.error("Cập nhật thất bại");
            }
        } catch (error) {
            console.error("Failed to update opening balance", error);
            toast.error("Lỗi cập nhật số dư");
        } finally {
            setSavingBalance(false);
        }
    };

    useEffect(() => {
        fetchBankAccounts();
        setReports({}); // Clear reports when filters change
        setExpandedIds([]); // Collapse all
    }, [month, year]);

    const handleToggleExpand = (account) => {
        const isExpanded = expandedIds.includes(account.id);
        
        if (isExpanded) {
            setExpandedIds(prev => prev.filter(id => id !== account.id));
        } else {
            setExpandedIds(prev => [...prev, account.id]);
            // Logic to fetch if not present
            const currentReport = reports[account.id];
            if (!currentReport || (!currentReport.data && !currentReport.loading && !currentReport.error)) {
                 fetchReportForAccount(account.id, account.type);
            }
        }
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return "0";
        return new Intl.NumberFormat("vi-VN", {
            style: "decimal",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Drag and Drop Handlers
    const dragStart = (e, position) => {
        dragItem.current = position;
        // e.target.classList.add("opacity-50"); 
    };

    const dragEnter = (e, position) => {
        dragOverItem.current = position;
        // visual feedback could go here
    };

    const drop = (e) => {
        const copyListItems = [...bankAccounts];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setBankAccounts(copyListItems);
    };

    return (
        <div className="space-y-6 p-4 bg-gray-50 min-h-screen">
            {/* Filter Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-800">Thống kê giao dịch</h2>
                    <div className="h-6 w-px bg-gray-200 mx-2"></div>
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
                
                <button
                    onClick={() => { fetchBankAccounts(); setExpandedIds([]); }}
                    disabled={initLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${initLoading ? 'animate-spin' : ''}`} />
                    <span>Làm mới</span>
                </button>
            </div>

            {/* List of Bank Accounts Reports - Row Layout */}
            {initLoading && bankAccounts.length === 0 ? (
                 <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : (
                <div className="space-y-4 pb-20">
                    {bankAccounts.map((account, index) => {
                        const reportState = reports[account.id] || { loading: false, data: null };
                        const data = reportState.data;
                        const loading = reportState.loading;
                        const error = reportState.error;
                        const isExpanded = expandedIds.includes(account.id);

                        return (
                            <div 
                                key={account.id} 
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md h-fit"
                                draggable
                                onDragStart={(e) => dragStart(e, index)}
                                onDragEnter={(e) => dragEnter(e, index)}
                                onDragEnd={drop}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                {/* Left Column: Account Info */}
                                <div 
                                    className={`${isExpanded ? 'md:w-1/3 border-b md:border-b-0 md:border-r' : 'w-full'} bg-gray-50 p-3 flex flex-col gap-2 cursor-pointer select-none relative group transition-all duration-300`}
                                    onClick={() => handleToggleExpand(account)}
                                >
                                    <div className="absolute top-1/2 -translate-y-1/2 left-2 cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-gray-500 p-1 transition-colors" >
                                        <GripVertical size={20} />
                                    </div>

                                    <div className="pl-8 flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[9px] shrink-0 shadow-inner p-1 text-center leading-tight overflow-hidden break-words">
                                            {account.bankCode || "BANK"}
                                        </div>
                                        <div className="overflow-hidden flex flex-col">
                                            {account.code && (
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{account.code}</span>
                                            )}
                                            <h3 className="font-bold text-gray-800 text-sm truncate" title={account.accountBankNumber}>{account.accountBankNumber}</h3>
                                            <p className="text-[10px] text-gray-500 uppercase truncate" title={account.accountBankHolderName}>{account.accountBankHolderName}</p>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="pl-6 mt-auto flex items-center justify-between text-xs text-blue-600 font-medium">
                                            <span>Đang xem chi tiết</span>
                                            <ChevronUp size={16}/>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Details Content */}
                                {isExpanded && (
                                    <div className="md:w-2/3 p-0 min-h-[120px] relative bg-white animate-in slide-in-from-left-2 fade-in duration-300">
                                         {loading ? (
                                                <div className="absolute inset-0 flex justify-center items-center text-gray-400 gap-2 bg-white/80 z-10">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span className="text-sm">Đang tải dữ liệu...</span>
                                                </div>
                                            ) : error ? (
                                                <div className="absolute inset-0 flex justify-center items-center text-gray-400 text-sm italic">
                                                    {error || "Lỗi tải"}
                                                </div>
                                            ) : data ? (
                                                <div className="p-4 h-full flex flex-col">
                                                    {/* Top Stats Row */}
                                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                                         <div className="text-center relative">
                                                            <span className="text-[10px] text-gray-500 block uppercase tracking-wider">Dư đầu kỳ</span>
                                                            <div className="flex items-center justify-center gap-2 mt-1 relative group/edit">
                                                                <span className="font-semibold text-gray-800 text-sm">{formatCurrency(data.openingBalance)}</span>
                                                                <button 
                                                                    onClick={() => handleEditBalance(account.id, data.openingBalance)}
                                                                    className="opacity-0 group-hover/edit:opacity-100 transition-opacity text-blue-500 hover:text-blue-700 p-0.5 rounded"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                                                                </button>

                                                                {/* Edit Popup */}
                                                                {editingBalanceId === account.id && (
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white p-2 rounded-lg shadow-xl border border-gray-200 z-50 flex items-center gap-2 w-48">
                                                                        <input 
                                                                            type="number" 
                                                                            autoFocus
                                                                            value={newOpeningBalance}
                                                                            onChange={(e) => setNewOpeningBalance(e.target.value)}
                                                                            className="w-full text-xs border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') handleSaveOpeningBalance(account.id, account.type);
                                                                                if (e.key === 'Escape') setEditingBalanceId(null);
                                                                            }}
                                                                        />
                                                                        <button 
                                                                            onClick={() => handleSaveOpeningBalance(account.id, account.type)}
                                                                            disabled={savingBalance}
                                                                            className="text-green-600 hover:bg-green-50 p-1 rounded"
                                                                        >
                                                                            {savingBalance ? <Loader2 size={14} className="animate-spin"/> : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => setEditingBalanceId(null)}
                                                                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                         </div>
                                                         <div className="text-center">
                                                             <div className="flex items-center justify-center gap-1 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                                                                 <TrendingUp size={12}/> IN
                                                             </div>
                                                            <span className="font-bold text-green-600 text-sm block mt-1">+{formatCurrency(data.totalDebit)}</span>
                                                         </div>
                                                         <div className="text-center">
                                                             <div className="flex items-center justify-center gap-1 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                                                                 <TrendingDown size={12}/> OUT
                                                             </div>
                                                            <span className="font-bold text-red-600 text-sm block mt-1">-{formatCurrency(data.totalCredit)}</span>
                                                         </div>
                                                         <div className="text-center">
                                                            <span className="text-[10px] text-blue-600 block uppercase tracking-wider">Dư cuối kỳ</span>
                                                            <span className="font-bold text-blue-700 text-sm block mt-1">{formatCurrency(data.closingBalance)}</span>
                                                         </div>
                                                    </div>

                                                    <div className="h-px bg-gray-100 mb-4 w-full"></div>

                                                    {/* Lines Table */}
                                                    <div className="flex-1 overflow-auto max-h-[300px] border border-gray-100 rounded-lg pr-1 custom-scrollbar">
                                                        {data.lines && data.lines.length > 0 ? (
                                                            <table className="w-full text-xs text-left relative">
                                                                <thead className="text-[10px] text-gray-500 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
                                                                    <tr>
                                                                        <th className="px-3 py-2 font-medium bg-gray-50">Đối tượng hoạch toán</th>
                                                                        <th className="px-3 py-2 font-medium text-right text-green-600 bg-gray-50">IN</th>
                                                                        <th className="px-3 py-2 font-medium text-right text-red-600 bg-gray-50">OUT</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {data.lines.map((line) => (
                                                                        <tr key={line.id} className="hover:bg-gray-50">
                                                                            <td className="px-3 py-2 font-medium text-gray-700">
                                                                                {line.accountingObject || "Chưa xác định"}
                                                                            </td>
                                                                            <td className="px-3 py-2 text-right font-medium text-green-600">
                                                                                {line.debitAmount > 0 ? formatCurrency(line.debitAmount) : "-"}
                                                                            </td>
                                                                            <td className="px-3 py-2 text-right font-medium text-red-600">
                                                                                {line.creditAmount > 0 ? formatCurrency(line.creditAmount) : "-"}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center h-20 text-gray-400 text-xs">
                                                                <span>Không có phát sinh giao dịch</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center items-center h-full text-gray-400 text-xs">
                                                    Chưa có dữ liệu
                                                </div>
                                            )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TransactionStatistics;
