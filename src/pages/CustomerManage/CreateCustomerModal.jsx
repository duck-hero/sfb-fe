const CreateCustomerModal = ({ open, onClose, onSave, saving, formData, onChange, groups, users, collaborators, onImportClick }) => {
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cộng tác viên (CTV)</label>
            <select
              name="collaboratorId"
              value={formData.collaboratorId || ""}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">-- Chọn CTV --</option>
              {collaborators?.map((ctv) => (
                <option key={ctv.id} value={ctv.id}>
                  {ctv.name} ({ctv.code})
                </option>
              ))}
            </select>
          </div>

          {formData.collaboratorId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phần trăm CTV (%)</label>
              <input
                type="number"
                name="collaboratorRate"
                value={formData.collaboratorRate || null}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Nhập phần trăm"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          )}
        </div>

        {/* Import Button (Separate Row) */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={onImportClick}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center text-sm font-semibold shadow-sm"
          >
            <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            Import Customer (Excel)
          </button>
        </div>

        <div className="flex justify-end gap-3 mt-4">
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
