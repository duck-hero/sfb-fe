import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Upload, X, Loader2, AlertCircle, CheckCircle2, FileSpreadsheet, RefreshCw, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import adsAccountApi from '../../api/adsAccountApi';
import dashboardApi from '../../api/dashboardApi';
import AdAccountReconciliationTable from './AdAccountReconciliationTable';

const AdAccountAuditReport = () => {
    const [year, setYear] = useState(dayjs().year());
    const [month, setMonth] = useState(dayjs().month() + 1);
    const [reconciliation, setReconciliation] = useState(null);
    const [loading, setLoading] = useState(false);

    // Upload state
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [importResult, setImportResult] = useState(null);

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

    const fetchReconciliation = async () => {
        setLoading(true);
        try {
            const res = await dashboardApi.getAdAccountReconciliation(year, month);
            if (res.success) {
                setReconciliation(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch reconciliation", error);
            toast.error("Không tải được dữ liệu đối soát");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReconciliation();
    }, [year, month]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setImportResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) {
            toast.error("Vui lòng chọn file Excel");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        setProgress(0);
        setImportResult(null);

        try {
            const res = await adsAccountApi.importAdsAccountCurrentSpend(formData, (event) => {
                const percent = Math.round((event.loaded * 100) / event.total);
                setProgress(percent);
            });

            if (res.success) {
                setImportResult(res.data);
                toast.success(res.data.message || "Import thành công");
                // Refresh table if the import was successful
                fetchReconciliation();
            } else {
                toast.error(res.message || "Import thất bại");
            }
        } catch (error) {
            console.error("Import error:", error);
            toast.error("Đã xảy ra lỗi trong quá trình import");
        } finally {
            setUploading(false);
            setFile(null);
            // Reset file input
            const fileInput = document.getElementById('excel-upload');
            if (fileInput) fileInput.value = '';
        }
    };

    return (
        <div className="space-y-4">
            {/* Header & Import Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-sm font-bold text-primary-darkest uppercase flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                            BC Đối soát tài khoản FB Ads
                        </h2>
                        <p className="text-[11px] text-gray-500 mt-0.5 italic">
                            Import file Excel để cập nhật chi tiêu thực tế từ Facebook
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input
                                id="excel-upload"
                                type="file"
                                accept=".xlsx, .xls"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                            <label
                                htmlFor="excel-upload"
                                className={`flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium rounded-lg border border-dashed transition-all cursor-pointer shadow-sm
                                    ${file
                                        ? "border-blue-500 bg-blue-50 text-blue-700"
                                        : "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
                                    }`}
                            >
                                <Upload className="w-3.5 h-3.5" />
                                {file ? file.name : "Chọn file Excel"}
                            </label>
                        </div>

                        <button
                            onClick={handleImport}
                            disabled={!file || uploading}
                            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-[11px] font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Đang xử lý {progress}%
                                </>
                            ) : (
                                "Bắt đầu cập nhật"
                            )}
                        </button>
                    </div>
                </div>

                {/* Progress Bar Container */}
                {uploading && (
                    <div className="mt-4">
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="bg-blue-600 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Import Result Summary */}
                {importResult && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className={`p-3 rounded-lg flex items-start gap-3 border ${importResult.isSuccess ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                            {importResult.isSuccess ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            )}
                            <div>
                                <h4 className={`text-xs font-bold ${importResult.isSuccess ? 'text-green-800' : 'text-red-800'}`}>
                                    {importResult.message}
                                </h4>
                                {importResult.updatedCount > 0 && (
                                    <p className="text-[11px] text-green-700 mt-1 font-medium">
                                        Thành công: <span className="underline decoration-2">{importResult.updatedCount}</span> tài khoản đã được đồng bộ chi tiêu.
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setImportResult(null)}
                                className="ml-auto text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            {/* Not Found In System Accounts List */}
                            {importResult.notFoundInSystem && importResult.notFoundInSystem.length > 0 && (
                                <div className="border border-orange-100 rounded-lg overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
                                    <div className="bg-orange-50 px-3 py-1.5 border-b border-orange-100 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3" />
                                            {importResult.notFoundInSystem.length} TK không khớp hệ thống
                                        </span>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                                        {importResult.notFoundInSystem.map((acc, idx) => (
                                            <div key={acc.adAccountId || idx} className="p-2 border border-gray-50 rounded-md hover:bg-gray-50 group flex items-start gap-2 h-fit">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[10px] font-semibold text-gray-700 truncate" title={acc.adAccountName}>
                                                        {acc.adAccountName}
                                                    </span>
                                                    <span className="text-[9px] text-gray-400 font-mono">
                                                        ID: {acc.adAccountId}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Not Found In File Accounts List */}
                            {importResult.notFoundInFile && importResult.notFoundInFile.length > 0 && (
                                <div className="border border-blue-100 rounded-lg overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
                                    <div className="bg-blue-50 px-3 py-1.5 border-b border-blue-100 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3" />
                                            {importResult.notFoundInFile.length} TK hệ thống không có trong file
                                        </span>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                                        {importResult.notFoundInFile.map((acc, idx) => (
                                            <div key={acc.adAccountId || idx} className="p-2 border border-blue-50/50 rounded-md hover:bg-blue-50/50 group flex items-start gap-2 h-fit">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[10px] font-semibold text-blue-800 truncate" title={acc.adAccountName}>
                                                        {acc.adAccountName}
                                                    </span>
                                                    <span className="text-[9px] text-blue-400 font-mono italic">
                                                        ID: {acc.adAccountId}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Reconciliation Table with Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dữ liệu đối soát tài khoản</h2>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={handlePrevMonth}
                                className="p-1.5 hover:bg-white rounded-md transition-all shadow-sm"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center gap-2 px-3">
                                <Calendar size={14} className="text-gray-500" />
                                <span className="font-semibold text-[11px]">
                                    Tháng {month}/{year}
                                </span>
                            </div>
                            <button
                                onClick={handleNextMonth}
                                className="p-1.5 hover:bg-white rounded-md transition-all shadow-sm"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <button
                            onClick={fetchReconciliation}
                            disabled={loading}
                            title="Tải lại dữ liệu"
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <AdAccountReconciliationTable data={reconciliation} loading={loading} />
            </div>
        </div>
    );
};

export default AdAccountAuditReport;
