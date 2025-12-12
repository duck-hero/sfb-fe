import React, { useEffect, useState } from "react";
import accountApi from "../../api/accountApi";
import AddUserModal from "./AddUserModal";
import { toast } from "react-toastify";
import { Pencil, Trash2, Plus, UserPlus } from "lucide-react";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination State
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers(pagination.pageNumber);
  }, []);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await accountApi.getUserList(page, pagination.pageSize);
      if (res && res.success) {
        setUsers(res.data);
        setPagination((prev) => ({
          ...prev,
          pageNumber: res.pageNumber,
          totalPages: res.totalPages,
          totalItems: res.totalItems,
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchUsers(newPage);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.userName}"?`)) {
      try {
        await accountApi.deleteUser(user.id);
        toast.success("Xóa người dùng thành công");
        fetchUsers(pagination.pageNumber);
      } catch (err) {
        console.error(err);
        toast.error("Xóa thất bại");
      }
    }
  };

  const handleSuccess = () => {
    fetchUsers(pagination.pageNumber);
  };

  return (
    <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý phân quyền</h1>
            <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
            >
            <UserPlus size={18} />
            Add User
            </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                        <th className="px-6 py-4">Tên đăng nhập</th>
                        <th className="px-6 py-4">Họ tên</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">SĐT</th>
                        <th className="px-6 py-4">Quyền</th>
                        <th className="px-6 py-4 text-center">Hành động</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                Đang tải dữ liệu...
                            </td>
                        </tr>
                    ) : users.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                Không có người dùng nào.
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">{user.userName}</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{user.name}</td>
                            <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                            <td className="px-6 py-3 text-sm text-gray-600">{user.phoneNumber || "-"}</td>
                            <td className="px-6 py-3 text-sm">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {user.roles && user.roles.length > 0 ? user.roles.join(", ") : "N/A"}
                                </span>
                            </td>
                            <td className="px-6 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <button
                                onClick={() => handleEdit(user)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                title="Chỉnh sửa"
                                >
                                <Pencil size={16} />
                                </button>
                                <button
                                onClick={() => handleDelete(user)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                                title="Xóa"
                                >
                                <Trash2 size={16} />
                                </button>
                            </div>
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            <div className="mt-4 bg-white rounded-lg shadow-sm p-3">
                <div className="flex justify-end items-center text-xs">
                    {/* Select Page Size */}
                    <div className="flex items-center gap-1.5 mr-4">
                        <span className="text-gray-700">Hiển thị:</span>
                        <select
                            value={pagination.pageSize}
                            onChange={(e) => {
                                setPagination(prev => ({ ...prev, pageSize: Number(e.target.value), pageNumber: 1 }));
                                fetchUsers(1); // Trigger fetch with new page size
                            }}
                            className="border border-gray-300 rounded px-1.5 py-0.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                        </select>
                    </div>

                    {/* Show Count */}
                    <span className="text-gray-700 mr-4">
                        {(pagination.pageNumber - 1) * pagination.pageSize + 1}–
                        {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalItems)} trên {pagination.totalItems}
                    </span>

                    {/* Prev/Next Buttons */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => handlePageChange(pagination.pageNumber - 1)}
                            disabled={pagination.pageNumber === 1}
                            className={`p-1.5 rounded-full transition duration-150 ${
                                pagination.pageNumber === 1
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>

                        <button
                            onClick={() => handlePageChange(pagination.pageNumber + 1)}
                            disabled={pagination.pageNumber === pagination.totalPages}
                            className={`p-1.5 rounded-full transition duration-150 ${
                                pagination.pageNumber === pagination.totalPages
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Modal */}
        <AddUserModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSuccess={handleSuccess}
            userToEdit={editingUser}
        />
    </div>
  );
}
