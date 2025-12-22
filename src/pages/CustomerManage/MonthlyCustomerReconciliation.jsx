import { useState, useEffect, useRef, useCallback } from "react";
import customerApi from "../../api/customerApi";
import { Loader2 } from "lucide-react";

const MonthlyCustomerReconciliation = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [cursor, setCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(false);

    // Default to current year and month
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);

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
            const res = await customerApi.getMonthlyReconciliation(year, month, 10, currentCursor);
            if (res.success) {
                if (isInitial) {
                    setData(res.data);
                } else {
                    setData(prev => [...prev, ...res.data]);
                }
                setCursor(res.pageInfo.nextCursor);
                setHasNextPage(res.pageInfo.hasNextPage);
            }
        } catch (error) {
            console.error("Failed to fetch reconciliation data", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchData(null, true);
    }, [year, month]);

    const formatNumber = (num) => {
        if (num === null || num === undefined) return "0";
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-md font-bold text-primary-darkest uppercase">Đối soát công nợ tháng</h2>
                <div className="flex gap-2">
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {months.map(m => (
                            <option key={m} value={m}>Tháng {m}</option>
                        ))}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>Năm {y}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-lg custom-scrollbar" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Khách hàng</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Dư đầu</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Chi tiêu</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Phí</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Tổng chi</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Đã thanh toán</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Dư cuối</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading && data.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-3 py-10 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary-dark" />
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-3 py-10 text-center text-gray-500 text-sm">
                                    Không có dữ liệu đối soát
                                </td>
                            </tr>
                        ) : (
                            <>
                                {data.map((item, index) => (
                                    <tr key={`${item.invoiceId}-${index}`} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.customerName}</div>
                                            <div className="text-xs text-secondary italic">{item.fullCustomerCode}</div>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                                            {formatNumber(item.openingBalance)}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                                            {formatNumber(item.totalSpend)}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                                            {formatNumber(item.totalFee)}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-blue-600 font-semibold">
                                            {formatNumber(item.totalSpendWithFee)}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-green-600 font-semibold">
                                            {formatNumber(item.paidInMonth)}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                                            <span className={item.closingBalance < 0 ? "text-red-500" : "text-gray-900"}>
                                                {formatNumber(item.closingBalance)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                <tr ref={lastElementRef}>
                                    <td colSpan="7" className="p-2 text-center">
                                        {loadingMore && <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary-dark" />}
                                    </td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MonthlyCustomerReconciliation;
