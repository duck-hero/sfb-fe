import React, { useState, useEffect, useRef, useCallback } from "react";
import customerApi from "../../api/customerApi";
import { Loader2, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import SpendTrackingModal from "./SpendTrackingModal";

const MonthlyCustomerReconciliation = ({ onCustomerClick }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [cursor, setCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const [groupChildren, setGroupChildren] = useState({});
    const [loadingGroups, setLoadingGroups] = useState(new Set());
    const [isSpendModalOpen, setIsSpendModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Default to current year and month
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [day, setDay] = useState(""); // "" means all days

    const observer = useRef();
    const lastElementRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchData(cursor);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasNextPage, cursor]);

    const fetchData = async (currentCursor = null, isInitial = false) => {
        if (isInitial) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const dayParam = day === "" ? null : Number(day);
            const res = await customerApi.getMonthlyReconciliation(year, month, 10, currentCursor, dayParam);
            if (res.success) {
                const newData = res.data || [];
                if (isInitial) {
                    setData(newData);
                } else {
                    setData(prev => [...prev, ...newData]);
                }

                if (res.pageInfo) {
                    setCursor(res.pageInfo.nextCursor);
                    setHasNextPage(res.pageInfo.hasNextPage);
                }
            }
        } catch (error) {
            console.error("Failed to fetch reconciliation data", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const toggleGroup = async (groupId) => {
        const isCurrentlyExpanded = expandedGroups.has(groupId);

        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (isCurrentlyExpanded) {
                next.delete(groupId);
            } else {
                next.add(groupId);
            }
            return next;
        });

        // If expanding and data not yet fetched
        if (!isCurrentlyExpanded && !groupChildren[groupId] && !loadingGroups.has(groupId)) {
            setLoadingGroups(prev => new Set(prev).add(groupId));
            try {
                const res = await customerApi.getGroupSpendSummary(groupId, year, month);
                if (res.success && res.data) {
                    setGroupChildren(prev => ({
                        ...prev,
                        [groupId]: res.data.customers || []
                    }));
                }
            } catch (error) {
                console.error(`Failed to fetch group details for ${groupId}`, error);
                toast.error("Không thể tải chi tiết nhóm");
            } finally {
                setLoadingGroups(prev => {
                    const next = new Set(prev);
                    next.delete(groupId);
                    return next;
                });
            }
        }
    };

    const handleOpenSpendModal = (customer) => {
        setSelectedCustomer({
            id: customer.customerId,
            customerId: customer.customerId,
            name: customer.customerName,
            customerCode: customer.customerCode,
            fullCustomerCode: customer.fullCustomerCode,
        });
        setIsSpendModalOpen(true);
    };

    useEffect(() => {
        fetchData(null, true);
    }, [year, month, day]);

    const formatNumber = (num) => {
        if (num === null || num === undefined) return "0";
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // Calculate days in the selected month/year
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="bg-white rounded-lg p-0 mb-4">
            <div className="flex justify-between items-center mb-3 px-1">
                <h2 className="text-xs font-bold text-primary-darkest uppercase">Đối soát công nợ tháng</h2>
                <div className="flex gap-2">
                    <select
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        className="border border-gray-300 rounded px-1.5 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">Tất cả ngày</option>
                        {days.map(d => (
                            <option key={d} value={d}>Ngày {d}</option>
                        ))}
                    </select>
                    <select
                        value={month}
                        onChange={(e) => {
                            setMonth(Number(e.target.value));
                            // Optional: validation for day if switching to month with fewer days
                        }}
                        className="border border-gray-300 rounded px-1.5 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {months.map(m => (
                            <option key={m} value={m}>Tháng {m}</option>
                        ))}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="border border-gray-300 rounded px-1.5 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>Năm {y}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-lg custom-scrollbar" style={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th rowSpan="2" className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider border-b border-r border-gray-100">Khách hàng</th>
                            <th rowSpan="2" className="px-2 py-1.5 text-right text-[10px] font-semibold text-gray-600 uppercase tracking-wider border-b border-r border-gray-100">Số dư đầu kì</th>
                            <th rowSpan="2" className="px-2 py-1.5 text-right text-[10px] font-semibold text-gray-600 uppercase tracking-wider border-b border-r border-gray-100">Tổng ADS</th>
                            <th rowSpan="2" className="px-2 py-1.5 text-right text-[10px] font-semibold text-gray-600 uppercase tracking-wider border-b border-r border-gray-100">Tổng phí</th>
                            <th rowSpan="2" className="px-2 py-1.5 text-right text-[10px] font-semibold text-gray-600 uppercase tracking-wider border-b border-r border-gray-100">Tổng ADS + Phí</th>
                            <th colSpan="2" className="px-2 py-1 text-center text-[10px] font-bold text-blue-700 uppercase tracking-wider border-b border-r border-gray-200 bg-blue-100">Khách Bank</th>
                            <th rowSpan="2" className="px-2 py-1.5 text-right text-[10px] font-semibold text-gray-600 uppercase tracking-wider border-b">Công nợ</th>
                        </tr>
                        <tr>
                            <th className="px-2 py-1 text-right text-[9px] font-bold text-blue-600 uppercase tracking-wider border-b border-r border-gray-200 bg-blue-50">Tự động</th>
                            <th className="px-2 py-1 text-right text-[9px] font-bold text-blue-600 uppercase tracking-wider border-b border-r border-gray-200 bg-blue-50">Thủ công</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading && data.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-3 py-10 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary-dark" />
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-3 py-10 text-center text-gray-500 text-sm">
                                    Không có dữ liệu đối soát
                                </td>
                            </tr>
                        ) : (
                            <>
                                {data.map((item, index) => {
                                    const isGroup = item.isGroup;
                                    const groupId = item.customerGroupId;
                                    const isExpanded = expandedGroups.has(groupId);
                                    const isLoadingGroup = loadingGroups.has(groupId);
                                    const children = groupChildren[groupId] || [];
                                    const hasChildren = children.length > 0;

                                    return (
                                        <React.Fragment key={`${item.invoiceId}-${item.customerId}-${item.customerGroupId}-${index}`}>
                                            {/* Parent Row */}
                                            <tr
                                                className={`${isGroup ? "bg-gray-50/80 font-bold" : "hover:bg-gray-50"} transition-colors group/row`}
                                            >
                                                <td
                                                    className="px-2 py-1 whitespace-nowrap border-r border-gray-50 relative overflow-hidden cursor-pointer hover:bg-blue-50 transition-colors group/cell"
                                                    onClick={() => {
                                                        if (isGroup) {
                                                            toggleGroup(item.customerGroupId);
                                                        } else {
                                                            onCustomerClick?.(item);
                                                        }
                                                    }}
                                                >
                                                    <div className={`flex items-center gap-1.5 relative z-10 ${!isGroup ? "cursor-pointer" : ""}`}
                                                        onClick={(e) => {
                                                            if (!isGroup) {
                                                                e.stopPropagation();
                                                                handleOpenSpendModal(item);
                                                            }
                                                        }}
                                                    >
                                                        {isGroup && (
                                                            <div className="text-gray-400">
                                                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col flex-1 min-w-0">
                                                            <div className={`text-[11px] leading-tight truncate transition-colors ${isGroup ? "font-bold text-gray-900" : "font-medium text-blue-600 hover:text-blue-800 hover:underline"}`}>
                                                                {item.fullCustomerCode}
                                                            </div>
                                                            <div className="text-[9px] text-secondary italic leading-tight truncate">{item.customerName}</div>
                                                        </div>
                                                    </div>
                                                    {/* STAMP EFFECT */}
                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover/row:opacity-40 transition-opacity">
                                                        {item.status === 1 ? (
                                                            <div className="border-2 border-red-600 text-red-600 px-1 py-0.5 rounded text-[8px] font-black uppercase -rotate-12 scale-110 tracking-tighter">
                                                                ĐÃ CHỐT
                                                            </div>
                                                        ) : (
                                                            <div className="border-2 border-gray-400 text-gray-400 px-1 py-0.5 rounded text-[8px] font-black uppercase -rotate-12 scale-110 tracking-tighter">
                                                                NHÁP
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap text-[11px] text-right text-gray-900">
                                                    {formatNumber(item.openingBalance)}
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap text-[11px] text-right text-gray-600 font-semibold">
                                                    {formatNumber(item.totalSpend)}
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap text-[11px] text-right text-gray-600 font-semibold border-r border-gray-50">
                                                    {formatNumber(item.totalFee)}
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap text-[11px] text-right text-blue-600 font-black border-r border-gray-100">
                                                    {formatNumber(item.totalSpendWithFee)}
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap text-[11px] text-right text-green-700 font-black border-r border-blue-200 bg-blue-50/40">
                                                    {formatNumber(item.paidInMonth)}
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap text-[11px] text-right text-teal-700 font-black border-r border-blue-200 bg-blue-50/40">
                                                    {formatNumber(item.paidInMonthManual)}
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap text-[11px] text-right font-black">
                                                    <span className={item.closingBalance < 0 ? "text-red-500" : "text-blue-700"}>
                                                        {formatNumber(item.closingBalance)}
                                                    </span>
                                                </td>
                                            </tr>

                                            {/* Loading Child Rows */}
                                            {isGroup && isExpanded && isLoadingGroup && (
                                                <tr>
                                                    <td colSpan="8" className="px-3 py-4 text-center">
                                                        <Loader2 className="h-4 w-4 animate-spin mx-auto text-blue-500" />
                                                    </td>
                                                </tr>
                                            )}

                                            {/* Children Rows */}
                                            {isGroup && isExpanded && !isLoadingGroup && hasChildren && children.map((child, cIdx) => (
                                                <tr
                                                    key={`child-${groupId}-${child.customerId}-${cIdx}`}
                                                    className="hover:bg-blue-50/30 transition-colors group/row bg-white"
                                                >
                                                    <td
                                                        className="px-2 py-1 whitespace-nowrap border-r border-gray-50 relative overflow-hidden cursor-pointer hover:bg-blue-50 transition-colors group/cell pl-6"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenSpendModal(child);
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2 relative z-10">
                                                            <div className="flex flex-col flex-1 min-w-0">
                                                                <div className="text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline leading-tight truncate transition-colors">
                                                                    {child.customerName}
                                                                </div>
                                                                <div className="text-[9px] text-secondary italic leading-tight truncate">{child.customerCode}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-1 whitespace-nowrap text-[10px] text-right text-gray-400 italic">
                                                        -
                                                    </td>
                                                    <td className="px-2 py-1 whitespace-nowrap text-[10px] text-right text-gray-500 italic">
                                                        {formatNumber(child.totalSpend)}
                                                    </td>
                                                    <td className="px-2 py-1 whitespace-nowrap text-[10px] text-right text-gray-500 italic border-r border-gray-50">
                                                        {formatNumber(child.totalFee)}
                                                    </td>
                                                    <td className="px-2 py-1 whitespace-nowrap text-[10px] text-right text-gray-700 font-bold border-r border-gray-100">
                                                        {formatNumber(child.totalSpendWithFee)}
                                                    </td>
                                                    <td className="px-2 py-1 whitespace-nowrap text-[10px] text-right text-gray-400 italic border-r border-blue-100 bg-blue-50/20">
                                                        -
                                                    </td>
                                                    <td className="px-2 py-1 whitespace-nowrap text-[10px] text-right text-gray-400 italic border-r border-blue-100 bg-blue-50/20">
                                                        -
                                                    </td>
                                                    <td className="px-2 py-1 whitespace-nowrap text-[10px] text-right text-gray-400 italic font-bold">
                                                        -
                                                    </td>
                                                </tr>
                                            ))}

                                            {/* Empty Child Rows */}
                                            {isGroup && isExpanded && !isLoadingGroup && !hasChildren && (
                                                <tr>
                                                    <td colSpan="8" className="px-3 py-2 text-center text-[10px] text-gray-400 italic">
                                                        Không có khách hàng trong nhóm
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                                <tr ref={lastElementRef}>
                                    <td colSpan="8" className="p-2 text-center">
                                        {loadingMore && <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary-dark" />}
                                    </td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>

            <SpendTrackingModal
                open={isSpendModalOpen}
                onClose={() => setIsSpendModalOpen(false)}
                customer={selectedCustomer}
            />
        </div>
    );
};

export default MonthlyCustomerReconciliation;
