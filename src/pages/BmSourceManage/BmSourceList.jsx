import { useEffect, useRef, useState } from "react";
import DeleteConfirmModal from "../../components/Modal/DeleteConfirmModal";
import bmSourceApi from "../../api/bmSourceApi";
import { toast } from "react-toastify";
import { Search, Plus, SquarePen, Trash, Upload } from "lucide-react";
import TableSkeleton from "../../components/Loading/TableSkeleton";
import CreateBmModal from "./CreateBmModal";
import EditBmSourceModal from "./EditBmSourceModal";

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function BmSourceList() {
  const [bmSources, setBmSources] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchCode, setSearchCode] = useState("");
  const debouncedSearchCode = useDebounce(searchCode, 300);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [selectedBmSource, setSelectedBmSource] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    sourceName: "",
    sourceFeePercent: 0,
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
      toast.error("Lấy danh sách ngân hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBmSources(pageNumber, pageSize, debouncedSearchCode.trim());
  }, [pageNumber, pageSize, debouncedSearchCode]);

  // Reset page when search changes
  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearchCode]);

  const handlePrev = () => pageNumber > 1 && setPageNumber(pageNumber - 1);
  const handleNext = () =>
    pageNumber < totalPages && setPageNumber(pageNumber + 1);
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageNumber(1);
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
        id: bmSource?.id ?? 0,
        sourceName: bmSource?.sourceName ?? "",
        sourceFeePercent: (bmSource?.sourceFeePercent || 0) * 100,
      });
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Load chi tiết ngân hàng thất bại");
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
        sourceName: formData.sourceName,
        sourceFeePercent: Number(formData.sourceFeePercent) / 100,
      });
      toast.success("Cập nhật ngân hàng thành công");
      setIsEditModalOpen(false);
      requestRef.current++;
      fetchBmSources(pageNumber, pageSize, debouncedSearchCode.trim());
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Cập nhật thất bại");
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
    setFormData({ sourceName: "", sourceFeePercent: 0 });
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async () => {
    setSaving(true);
    try {
      await bmSourceApi.createBmSource({
        sourceName: formData.sourceName,
        sourceFeePercent: Number(formData.sourceFeePercent) / 100
      });
      toast.success("Thêm Bm thành công");
      setIsCreateModalOpen(false);
      fetchBmSources(pageNumber, pageSize, debouncedSearchCode.trim());
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Thêm thất bại!");
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
      fetchBmSources(pageNumber, pageSize, debouncedSearchCode.trim());
    } catch (err) {
      console.error(err);
      toast.error(typeof err === "string" ? err : "Xóa thất bại");
    }
    setIsDeleting(false);
    setOpenDeleteModal(false);
    setBmSourceToDelete(null);
  };

  // ------------------------- RENDER -------------------------
  return (
    <div className="px-4">
      <h1 className="text-lg font-bold mb-3">Danh sách Đầu tổng</h1>

      {/* --- SEARCH BAR SECTION --- */}
      <div className="pb-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          {/* Left Side: Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Button: Create New */}
            <button
              className="px-4 py-2.5 rounded-lg font-semibold text-sm transition bg-primary-dark text-white hover:bg-primary-darkest focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-offset-2 active:bg-primary-darkest flex items-center justify-center"
              onClick={openCreateModal}
            >
              <Plus className="h-4 w-4 mr-2" /> Tạo mới
            </button>
          </div>

          {/* Right Side: Search Input */}
          <div className="flex-1 lg:max-w-sm">
            <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100 hover:shadow-md">
              <input
                type="text"
                placeholder="Tên Đầu tổng..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full text-gray-800 placeholder-gray-500 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium text-gray-900 uppercase tracking-wider w-1/12 text-primary-darkest"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium text-gray-900  tracking-wider w-1/4 text-primary-darkest"
                >
                  Đầu tổng
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium text-gray-900  tracking-wider w-1/6 text-primary-darkest"
                >
                  Phí (%)
                </th>

                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium text-gray-900  tracking-wider w-1/12 text-primary-darkest"
                >
                  Tùy chọn
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                            {bmSources.length === 0 && (
                <tr>
                   <td colSpan="6" className="px-3 py-3 text-center text-gray-500 text-sm">
                      Không tìm thấy dữ liệu
                   </td>
                </tr>
              )}
              {bmSources.map((bmSource, index) => (
                <tr key={bmSource.id} className="">
                  <td className="w-1/12 px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {(pageNumber - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bmSource.sourceName}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {(bmSource.sourceFeePercent * 100).toFixed(1)}%
                  </td>
                  <td className="w-1/12 px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    <button
                      className=" "
                      onClick={() => openEditModal(bmSource.id)}
                    >
                      <SquarePen className="h-4 w-4 text-warning mr-2 ml-1.5 flex-shrink-0 cursor-pointer" />
                    </button>
                    <button
                      className=""
                      onClick={() => handleOpenDelete(bmSource)}
                    >
                      <Trash className="h-4 w-4 text-error mr-2 flex-shrink-0 cursor-pointer" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="bg-white">
              <tr>
                <td colSpan="4" className="px-3 py-2">
                  <div className="flex justify-end items-center text-xs">
                    {/* Component chọn số lượng hàng trên mỗi trang */}
                    <div className="flex items-center gap-1.5 mr-4">
                      <span className="text-gray-700">Hiển thị:</span>
                      <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="border border-gray-300 rounded px-1.5 py-0.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                      >
                        <option value={15}>15</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                      </select>
                    </div>

                    {/* Thông tin số lượng hàng đang hiển thị (Đã sử dụng totalItems) */}
                    <span className="text-gray-700 mr-4">
                      {(pageNumber - 1) * pageSize + 1}–
                      {Math.min(pageNumber * pageSize, totalItems)} trên{" "}
                      {totalItems}
                    </span>

                    {/* Các nút điều hướng (Prev/Next) */}
                    <div className="flex items-center gap-1.5">
                      {/* Nút Previous */}
                      <button
                        onClick={handlePrev}
                        disabled={pageNumber === 1}
                        className={`p-1.5 rounded-full transition duration-150 ${
                          pageNumber === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
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
                        disabled={pageNumber === totalPages} // Sử DỤNG totalPages
                        className={`p-1.5 rounded-full transition duration-150 ${
                          pageNumber === totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
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
