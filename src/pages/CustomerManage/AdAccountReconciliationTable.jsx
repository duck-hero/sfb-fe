const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "0";
    return new Intl.NumberFormat('vi-VN', { style: 'decimal', maximumFractionDigits: 0 }).format(amount);
};

// const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleString('vi-VN', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//     });
// };

const AdAccountReconciliationTable = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-40 mb-3"></div>
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-12 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!data || !data.rows || data.rows.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    Đối soát Tài khoản FB Ads
                </h3>
                <div className="text-center py-6">
                    <p className="text-gray-400 text-xs text-center mx-auto">Không có dữ liệu đối soát</p>
                </div>
            </div>
        );
    }

    const totalBankDebit = data.rows.reduce((sum, r) => sum + (r.bankDebit || 0), 0);
    const totalCurrentSpend = data.rows.reduce((sum, r) => sum + (r.currentSpend || 0), 0);
    const totalAllocatedSpend = data.rows.reduce((sum, r) => sum + (r.allocatedSpend || 0), 0);
    const totalVariance = data.rows.reduce((sum, r) => sum + (r.variance || 0), 0);

    return (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden mt-4">
            <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    <div>
                        <div>Đối soát Tài khoản FB Ads</div>
                        <div className="text-[10px] font-normal text-gray-500 mt-0.5">
                            Tháng {data.month}/{data.year}
                        </div>
                    </div>
                </h3>
            </div>

            <div className="overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                <table className="w-full text-[11px]">
                    <thead className="bg-gray-50/80 sticky top-0 z-10 border-b border-gray-100 backdrop-blur-sm">
                        <tr>
                            <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-100">Tên TK</th>
                            <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-100">ID TK</th>
                             <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-100">Pay Facebook</th>
                             <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-100">Chi tiêu thực tế</th>
                            <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-100">Chi tiêu ghi nhận</th>
                            <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-100">Chênh lệch</th>
                            <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-100">KH</th>
                            <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {data.rows.map((row, index) => (
                            <tr key={row.adAccountId || index} className="hover:bg-blue-50/30 transition-all group">
                                <td className="px-3 py-2 border-r border-gray-50">
                                    <div className="font-medium text-gray-700 truncate max-w-[200px]" title={row.adAccountName}>
                                        {row.adAccountName}
                                    </div>
                                </td>
                                <td className="px-3 py-2 border-r border-gray-50">
                                    <div className="text-gray-500 font-mono text-[10px]">{row.adAccountIdNumber}</div>
                                </td>
                                 <td className="px-3 py-2 text-right border-r border-gray-50">
                                     <div className="font-semibold text-gray-900">{formatCurrency(row.bankDebit)}</div>
                                 </td>
                                 <td className="px-3 py-2 text-center border-r border-gray-50">
                                     <div className="font-semibold text-[11px] text-gray-900">
                                         {formatCurrency(row.currentSpend)}
                                     </div>
                                 </td>
                                <td className="px-3 py-2 text-right border-r border-gray-50">
                                    <div className="font-semibold text-blue-600">{formatCurrency(row.allocatedSpend)}</div>
                                </td>
                                <td className="px-3 py-2 text-right border-r border-gray-50">
                                    <div className={`font-bold ${Math.abs(row.variance) > 1000 ? 'text-red-500' : 'text-gray-700'}`}>
                                        {formatCurrency(Math.abs(row.variance))}
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-center border-r border-gray-50">
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-500/10">
                                        {row.customerCount || 0}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                    {row.locked ? (
                                        <span className="text-red-400" title="Đã khóa">🔒</span>
                                    ) : (
                                        <span className="text-green-500" title="Hoạt động">✓</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-[11px]">
                    <div className="text-gray-500 flex items-center gap-2">
                        <span className="bg-white border border-gray-200 px-2 py-0.5 rounded-md font-bold text-gray-700">
                            {data.rows.length}
                        </span>
                        Tài khoản
                    </div>
                    <div className="flex gap-6 items-center">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Pay FB</span>
                            <span className="font-bold text-gray-800">{formatCurrency(totalBankDebit)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Chi tiêu FB</span>
                            <span className="font-bold text-gray-900">{formatCurrency(totalCurrentSpend)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Ghi nhận</span>
                            <span className="font-bold text-blue-600">{formatCurrency(totalAllocatedSpend)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Tổng chênh</span>
                            <span className="font-bold text-red-500">{formatCurrency(Math.abs(totalVariance))}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdAccountReconciliationTable;
