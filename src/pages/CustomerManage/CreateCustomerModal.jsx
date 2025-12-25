  const CreateCustomerModal = ({ open, onClose, onSave, saving, formData, onChange, groups, users }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Thêm khách hàng mới</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng (*)</label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nhập tên khách hàng"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agency Code</label>
            <input
              type="text"
              name="agencyCode"
              value={formData.agencyCode || ""}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nhập agency code"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm</label>
            <select
              name="customerGroupId"
              value={formData.customerGroupId || ""}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">-- Chọn nhóm --</option>
              {groups?.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NV phụ trách</label>
            <select
              name="operatorUserId"
              value={formData.operatorUserId || ""}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">-- Chọn nhân viên --</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName || user.userName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomerModal;
