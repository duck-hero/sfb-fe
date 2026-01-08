import { useState, useEffect } from "react";
import { Plus, Trash, SquarePen, RotateCw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import collaboratorApi from "../../api/collaboratorApi";
import CollaboratorModal from "./CollaboratorModal";
import DeleteConfirmModal from "../../components/Modal/DeleteConfirmModal";

const CollaboratorList = () => {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCollaborators = async (page = 1) => {
    setLoading(true);
    try {
      const res = await collaboratorApi.getPagedList(page, pageSize);
      if (res.success) {
        setCollaborators(res.data || []);
        setTotalItems(res.totalItems || 0);
        setTotalPages(res.totalPages || 1);
        setPageNumber(page);
      }
    } catch (error) {
      console.error("Failed to fetch collaborators", error);
      toast.error("Không thể tải danh sách cộng tác viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const handleOpenAdd = () => {
    setSelectedCollaborator(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (collaborator) => {
    setSelectedCollaborator(collaborator);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (collaborator) => {
    setSelectedCollaborator(collaborator);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (data.id) {
        await collaboratorApi.update(data);
        toast.success("Cập nhật cộng tác viên thành công");
      } else {
        await collaboratorApi.create(data);
        toast.success("Thêm cộng tác viên mới thành công");
      }
      setIsModalOpen(false);
      fetchCollaborators(pageNumber);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await collaboratorApi.delete(selectedCollaborator.id);
      toast.success("Xóa cộng tác viên thành công");
      setIsDeleteModalOpen(false);
      const newPage = (collaborators.length === 1 && pageNumber > 1) ? pageNumber - 1 : pageNumber;
      fetchCollaborators(newPage);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : "Xóa thất bại");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
      {/* Header/Toolbar */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
        <div>
          <h3 className="text-base font-bold text-gray-800">Cộng tác viên (CTV)</h3>
          <p className="text-xs text-gray-500">Quản lý danh sách cộng tác viên hệ thống</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-primary-darkest transition-all shadow-sm font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          Tạo CTV
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <RotateCw className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-sm text-gray-400 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mã CTV</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên CTV</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {collaborators.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-gray-400 text-sm italic">
                    Chưa có cộng tác viên nào được tạo
                  </td>
                </tr>
              ) : (
                collaborators.map((collaborator) => (
                  <tr key={collaborator.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                      #{collaborator.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{collaborator.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      <div className="text-sm">{collaborator.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(collaborator)}
                          className="p-2 text-warning hover:bg-orange-50 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <SquarePen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(collaborator)}
                          className="p-2 text-error hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && collaborators.length > 0 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div className="text-sm text-gray-500 font-medium">
            Hiển thị <span className="font-bold text-gray-800">{collaborators.length}</span> trên <span className="font-bold text-gray-800">{totalItems}</span> CTV
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchCollaborators(pageNumber - 1)}
              disabled={pageNumber === 1}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700">
              {pageNumber} / {totalPages}
            </div>
            <button
              onClick={() => fetchCollaborators(pageNumber + 1)}
              disabled={pageNumber === totalPages}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <CollaboratorModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        saving={saving}
        initialData={selectedCollaborator}
      />

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa cộng tác viên "${selectedCollaborator?.name}"?`}
        loading={deleting}
      />
    </div>
  );
};

export default CollaboratorList;
