import React, { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import accountApi from "../../api/accountApi";
import roleApi from "../../api/roleApi";

export default function AddUserModal({ open, onClose, onSuccess, userToEdit = null }) {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    name: "",
    phoneNumber: "",
    roleId: "",
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      // 1. Fetch roles first
      fetchRoles();
      // 2. Set basic data
      if (userToEdit) {
        setFormData({
            userName: userToEdit.userName || "",
            email: userToEdit.email || "",
            name: userToEdit.name || "",
            phoneNumber: userToEdit.phoneNumber || "",
            roleId: "", // Will be set after roles are loaded
            id: userToEdit.id
        });
      } else {
        setFormData({
          userName: "",
          email: "",
          name: "",
          phoneNumber: "",
          roleId: "",
        });
      }
      setError("");
    }
  }, [open, userToEdit]);

  // New Effect: Sync roleId once roles are loaded and we have a userToEdit
  useEffect(() => {
    if (open && userToEdit && roles.length > 0) {
       // Find role ID based on role name (assuming first role)
       const userRoleName = userToEdit.roles && userToEdit.roles.length > 0 ? userToEdit.roles[0] : null;
       if (userRoleName) {
           const matchingRole = roles.find(r => r.name === userRoleName);
           if (matchingRole) {
               setFormData(prev => ({ ...prev, roleId: matchingRole.id }));
           }
       }
    }
  }, [roles, userToEdit, open]);

  const fetchRoles = async () => {
    try {
      const res = await roleApi.getRoles(1, 100); // Fetch all roles (assuming < 100)
      if (res && res.data) {
        setRoles(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch roles", err);
      toast.error("Không thể tải danh sách quyền");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (userToEdit) {
         await accountApi.updateUser(formData);
         toast.success("Cập nhật người dùng thành công");
      } else {
         await accountApi.createUser(formData);
         toast.success("Thêm người dùng mới thành công");
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(typeof err === "string" ? err : (err?.message || "Có lỗi xảy ra"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4"
                >
                  {userToEdit ? "Cập nhật người dùng" : "Thêm người dùng mới"}
                </Dialog.Title>

                {error && (
                  <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      required
                      disabled={!!userToEdit} // Usually username is immutable or depends on backend
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quyền (Role)</label>
                    <select
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    >
                      <option value="">-- Chọn quyền --</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none"
                      onClick={onClose}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                    >
                      {loading ? "Đang xử lý..." : (userToEdit ? "Cập nhật" : "Thêm mới")}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
