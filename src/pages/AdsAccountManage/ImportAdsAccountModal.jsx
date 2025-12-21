import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Upload, Download, X, FileText } from "lucide-react";
import adsAccountApi from "../../api/adsAccountApi";

export default function ImportAdsAccountModal({
  open,
  onClose,
  onSuccess
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
  const handleDownloadTemplate = async () => {
    try {
      // Create a temporary link to download template
      const link = document.createElement('a');
      link.href = '/templates/ads-account-template.xlsx'; // Path to template file
      link.download = 'ads-account-template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Đã tải xuống file mẫu");
    } catch (error) {
      toast.error("Không thể tải file mẫu");
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!selectedFile) {
      toast.warning("Vui lòng chọn file để import");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Call import API
      await adsAccountApi.importAdsAccounts(formData);

      toast.success("Import dữ liệu thành công!");
      onSuccess?.();
      onClose();
      setSelectedFile(null);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : "Import thất bại");
    } finally {
      setUploading(false);
    }
  };

  // Clear selected file
  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
          <div className="fixed inset-0 bg-black/30" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                {/* Title */}
                <Dialog.Title className="text-xl font-semibold text-center mb-4">
                  Import Tài Khoản Quảng Cáo
                </Dialog.Title>

                {/* Content */}
                <div className="space-y-4">
                  {/* Warning Note */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-amber-800 font-medium">
                          Lưu ý: Hệ thống chỉ nhận file có đuôi .xlsx
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Download Template */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-sm text-blue-800">File mẫu để import</span>
                    <button
                      onClick={handleDownloadTemplate}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Tải xuống mẫu
                    </button>
                  </div>

                  {/* File Upload Area */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Chọn file để import
                    </label>

                    {/* Drag & Drop Area */}
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive
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
                </div>

                {/* Buttons */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    disabled={uploading}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition disabled:opacity-50"
                  >
                    Hủy
                  </button>

                  <button
                    onClick={handleImport}
                    disabled={!selectedFile || uploading}
                    className={`px-4 py-2 rounded-lg font-semibold transition flex items-center ${
                      uploading
                        ? "bg-blue-400 cursor-not-allowed"
                        : selectedFile
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-300 cursor-not-allowed text-gray-500"
                    }`}
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang import...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
