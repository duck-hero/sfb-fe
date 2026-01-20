import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { toast } from "react-toastify";
import { Upload, Download, X, FileText, AlertTriangle } from "lucide-react";
import customerAdsAccountApi from "../../api/customerAdsAccountApi";

export default function ImportSpendModal({
    open,
    onClose,
    onSuccess,
    customerId
}) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [resultData, setResultData] = useState(null);

    // Handle file selection
    const handleFileSelect = (file) => {
        if (!file) return;

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.xlsx')) {
            toast.error("Chỉ chấp nhận file có đuôi .xlsx");
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File không được vượt quá 10MB");
            return;
        }

        setSelectedFile(file);
        setResultData(null); // Reset result on new file select
    };

    // Handle drag and drop
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    // Handle file input change
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    // Download template
    // Note: Assuming there might be a template URL or we skip this if not provided yet.
    // Keeping structure similar to previous modal but commenting out if no template logic known yet.
    /*
    const handleDownloadTemplate = async () => {
        try {
            const link = document.createElement('a');
            link.href = '/templates/spend-template.xlsx'; 
            link.download = 'spend-template.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Đã tải xuống file mẫu");
        } catch (error) {
            toast.error("Không thể tải file mẫu");
        }
    };
    */

    // Handle import
    const handleImport = async () => {
        if (!selectedFile) {
            toast.warning("Vui lòng chọn file để import");
            return;
        }
        if (!customerId) {
            toast.error("Thiếu thông tin khách hàng");
            return;
        }

        setUploading(true);
        setResultData(null); // Clear previous results
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('customerId', customerId);

            // Call import API
            const res = await customerAdsAccountApi.importCustomerAdsAccountSpend(formData);

            if (res.success) {
                setResultData(res.data);
                toast.success("Import hoàn tất");
                onSuccess?.(); 
                // Don't close immediately so user can see the result stats
            } else {
                toast.error("Import thất bại: " + (res.message || "Lỗi không xác định"));
            }

        } catch (error) {
            toast.error(typeof error === 'string' ? error : "Import thất bại");
        } finally {
            setUploading(false);
        }
    };

    // Clear selected file
    const clearFile = () => {
        setSelectedFile(null);
        setResultData(null);
    };

    const closeAndReset = () => {
        onClose();
        setTimeout(() => {
            setSelectedFile(null);
            setResultData(null);
        }, 300);
    };

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-[70]" onClose={closeAndReset}>
                {/* Overlay */}
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

                {/* Modal Container */}
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
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                                {/* Title */}
                                <Dialog.Title className="text-xl font-semibold text-center mb-4 flex justify-between items-center">
                                    <span>Import Chi Tiêu</span>
                                    <button onClick={closeAndReset} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </Dialog.Title>

                                {/* Content */}
                                <div className="space-y-4">
                                    {/* Warning Note */}
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-amber-800 font-medium">
                                                    Lưu ý: Hệ thống chỉ nhận file có đuôi .xlsx
                                                    <br />
                                                    <span className="text-xs text-amber-600">(% phí sẽ áp dụng cho tất cả tài khoản và thẻ HDG mặc định)</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Result Display */}
                                    {resultData && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2 animate-in fade-in zoom-in duration-200">
                                            <h4 className="font-bold text-green-800 flex items-center gap-2">
                                                <FileText className="w-4 h-4" /> Kết quả Import
                                            </h4>
                                            <p className="text-sm text-green-700">{resultData.message}</p>
                                            
                                            {/* Not found IDs */}
                                            {resultData.notFoundAdAccountIds && resultData.notFoundAdAccountIds.length > 0 && (
                                                <div className="mt-2 bg-white rounded border border-red-200 p-2">
                                                    <p className="text-xs font-bold text-red-600 mb-1">
                                                        Không tìm thấy ({resultData.notFoundAdAccountIds.length}) tài khoản:
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto custom-scrollbar">
                                                        {resultData.notFoundAdAccountIds.map(id => (
                                                            <span key={id} className="bg-red-50 text-red-600 text-[10px] px-1.5 py-0.5 rounded border border-red-100 font-mono">
                                                                {id}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* File Upload Area - Hide if success? or allow another import? Let's keep it visible */}
                                    {!resultData && (
                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Chọn file để import
                                            </label>

                                            {/* Drag & Drop Area */}
                                            <div
                                                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                                                    ? 'border-blue-400 bg-blue-50'
                                                    : selectedFile
                                                        ? 'border-green-400 bg-green-50'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                                onDragEnter={handleDrag}
                                                onDragLeave={handleDrag}
                                                onDragOver={handleDrag}
                                                onDrop={handleDrop}
                                            >
                                                <input
                                                    type="file"
                                                    accept=".xlsx"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    disabled={uploading}
                                                />

                                                {selectedFile ? (
                                                    <div className="flex items-center justify-center">
                                                        <FileText className="h-8 w-8 text-green-500 mr-3" />
                                                        <div className="text-left">
                                                            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                clearFile();
                                                            }}
                                                            className="ml-3 p-1 hover:bg-gray-200 rounded-full"
                                                        >
                                                            <X className="h-4 w-4 text-gray-400" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <Upload className={`h-8 w-8 mx-auto mb-2 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                                                        <p className="text-sm text-gray-600">
                                                            Kéo thả file .xlsx vào đây hoặc <span className="text-blue-500 font-medium">chọn file</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={closeAndReset}
                                        disabled={uploading}
                                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50 text-sm font-medium"
                                    >
                                        {resultData ? "Đóng" : "Hủy"}
                                    </button>

                                    {!resultData && (
                                        <button
                                            onClick={handleImport}
                                            disabled={!selectedFile || uploading}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center ${uploading
                                                ? "bg-blue-400 cursor-not-allowed text-white"
                                                : selectedFile
                                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                    : "bg-gray-200 cursor-not-allowed text-gray-400"
                                                }`}
                                        >
                                            {uploading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Import
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
