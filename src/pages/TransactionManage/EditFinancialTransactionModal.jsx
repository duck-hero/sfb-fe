import React from "react";

export default function EditFinancialTransactionModal({
  open,
  onClose,
  formData,
  onChange,
  onSave,
  loading,
}) {
  const handleFormChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Chỉnh sửa giao dịch</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đối tượng hạch toán
                </label>
                <input
                  type="text"
                  value={formData.accountingObject}
                  onChange={(e) => handleFormChange("accountingObject", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập đối tượng hạch toán..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập nội dung..."
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={onSave}
                disabled={loading}
                className={`px-4 py-2 text-sm rounded-md ${
                  loading
                    ? 'bg-blue-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}