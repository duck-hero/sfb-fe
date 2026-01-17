import { useEffect, useRef, useState } from "react";
import { Search, Plus, SquarePen, Trash, Upload } from "lucide-react";
import { toast } from "react-toastify";

// API Imports

// Component Imports
import DeleteConfirmModal from "../../components/Modal/DeleteConfirmModal";
import TableSkeleton from "../../components/Loading/TableSkeleton";
import bmAccountApi from "../../api/bmAccountApi";
import bmSourceApi from "../../api/bmSourceApi";
import CreateBmAccountModal from "./CreateBmAccountModal";
import EditBmAccountModal from "./EditBmAccountModal";

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

function BmAccountList() {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [bmAccounts, setBmAccounts] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // --- STATE TÌM KIẾM ---
  // Chỉ tìm kiếm theo tên với debounce 300ms
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // --- STATE DROPDOWN (BM SOURCE) ---
  const [bmSourceList, setBmSourceList] = useState([]);

  // --- STATE MODAL EDIT ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form data được điều chỉnh theo cấu trúc BmAccount
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    bmSourceId: "",
  });

  // --- STATE MODAL CREATE ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // --- STATE DELETE ---
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const requestRef = useRef(0);

  // ---------------------- 1. FETCH LIST (BM ACCOUNTS) ----------------------
  const fetchBmAccounts = async () => {
    setLoading(true);
    try {
      // Gọi API GetPagedListBmAccount
      const res = await bmAccountApi.getBmAccountList(
        pageNumber,
        pageSize,
        debouncedSearchTerm.trim() // Sử dụng debounced search term
      );

      setBmAccounts(res?.data || []);
      setTotalItems(res?.totalItems || 0);
      setTotalPages(res?.totalItems ? Math.ceil(res.totalItems / pageSize) : 1);
    } catch (err) {
      console.error(err);
      toast.error("Lấy danh sách BM Account thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBmAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize, debouncedSearchTerm]);

  // Reset page when search term changes
  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearchTerm]);

  // ---------------------- 2. FETCH DROPDOWN (BM SOURCES) ----------------------
  useEffect(() => {
    const fetchBmSources = async () => {
      try {
        // Giả định hàm này tồn tại để lấy list nguồn đưa vào dropdown Create/Edit
        const res = await bmSourceApi.getBmSourceList(1, 100); 
        setBmSourceList(res?.data || []);
        
      } catch (err) {
        console.error("Lỗi lấy danh sách BM Source:", err);
      }
    };
    fetchBmSources();
  }, []);

  // ---------------------- 4. PAGINATION ----------------------
  const handlePrev = () => pageNumber > 1 && setPageNumber(pageNumber - 1);
  const handleNext = () => pageNumber < totalPages && setPageNumber(pageNumber + 1);
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageNumber(1);
  };

  // ---------------------- 5. EDIT HANDLERS ----------------------
//   const openEditModal = async (id) => {
//     setIsEditModalOpen(true);
//     setIsEditLoading(true);
    
//     const reqId = ++requestRef.current;

//     try {
//       const res = await bmAccountApi.getBmAccountById(id);
//       if (requestRef.current !== reqId) return;

