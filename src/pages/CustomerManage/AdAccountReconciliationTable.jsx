import { useState, useRef, Fragment } from 'react';
import { Dialog, Transition, Popover } from '@headlessui/react';
import { Upload, X, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-toastify';
import adsAccountApi from '../../api/adsAccountApi';

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
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);
     const fileInputRef = useRef(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await adsAccountApi.importAdsAccountDebtHistory(formData, data.year, data.month);
            const actualRes = res.data || res;
            
            if (actualRes.isSuccess) {
                setImportResult(actualRes);
                setShowResultModal(true);
                toast.success('Import thành công!');
            } else {
                toast.error(actualRes.message || 'Import thất bại');
            }
        } catch (error) {
           toast.error('Có lỗi xảy ra khi import');
        } finally {
            setIsImporting(false);
             if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

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
    const totalDebtValue = data.rows.reduce((sum, r) => sum + (r.debtValue || 0), 0);

    return (
        <>
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
                            <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-100 group relative cursor-pointer hover:bg-gray-100 transition-colors">
                                 <Popover className="relative">
                                    {({ open }) => (
                                        <>
                                            <Popover.Button className="focus:outline-none w-full h-full flex items-center justify-end gap-1">
                                                <span>Dư đầu tháng</span>
                                                <Upload className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
                                            </Popover.Button>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-200"
                                                enterFrom="opacity-0 translate-y-1"
                                                enterTo="opacity-100 translate-y-0"
                                                leave="transition ease-in duration-150"
                                                leaveFrom="opacity-100 translate-y-0"
                                                leaveTo="opacity-0 translate-y-1"
                                            >
                                                <Popover.Panel className="absolute z-50 mt-2 w-48 -translate-x-1/2 left-1/2 transform px-4 sm:px-0 lg:max-w-3xl">
                                                    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                                        <div className="bg-white p-2">
                                                            <button
                                                                onClick={handleImportClick}
                                                                disabled={isImporting}
                                                                className="flex w-full items-center gap-2 rounded-md p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                                                            >
                                                                <FileSpreadsheet className="h-5 w-5 text-green-600" aria-hidden="true" />
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {isImporting ? 'Đang tải...' : 'Upload Excel SMIT'}
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Popover.Panel>
                                            </Transition>
                                        </>
                                    )}
                                </Popover>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".xlsx, .xls"
                                />
                            </th>
                             <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-100">Pay Facebook</th>
                             <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-100">Chi tiêu thực tế (File upload)</th>
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
                                    <div className="font-semibold text-gray-900">
                                        {row.debtValue !== null && row.debtValue !== undefined ? formatCurrency(row.debtValue) : ''}
                                    </div>
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
                    <tfoot className="bg-gray-50/80 sticky bottom-0 z-10 border-t border-gray-200 backdrop-blur-sm">
                        <tr className="font-bold text-gray-800">
                            <td colSpan={2} className="px-3 py-2 text-left text-[10px] border-r border-gray-100">
                                <div className="flex items-center gap-2">
                                    <span className="bg-white border border-gray-200 px-2 py-0.5 rounded-md font-bold text-gray-700">
                                        {data.rows.length}
                                    </span>
                                    Tài khoản
                                </div>
                            </td>
                            <td className="px-3 py-2 text-right border-r border-gray-100">
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] text-gray-400 uppercase tracking-wider">Tổng dư đầu</span>
                                    <span>{formatCurrency(totalDebtValue)}</span>
                                </div>
                            </td>
                            <td className="px-3 py-2 text-right border-r border-gray-100">
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] text-gray-400 uppercase tracking-wider">Tổng Pay FB</span>
                                    <span>{formatCurrency(totalBankDebit)}</span>
                                </div>
                            </td>
                             <td className="px-3 py-2 text-center border-r border-gray-100">
                                <div className="flex flex-col items-center">
                                    <span className="text-[8px] text-gray-400 uppercase tracking-wider">Tổng chi thực</span>
                                    <span>{formatCurrency(totalCurrentSpend)}</span>
                                </div>
                            </td>
                            <td className="px-3 py-2 text-right border-r border-gray-100">
                                <div className="flex flex-col items-end">
                                   <span className="text-[8px] text-gray-400 uppercase tracking-wider">Tổng ghi nhận</span>
                                   <span className="text-blue-600">{formatCurrency(totalAllocatedSpend)}</span>
                                </div>
                            </td>
                            <td className="px-3 py-2 text-right border-r border-gray-100">
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] text-gray-400 uppercase tracking-wider">Tổng chênh</span>
                                    <span className="text-red-500">{formatCurrency(Math.abs(totalVariance))}</span>
                                </div>
                            </td>
                            <td colSpan={2} className="px-3 py-2 bg-gray-50/50"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
            
             {/* Result Modal */}
            <Transition appear show={showResultModal} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setShowResultModal(false)}>
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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                                    >
                                        Kết quả Import dư đầu tháng
                                        <button onClick={() => setShowResultModal(false)} className="text-gray-400 hover:text-gray-600">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </Dialog.Title>
                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center justify-between text-[11px] bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div className="flex flex-col items-center flex-1 border-r border-gray-200">
                                                <span className="text-gray-400 uppercase font-bold text-[9px]">Thêm mới</span>
                                                <span className="text-sm font-bold text-green-600">{importResult?.insertedCount || 0}</span>
                                            </div>
                                            <div className="flex flex-col items-center flex-1 border-r border-gray-200">
                                                <span className="text-gray-400 uppercase font-bold text-[9px]">Cập nhật</span>
                                                <span className="text-sm font-bold text-blue-600">{importResult?.updatedCount || 0}</span>
                                            </div>
                                            <div className="flex flex-col items-center flex-1">
                                                <span className="text-gray-400 uppercase font-bold text-[9px]">Bỏ qua</span>
                                                <span className="text-sm font-bold text-gray-600">{importResult?.skippedCount || 0}</span>
                                            </div>
                                        </div>
                                        
                                        {importResult?.notFoundInSystem?.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-bold text-red-600 flex items-center gap-2 mb-2">
                                                    <AlertCircle className="w-4 h-4" />
                                                    Tài khoản không tồn tại ({importResult.notFoundInSystem.length})
                                                </h4>
                                                <div className="bg-red-50 rounded-lg p-2 max-h-60 overflow-y-auto border border-red-100 text-xs">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr>
                                                                <th className="font-semibold text-red-700 py-1">ID Tài khoản</th>
                                                                 <th className="font-semibold text-red-700 py-1">Tên (nếu có)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {importResult.notFoundInSystem.map((item, idx) => (
                                                                <tr key={idx} className="border-t border-red-100">
                                                                    <td className="py-1 text-gray-700 font-mono">{item.adAccountId}</td>
                                                                    <td className="py-1 text-gray-700">{item.adAccountName || '-'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                        
                                         <p className="text-sm text-gray-500 mt-2 italic">Result: {importResult?.message}</p>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={() => setShowResultModal(false)}
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
        </>
    );
};

export default AdAccountReconciliationTable;
