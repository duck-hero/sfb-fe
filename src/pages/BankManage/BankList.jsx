import { useEffect, useRef, useState } from "react";
import bankApi from "../../api/bankApi";
import DeleteConfirmModal from "../../components/Modal/DeleteConfirmModal";
import EditBankModal from "./EditBankModal";
import CreateBankModal from "./CreateBankModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, Plus, SquarePen, Trash   } from 'lucide-react';
import TableSkeleton from "../../components/Loading/TableSkeleton";

function BankList() {
  const [banks, setBanks] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchCode, setSearchCode] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: 0, bankName: "", bankCode: "" });
  const [saving, setSaving] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [bankToDelete, setBankToDelete] = useState(null);

const [totalItems, setTotalItems] = useState(0);

const [isDeleting, setIsDeleting] = useState(false);


  // requestRef để tránh race condition khi mở Edit modal
  const requestRef = useRef(0);

  // ------------------------- FETCH BANKS -------------------------
const fetchBanks = async (page, size, code = "") => {
  setLoading(true);
  try {
    const response = await bankApi.getBankList(page, size, code);
    
    // 1. Cập nhật totalItems
    setTotalItems(response?.totalItems || 0); 

    setBanks(response?.data || []);
    setTotalPages(response?.totalItems ? Math.ceil(response.totalItems / size) : 1);
    setPageNumber(response?.pageNumber || page);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách ngân hàng:", error);
    toast.error("Lấy danh sách ngân hàng thất bại");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchBanks(pageNumber, pageSize, searchKeyword);
}, [pageNumber, pageSize, searchKeyword]);


  const handlePrev = () => pageNumber > 1 && setPageNumber(pageNumber - 1);
  const handleNext = () => pageNumber < totalPages && setPageNumber(pageNumber + 1);
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
    setSelectedBank(id);
    setFormData({ id: 0, bankName: "", bankCode: "" });

    try {
      const res = await bankApi.getBankById(id);
      if (requestRef.current !== reqId) return; // bỏ response cũ
      const bank = res?.data;
      setFormData({ id: bank?.id ?? 0, bankName: bank?.name ?? "", bankCode: bank?.codeBank ?? "" });
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Load chi tiết ngân hàng thất bại");
    } finally {
      if (requestRef.current === reqId) setIsEditLoading(false);
    }
  };

  const handleEditChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await bankApi.updateBank({ id: formData.id, bankName: formData.bankName, bankCode: formData.bankCode });
      toast.success("Cập nhật ngân hàng thành công");
      setIsEditModalOpen(false);
      requestRef.current++;
      fetchBanks(pageNumber, pageSize, searchCode.trim());
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Cập nhật thất bại");
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
    setFormData({ bankName: "", bankCode: "" });
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async () => {
    setSaving(true);
    try {
      await bankApi.createBank(formData.bankName, formData.bankCode);
      toast.success("Thêm ngân hàng thành công");
      setIsCreateModalOpen(false);
      fetchBanks(pageNumber, pageSize, searchCode.trim());
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Thêm thất bại!");
    } finally {
      setSaving(false);
    }
  };

  // ------------------------- DELETE BANK -------------------------
  const handleOpenDelete = (bank) => {
    setBankToDelete(bank);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
     setIsDeleting(true);
    try {
      await bankApi.deleteBankById(bankToDelete.id);
      toast.success("Xóa thành công");
      fetchBanks(pageNumber, pageSize, searchCode.trim());
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Xóa thất bại");
    }
      setIsDeleting(false);
    setOpenDeleteModal(false);
    setBankToDelete(null);
  };

  // ------------------------- RENDER -------------------------
  return (
    <div className="px-4">
      <h1 className="text-lg font-bold mb-3">Danh sách ngân hàng</h1>

      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
  <div className="w-full max-w-3xl">
      <div 
        className="flex items-center w-full px-3 py-1.5 bg-white 
                   border border-gray-200 rounded-lg shadow-md 
                   transition-all duration-300 ease-in-out
                   focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100"
      >
        {/* Icon tìm kiếm màu xanh nằm bên trái */}
        <Search className="h-4 w-4 text-primary-darkest mr-2 flex-shrink-0" />
        
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
                     text-sm focus:outline-none"
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
          className="px-3 py-1.5 rounded-lg font-semibold text-sm transition bg-primary-dark text-white hover:bg-primary-darkest cursor-pointer"
          onClick={openCreateModal}
        >
        <Plus className="h-4 w-4 inline-block mr-1.5" />Tạo mới
        </button>


      </div>



      {loading ? (
       <TableSkeleton/>
      ) : (
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-900 uppercase tracking-wider w-1/12 text-primary-darkest"
            >#</th>
             <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-900  tracking-wider w-1/4 text-primary-darkest"
            >Tên ngân hàng</th>
              <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-900  tracking-wider w-1/4 text-primary-darkest"
            >Mã ngân hàng</th>
            <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-900  tracking-wider w-1/12 text-primary-darkest"
            >Tùy chọn</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
                          {banks.length === 0 && (
                <tr>
                   <td colSpan="12" className="px-3 py-3 text-center text-gray-500 text-sm">
                      Không tìm thấy dữ liệu
                   </td>
                </tr>
              )}
            {banks.map((bank, index) => (
              <tr key={bank.id} className="">
                <td className="w-1/12 px-3 py-2 whitespace-nowrap text-xs text-gray-500">{(pageNumber - 1) * pageSize + index + 1}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{bank.name}</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{bank.codeBank}</td>
                <td className="w-1/12 px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                  <button className=" " onClick={() => openEditModal(bank.id)}><SquarePen className="h-4 w-4 text-warning mr-2 ml-1.5 flex-shrink-0 cursor-pointer"/></button>
                  <button className="" onClick={() => handleOpenDelete(bank)}><Trash className="h-4 w-4 text-error mr-2 flex-shrink-0 cursor-pointer"/></button>
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
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>
        
        {/* Thông tin số lượng hàng đang hiển thị (Đã sử dụng totalItems) */}
        <span className="text-gray-700 mr-4">
          {((pageNumber - 1) * pageSize) + 1}–{Math.min(pageNumber * pageSize, totalItems)} trên {totalItems}
        </span>
        
        {/* Các nút điều hướng (Prev/Next) */}
        <div className="flex items-center gap-1.5">
          {/* Nút Previous */}
          <button
            onClick={handlePrev}
            disabled={pageNumber === 1}
            className={`p-1.5 rounded-full transition duration-150 ${
              pageNumber === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>

          {/* Nút Next (Điều kiện disabled được làm gọn hơn một chút) */}
          <button
            onClick={handleNext}
            disabled={pageNumber === totalPages} // Sử DỤNG totalPages
            className={`p-1.5 rounded-full transition duration-150 ${
              pageNumber === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
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
      <EditBankModal
        open={isEditModalOpen}
        loading={isEditLoading}
        saving={saving}
        formData={formData}
        onChange={handleEditChange}
        onClose={closeEditModal}
        onSave={handleEditSave}
      />

      <CreateBankModal
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
        message={`Bạn có chắc chắn muốn xóa "${bankToDelete?.name}" không?`}
          loading={isDeleting} 
      />
    </div>
  );
}

export default BankList;
