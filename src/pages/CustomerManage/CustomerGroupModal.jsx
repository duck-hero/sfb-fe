import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

/**
 * CustomerGroupModal
 * @param {boolean} open - Whether the modal is open
 * @param {function} onClose - Function to call when closing the modal
 * @param {function} onSave - Function to call when saving the group
 * @param {boolean} saving - Whether the group is being saved
 * @param {object} initialData - Optional data for editing
 */
const CustomerGroupModal = ({ open, onClose, onSave, saving, initialData }) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setName(initialData?.name || "");
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: initialData?.id, name });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">
            {initialData ? "Chỉnh sửa nhóm" : "Thêm nhóm mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên nhóm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: HUNG-HAHA"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-dark text-white text-sm font-bold rounded-xl hover:bg-primary-darkest transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {initialData ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerGroupModal;
