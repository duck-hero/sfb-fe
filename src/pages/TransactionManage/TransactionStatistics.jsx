import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { Loader2, TrendingUp, TrendingDown, RefreshCw, GripVertical, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import bankAccountApi from "../../api/bankAccountApi";
import { toast } from "react-toastify";

const BankAccountCard = ({ 
    account, 
    index, 
    reportState, 
    fetchReportForAccount, 
    formatCurrency, 
    handleEditBalance, 
    editingBalanceId, 
    setEditingBalanceId,
    newOpeningBalance,
    setNewOpeningBalance,
    handleSaveOpeningBalance,
    savingBalance,
    month,
    year,
    dragStart,
    dragEnter,
    drop
}) => {
    const data = reportState.data;
    const loading = reportState.loading;
    const error = reportState.error;

    // Auto-fetch report if not loaded
    useEffect(() => {
        if (!reportState.data && !reportState.loading && !reportState.error) {
            fetchReportForAccount(account.id, account.type);
        }
    }, [account.id, account.type, month, year]);

    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col transition-all hover:shadow-md min-w-[340px] w-[340px] max-h-[calc(100vh-100px)] h-fit"
            draggable
            onDragStart={(e) => dragStart(e, index)}
            onDragEnter={(e) => dragEnter(e, index)}
            onDragEnd={drop}
            onDragOver={(e) => e.preventDefault()}
        >
            {/* Account Header */}
            <div className="bg-gray-50 p-3 border-b border-gray-100 flex flex-col gap-2 relative group">
                <div className="absolute top-3 right-2 cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-gray-500 p-1 transition-colors">
                    <GripVertical size={18} />
                </div>

                <div className="flex items-center gap-3 pr-6">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[8px] shrink-0 shadow-inner p-1 text-center leading-tight overflow-hidden break-words">
                        {account.bankCode || "BANK"}
                    </div>
                    <div className="overflow-hidden flex flex-col">
                        {account.code && (
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{account.code}</span>
                        )}
                        <h3 className="font-bold text-gray-800 text-xs truncate" title={account.accountBankNumber}>{account.accountBankNumber}</h3>
                        <p className="text-[9px] text-gray-500 uppercase truncate" title={account.accountBankHolderName}>{account.accountBankHolderName}</p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-0 relative bg-white overflow-hidden flex flex-col min-h-[200px]">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-gray-400 gap-2 bg-white/80 z-10">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-xs">Đang tải...</span>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex justify-center items-center text-gray-400 text-xs italic p-4 text-center">
                        {error}
                    </div>
                ) : data ? (
                    <div className="flex-1 flex flex-col p-3 overflow-hidden">
                        {/* Summary Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-gray-50 p-2 rounded-lg text-center relative group/edit">
                                <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Dư đầu kỳ</span>
                                <div className="flex items-center justify-center gap-1 mt-0.5">
                                    <span className="font-bold text-gray-700 text-xs">{formatCurrency(data.openingBalance)}</span>
                                    <button 
                                        onClick={() => handleEditBalance(account.id, data.openingBalance)}
                                        className="opacity-0 group-hover/edit:opacity-100 transition-opacity text-blue-500 hover:text-blue-700 p-0.5 rounded"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                                    </button>
                                </div>

                                {/* Edit Popup */}
                                {editingBalanceId === account.id && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white p-2 rounded-lg shadow-xl border border-gray-200 z-50 flex items-center gap-2 w-44">
                                        <input 
                                            type="number" 
                                            autoFocus
                                            value={newOpeningBalance}
                                            onChange={(e) => setNewOpeningBalance(e.target.value)}
                                            className="w-full text-[10px] border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveOpeningBalance(account.id, account.type);
                                                if (e.key === 'Escape') setEditingBalanceId(null);
                                            }}
                                        />
                                        <button 
                                            onClick={() => handleSaveOpeningBalance(account.id, account.type)}
                                            disabled={savingBalance}
                                            className="text-green-600 hover:bg-green-50 p-1 rounded shrink-0"
                                        >
                                            {savingBalance ? <Loader2 size={12} className="animate-spin"/> : <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="bg-blue-50 p-2 rounded-lg text-center">
                                <span className="text-[9px] text-blue-500 block uppercase tracking-wider">Dư cuối kỳ</span>
                                <span className="font-bold text-blue-700 text-xs block mt-0.5">{formatCurrency(data.closingBalance)}</span>
                            </div>
                            <div className="bg-green-50 p-2 rounded-lg text-center">
                                <div className="flex items-center justify-center gap-1 text-green-600 text-[8px] font-bold uppercase tracking-wider">
                                    <TrendingUp size={10}/> Tổng Thu
                                </div>
                                <span className="font-bold text-green-600 text-xs block mt-0.5">+{formatCurrency(data.totalDebit)}</span>
                            </div>
                            <div className="bg-red-50 p-2 rounded-lg text-center">
                                <div className="flex items-center justify-center gap-1 text-red-600 text-[8px] font-bold uppercase tracking-wider">
                                    <TrendingDown size={10}/> Tổng Chi
                                </div>
                                <span className="font-bold text-red-600 text-xs block mt-0.5">-{formatCurrency(data.totalCredit)}</span>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 mb-2 w-full"></div>

                        {/* Lines Table */}
                        <div className="flex-1 overflow-auto custom-scrollbar border border-gray-50 rounded-lg">
                            {data.lines && data.lines.length > 0 ? (
                                <table className="w-full text-[11px] text-left relative border-collapse">
                                    <thead className="text-[9px] text-gray-500 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm font-semibold">
                                        <tr>
                                            <th className="px-2 py-1.5 font-bold bg-gray-50 border-b border-gray-100">Đối tượng</th>
                                            <th className="px-2 py-1.5 font-bold text-right text-green-600 bg-gray-50 border-b border-gray-100">Thu</th>
                                            <th className="px-2 py-1.5 font-bold text-right text-red-600 bg-gray-50 border-b border-gray-100">Chi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.lines.map((line) => (
                                            <tr key={line.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-2 py-1.5 font-medium text-gray-700 truncate max-w-[120px]" title={line.accountingObject}>
                                                    {line.accountingObject || "N/A"}
                                                </td>
                                                <td className="px-2 py-1.5 text-right font-bold text-green-600 whitespace-nowrap">
                                                    {line.debitAmount > 0 ? formatCurrency(line.debitAmount) : "-"}
                                                </td>
                                                <td className="px-2 py-1.5 text-right font-bold text-red-600 whitespace-nowrap">
                                                    {line.creditAmount > 0 ? formatCurrency(line.creditAmount) : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-20 text-gray-400 text-[10px]">
                                    <span>Không có giao dịch</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex justify-center items-center text-gray-400 text-xs">
                        Chưa có dữ liệu
                    </div>
                )}
            </div>
        </div>
    );
};

const TransactionStatistics = () => {
    const [year, setYear] = useState(dayjs().year());
    const [month, setMonth] = useState(dayjs().month() + 1);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [reports, setReports] = useState({}); // Map: bankAccountId -> { loading, data, error }
    const [initLoading, setInitLoading] = useState(false);
    const [refreshIdx, setRefreshIdx] = useState(0);
    
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
                 setBankAccounts(accounts);
            }
        } catch (error) {
            console.error("Failed to fetch bank accounts", error);
            toast.error("Không thể tải danh sách tài khoản");
        } finally {
            setInitLoading(false);
        }
    };

    const fetchReportForAccount = async (bankAccountId, type) => {
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
        setRefreshIdx(prev => prev + 1);
    }, [month, year]);


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
    };

    const dragEnter = (e, position) => {
        dragOverItem.current = position;
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
        <div className="space-y-6 p-4 bg-gray-50 min-h-screen relative">
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
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar">
                {initLoading && bankAccounts.length === 0 ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <div className="flex gap-4 pb-6 px-1 h-full min-h-[500px]">
                        {bankAccounts.map((account, index) => (
                            <BankAccountCard
                                key={`${account.id}-${month}-${year}-${refreshIdx}`}
                                account={account}
                                index={index}
                                reportState={reports[account.id] || { loading: false, data: null }}
                                fetchReportForAccount={fetchReportForAccount}
                                formatCurrency={formatCurrency}
                                handleEditBalance={handleEditBalance}
                                editingBalanceId={editingBalanceId}
                                setEditingBalanceId={setEditingBalanceId}
                                newOpeningBalance={newOpeningBalance}
                                setNewOpeningBalance={setNewOpeningBalance}
                                handleSaveOpeningBalance={handleSaveOpeningBalance}
                                savingBalance={savingBalance}
                                month={month}
                                year={year}
                                dragStart={dragStart}
                                dragEnter={dragEnter}
                                drop={drop}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Persistent Floating Refresh Button (FAB) */}
            <button
                onClick={() => { 
                    fetchBankAccounts(); 
                    setReports({});
                    setRefreshIdx(prev => prev + 1); 
                }}
                disabled={initLoading}
                className="fixed bottom-10 right-10 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all z-50 group hover:scale-110 active:scale-95 disabled:opacity-50"
                title="Làm mới dữ liệu"
            >
                <RefreshCw className={`w-6 h-6 ${initLoading ? 'animate-spin' : ''}`} />
                {/* Tooltip */}
                <div className="absolute right-full mr-4 px-3 py-1.5 bg-gray-900/90 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10 backdrop-blur-sm font-medium">
                    Làm mới dữ liệu
                </div>
            </button>
        </div>
    );
};

export default TransactionStatistics;
