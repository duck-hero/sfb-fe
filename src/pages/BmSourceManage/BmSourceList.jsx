import React, { useEffect, useRef, useState } from "react";
import DeleteConfirmModal from "../../components/Modal/DeleteConfirmModal";
import bmSourceApi from "../../api/bmSourceApi";
import { toast } from "react-toastify";
import { Search, Plus, SquarePen, Trash } from "lucide-react";
import TableSkeleton from "../../components/Loading/TableSkeleton";
import CreateBmModal from "./CreateBmModal";
import EditBmSourceModal from "d:/Private/Project/Project/sfb/sfb-project/src/pages/BmSourceManage/EditBmSourceModal";

function BmSourceList() {
  const [bmSources, setBmSources] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchCode, setSearchCode] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [selectedBmSource, setSelectedBmSource] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    sourceName: "",
  });
  const [saving, setSaving] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [bmSourceToDelete, setBmSourceToDelete] = useState(null);

  const [totalItems, setTotalItems] = useState(0);

  const [isDeleting, setIsDeleting] = useState(false);

  // requestRef để tránh race condition khi mở Edit modal
  const requestRef = useRef(0);

  // ------------------------- FETCH BANKS -------------------------
  const fetchBmSources = async (page, size, code = "") => {
    setLoading(true);
    try {
      const response = await bmSourceApi.getBmSourceList(page, size, code);

      // 1. Cập nhật totalItems
      setTotalItems(response?.totalItems || 0);

      setBmSources(response?.data || []);
      setTotalPages(
        response?.totalItems ? Math.ceil(response.totalItems / size) : 1
      );
      setPageNumber(response?.pageNumber || page);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách ngân hàng:", error);
      toast.error("Lấy danh sách ngân hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBmSources(pageNumber, pageSize, searchKeyword);
  }, [pageNumber, pageSize, searchKeyword]);

  const handlePrev = () => pageNumber > 1 && setPageNumber(pageNumber - 1);
  const handleNext = () =>
    pageNumber < totalPages && setPageNumber(pageNumber + 1);
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageNumber(1);
  };

  const handleSearch = () => {
    setPageNumber(1);
    setSearchKeyword(searchCode.trim());
  };

  // ------------------------- EDIT BANK -------------------------
  const openEditModal = async (id) => {
    const reqId = ++requestRef.current;
    setIsEditModalOpen(true);
    setIsEditLoading(true);
    setSelectedBmSource(id);
    setFormData({ id: 0, sourceName: "" });

    try {
      const res = await bmSourceApi.getBmSourceById(id);
      if (requestRef.current !== reqId) return; // bỏ response cũ
      const bmSource = res?.data;
      setFormData({
        id: bmSource?.id ?? 0, // SỬA: Thay đổi bmSource?.name thành bmSource?.sourceName
        sourceName: bmSource?.sourceName ?? "",
      });
    } catch (err) {
      console.error("Lỗi load chi tiết bmSource:", err);
      toast.error("Load chi tiết ngân hàng thất bại");
    } finally {
      if (requestRef.current === reqId) setIsEditLoading(false);
    }
  };

  const handleEditChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await bmSourceApi.updateBmSource({
        id: formData.id,
        sourceName: formData.sourceName, // <--- Đã đúng
      });
      toast.success("Cập nhật ngân hàng thành công");
      setIsEditModalOpen(false);
      requestRef.current++;
      fetchBmSources(pageNumber, pageSize, searchCode.trim());
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    requestRef.current++;
    setIsEditLoading(false);
  };

  // ------------------------- CREATE BANK -------------------------
  const openCreateModal = () => {
    setFormData({ sourceName: "", bmSourceCode: "" });
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async () => {
    setSaving(true);
    try {
      await bmSourceApi.createBmSource(formData.sourceName);
      toast.success("Thêm Bm thành công");
      setIsCreateModalOpen(false);
      fetchBmSources(pageNumber, pageSize, searchCode.trim());
    } catch (err) {
      console.error(err);
      toast.error("Thêm thất bại!");
    } finally {
      setSaving(false);
    }
  };

  // ------------------------- DELETE BANK -------------------------
  const handleOpenDelete = (bmSource) => {
    setBmSourceToDelete(bmSource);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await bmSourceApi.deleteBmSourceById(bmSourceToDelete.id);
      toast.success("Xóa thành công");
      fetchBmSources(pageNumber, pageSize, searchCode.trim());
    } catch (err) {
      console.error(err);
      toast.error("Xóa thất bại");
    }
    setIsDeleting(false);
    setOpenDeleteModal(false);
    setBmSourceToDelete(null);
  };

  // ------------------------- RENDER -------------------------
  return (
    <div className="px-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách BM</h1>

      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
        <div className="w-full max-w-3xl">
          <div
            className="flex items-center w-full px-5 py-2 bg-white 
                   border border-gray-200 rounded-xl shadow-lg 
                   transition-all duration-300 ease-in-out
                   focus-within:border-primary-darkest focus-within:ring-4 focus-within:ring-blue-100"
          >
            {/* Icon tìm kiếm màu xanh nằm bên trái */}
            <Search className="h-5 w-5 text-primary-darkest mr-3 flex-shrink-0" />

            {/* Input field, chiếm hết không gian còn lại */}
            <input
              type="text"
              placeholder="Tìm kiếm theo mã ngân hàng..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              // Input không có border và outline riêng, để container quản lý style
              className="w-full text-gray-800 placeholder-gray-500 bg-transparent 
                     text-base focus:outline-none"
            />
          </div>
          {/* <button

          className="px-4 py-2 bg-blue-600 text-white rounded"

          onClick={handleSearch}

        >

    <Search />

        </button> */}
        </div>
        <button
          className="  px-5 py-2 rounded-xl font-semibold text-md transition bg-primary-dark text-white hover:bg-primary-darkest cursor-pointer"
          onClick={openCreateModal}
        >
                <Plus className="h-5 w-5 inline-block mr-2" />
          Tạo mới
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div class="overflow-x-auto shadow-lg rounded-xl">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-md font-medium text-gray-900 uppercase tracking-wider w-1/12 text-primary-darkest"
                >
                  #
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-md font-medium text-gray-900  tracking-wider w-1/4 text-primary-darkest"
                >
                  Tên BM
                </th>

                <th
                  scope="col"
                  class="px-6 py-3 text-left text-md font-medium text-gray-900  tracking-wider w-1/12 text-primary-darkest"
                >
                  Tùy chọn
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bmSources.map((bmSource, index) => (
                <tr key={bmSource.id} className="">
                  <td className="w-1/12 px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(pageNumber - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bmSource.sourceName}
                  </td>
                  <td className="w-1/12 px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      className=" "
                      onClick={() => openEditModal(bmSource.id)}
                    >
                      <SquarePen className="h-5 w-5 text-warning mr-3 ml-2 flex-shrink-0 cursor-pointer" />
                    </button>
                    <button
                      className=""
                      onClick={() => handleOpenDelete(bmSource)}
                    >
                      <Trash className="h-5 w-5 text-error mr-3 flex-shrink-0 cursor-pointer" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="bg-white">
              <tr>
                <td colSpan="4" className="px-6 py-3">
                  <div className="flex justify-end items-center text-sm">
                    {/* Component chọn số lượng hàng trên mỗi trang */}
                    <div className="flex items-center gap-2 mr-6">
                      <span className="text-gray-700">Hiển thị:</span>
                      <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                      </select>
                    </div>

                    {/* Thông tin số lượng hàng đang hiển thị (Đã sử dụng totalItems) */}
                    <span className="text-gray-700 mr-6">
                      {(pageNumber - 1) * pageSize + 1}–
                      {Math.min(pageNumber * pageSize, totalItems)} trên{" "}
                      {totalItems}
                    </span>

                    {/* Các nút điều hướng (Prev/Next) */}
                    <div className="flex items-center gap-2">
                      {/* Nút Previous */}
                      <button
                        onClick={handlePrev}
                        disabled={pageNumber === 1}
                        className={`p-2 rounded-full transition duration-150 ${
                          pageNumber === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 19l-7-7 7-7"
                          ></path>
                        </svg>
                      </button>

                      {/* Nút Next (Điều kiện disabled được làm gọn hơn một chút) */}
                      <button
                        onClick={handleNext}
                        disabled={pageNumber === totalPages} // SỬ DỤNG totalPages
                        className={`p-2 rounded-full transition duration-150 ${
                          pageNumber === totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* MODALS */}
      <EditBmSourceModal
        open={isEditModalOpen}
        loading={isEditLoading}
        saving={saving}
        formData={formData}
        onChange={handleEditChange}
        onClose={closeEditModal}
        onSave={handleEditSave}
      />

      <CreateBmModal
        open={isCreateModalOpen}
        formData={formData}
        onChange={handleEditChange}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
        saving={saving}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận"
        message={`Bạn có chắc chắn muốn xóa "${bmSourceToDelete?.sourceName}" không?`}
        loading={isDeleting}
      />
    </div>
  );
}

export default BmSourceList;