//       const acc = res?.data;
//       // Map dữ liệu từ API vào form
//       setFormData({
//         id: acc?.id || 0,
//         name: acc?.name || "",
//         bmSourceId: acc?.bmSourceId || "",
//       });
//     } catch (err) {
//       console.error(err);
//       toast.error("Không tải được thông tin");
//       setIsEditModalOpen(false);
//     } finally {
//       if (requestRef.current === reqId) setIsEditLoading(false);
//     }
//   };
  const openEditModal = async (id) => {
      setIsEditModalOpen(true);
      setIsEditLoading(true);
      
      const reqId = ++requestRef.current;

      try {
        const res = await bmAccountApi.getBmAccountById(id);
        if (requestRef.current !== reqId) return;

        const acc = res?.data;
        // Map dữ liệu từ API vào form
        setFormData({
          id: acc?.id || 0,
          name: acc?.name || "",
          bmSourceId: acc?.bmSourceId || "",
          // !!! SỬA LỖI: Thêm trường status vào formData !!!
          status: acc?.status || "N/A", // LIVE , DIE , BACK
        });
      } catch (err) {
        toast.error(typeof err === 'string' ? err : "Không tải được thông tin");
        setIsEditModalOpen(false);
      } finally {
        if (requestRef.current === reqId) setIsEditLoading(false);
      }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await bmAccountApi.updateBmAccount(formData);
      toast.success("Cập nhật thành công");
      setIsEditModalOpen(false);
      fetchBmAccounts();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  // ---------------------- 6. CREATE HANDLERS ----------------------
  const openCreateModal = () => {
    setFormData({
      id: 0,
      name: "",
      bmSourceId: "", // Reset về rỗng
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async () => {
    if (!formData.name || !formData.bmSourceId) {
      toast.warning("Vui lòng nhập tên và chọn nguồn BM");
      return;
    }
    setSaving(true);
    try {
      await bmAccountApi.createBmAccount(formData.name, formData.bmSourceId);
      toast.success("Thêm mới thành công");
      setIsCreateModalOpen(false);
      fetchBmAccounts();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Thêm mới thất bại");
    } finally {
      setSaving(false);
    }
  };

  // ---------------------- 7. DELETE HANDLERS ----------------------
  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await bmAccountApi.deleteBmAccountById(itemToDelete.id);
      toast.success("Xóa thành công");
      fetchBmAccounts();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Xóa thất bại");
    } finally {
      setIsDeleting(false);
      setOpenDeleteModal(false);
      setItemToDelete(null);
    }
  };

  // ---------------------- RENDER ----------------------
  return (
    <div className="px-4">
      <h1 className="text-lg font-bold mb-3">Danh sách BM Gốc</h1>

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

          {/* Right Side: Search Filters */}
          <div className="flex-1 lg:max-w-sm">
            <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100 hover:shadow-md">
              <input
                type="text"
                placeholder="Tên BM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-gray-800 placeholder-gray-500 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-900 uppercase tracking-wider w-1/12 text-primary-darkest">
                  #
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-900 tracking-wider w-1/3 text-primary-darkest">
                  BM Gốc
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-900 tracking-wider w-1/3 text-primary-darkest">
                  Nguồn (Source)
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-900 tracking-wider w-1/3 text-primary-darkest">
                  Trạng thái
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-900 tracking-wider w-1/6 text-primary-darkest">
                  Tùy chọn
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                
              {bmAccounts.length > 0 ? (
                bmAccounts.map((x, index) => (
                  <tr key={x.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                      {(pageNumber - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {x.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                      {/* Hiển thị tên Source nếu API trả về, nếu không hiển thị ID */}
                      {x.sourceName }
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {x.status === "LIVE" ? (
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-bold uppercase tracking-wider text-[10px]">
                          LIVE
                        </span>
                      ) : x.status === "DIE" ? (
                        <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-bold uppercase tracking-wider text-[10px]">
                          DIE
                        </span>
                      ) : x.status === "BACK" ? (
                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
                          BACK
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-bold uppercase tracking-wider text-[10px]">
                          {x.status || "N/A"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 flex items-center">
                      <button onClick={() => openEditModal(x.id)}>
                        <SquarePen className="h-4 w-4 text-warning mr-2 hover:scale-110 transition-transform cursor-pointer" />
                      </button>
                      <button onClick={() => handleOpenDelete(x)}>
                        <Trash className="h-4 w-4 text-error hover:scale-110 transition-transform cursor-pointer" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan="6" className="px-3 py-3 text-center text-gray-500 text-sm">
                      Không tìm thấy dữ liệu
                   </td>
                </tr>
              )}
            </tbody>

            {/* Footer Pagination */}
            <tfoot className="bg-white">
              <tr>
                <td colSpan="4" className="px-3 py-2">
                  <div className="flex justify-end items-center text-xs">
                    <div className="flex items-center gap-1.5 mr-4">
                      <span className="text-gray-700">Hiển thị:</span>
                      <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="border border-gray-300 rounded px-1.5 py-0.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                      </select>
                    </div>

                    <span className="text-gray-700 mr-4">
                      {totalItems > 0 ? ((pageNumber - 1) * pageSize) + 1 : 0}–
                      {Math.min(pageNumber * pageSize, totalItems)} trên {totalItems}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handlePrev}
                        disabled={pageNumber === 1}
                        className={`p-1.5 rounded-full transition duration-150 ${pageNumber === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={pageNumber === totalPages || totalPages === 0}
                        className={`p-1.5 rounded-full transition duration-150 ${pageNumber === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* --- MODALS --- */}
      
      <EditBmAccountModal
        open={isEditModalOpen}
        loading={isEditLoading}
        saving={saving}
        formData={formData}
        onChange={handleChange}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        bmSourceList={bmSourceList} 
      />

      <CreateBmAccountModal
        open={isCreateModalOpen}
        formData={formData}
        onChange={handleChange}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
        saving={saving}
        bmSourceList={bmSourceList} 
      /> 
     

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa BM Account "${itemToDelete?.name}" không?`}
        loading={isDeleting}
      />
    </div>
  );
}

export default BmAccountList;