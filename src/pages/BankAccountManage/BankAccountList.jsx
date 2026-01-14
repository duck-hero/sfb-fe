import { useEffect, useRef, useState } from "react";
import bankAccountApi from "../../api/bankAccountApi";
import { Search, Plus, SquarePen, Trash, Upload } from "lucide-react";
import { toast } from "react-toastify";

// import EditBankAccountModal from "./EditBankAccountModal";   // <-- modal edit tài khoản ngân hàng
// import CreateBankAccountModal from "./CreateBankAccountModal"; // <-- modal tạo tài khoản ngân hàng
import DeleteConfirmModal from "../../components/Modal/DeleteConfirmModal";
import TableSkeleton from "../../components/Loading/TableSkeleton";
import bankApi from "../../api/bankApi";
import EditBankAccountModal from "./EditBankAccountModal";
import CreateBankAccountModal from "./CreateBankAccountModal";

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

function BankAccountList() {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // Helper function để format loại tài khoản
  const formatAccountType = (type) => {
    switch (type) {
      case 1:
        return "Tài khoản chi tiêu FB";
      case 2:
        return "Tài khoản thu chi";
      case 3:
        return "Tài khoản lợi nhuận";
      default:
        return "Khác";
    }
  };

  // Search fields with debounce
  const [searchAccountNumber, setSearchAccountNumber] = useState("");
  const [searchHolderName, setSearchHolderName] = useState("");
  const [bankList, setBankList] = useState([]);
  const [searchBankId, setSearchBankId] = useState(""); // filter dropdown

  // Debounced search values (300ms delay)
  const debouncedAccountNumber = useDebounce(searchAccountNumber, 300);
  const debouncedHolderName = useDebounce(searchHolderName, 300);


  // Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Edit form
  const [formData, setFormData] = useState({
    id: 0,
    code: "",
    accountBankNumber: "",
    accountBankHolderName: "",
    loginUsername: "",
    loginPassword: "",
    bankId: "",
  });
  const [passwordInput, setPasswordInput] = useState(""); 
  const [isPasswordEdited, setIsPasswordEdited] = useState(false);


  // Modal Create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  

  // Delete
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [bankToDelete, setBankToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const requestRef = useRef(0);

  // ---------------------- FETCH LIST ----------------------
  const fetchBanks = async () => {
    setLoading(true);
    try {
      const res = await bankAccountApi.getBankList(
        pageNumber,
        pageSize,
        debouncedAccountNumber.trim(),
        debouncedHolderName.trim(),
        searchBankId
      );

      setBankAccounts(res?.data || []);
      setTotalItems(res?.totalItems || 0);
      setTotalPages(res?.totalItems ? Math.ceil(res.totalItems / pageSize) : 1);
    } catch (err) {
      console.error(err);
      toast.error("Lấy danh sách tài khoản thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, [pageNumber, pageSize, debouncedAccountNumber, debouncedHolderName, searchBankId]);

  // Reset page when search changes
  useEffect(() => {
    setPageNumber(1);
  }, [debouncedAccountNumber, debouncedHolderName, searchBankId]);

  useEffect(() => {
    const fetchBanksDropdown = async () => {
      try {
        const res = await bankApi.getBankList(1, 50); // mặc định 50
        setBankList(res?.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBanksDropdown();
  }, []);




  // Pagination
  const handlePrev = () => pageNumber > 1 && setPageNumber(pageNumber - 1);
  const handleNext = () => pageNumber < totalPages && setPageNumber(pageNumber + 1);
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageNumber(1);
  };

  // ---------------------- EDIT ----------------------
  const openEditModal = async (id) => {
    setIsEditModalOpen(true);
    setIsEditLoading(true);
    setSelectedId(id);

    const reqId = ++requestRef.current;

    try {
      const res = await bankAccountApi.getBankAccountById(id);
      if (requestRef.current !== reqId) return;

      const acc = res?.data;
      setFormData({
        id: acc?.id || 0,
        code: acc?.code || "",
        accountBankNumber: acc?.accountBankNumber || "",
        accountBankHolderName: acc?.accountBankHolderName || "",
        loginUsername: acc?.loginUsername || "",
        loginPassword: "",
        bankId: acc?.bankId || "",
        bankAccountType: acc?.type || "",
      });
    } catch (err) {
      toast.error("Không tải được thông tin tài khoản");
    } finally {
      if (requestRef.current === reqId) setIsEditLoading(false);
    }
  };

  const handleEditChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEditSave = async () => {
    console.log("Dữ liệu gửi đi:", formData);
    setSaving(true);

    const payload = {
      ...formData,
      loginPassword: isPasswordEdited ? formData.loginPassword : null
    };

    try {
      await bankAccountApi.updateBankAccount(payload);
      toast.success("Cập nhật thành công");
      setIsEditModalOpen(false);
      fetchBanks();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Cập nhật dữ liệu thất bại");
    } finally {
      setSaving(false);
    }
  };


  // ---------------------- CREATE ----------------------
  const openCreateModal = () => {
    setFormData({
      code: "",
      accountBankNumber: "",
      accountBankHolderName: "",
      loginUsername: "",
      loginPassword: "",
      bankId: "",
      bankAccountType: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async () => {
    setSaving(true);
    try {
      await bankAccountApi.createBankAccount(
        formData.code,
        formData.accountBankNumber,
        formData.accountBankHolderName,
        formData.loginUsername,
        formData.loginPassword,
        formData.bankId,
        formData.bankAccountType
      );
      toast.success("Thêm tài khoản thành công");
      setIsCreateModalOpen(false);
      fetchBanks();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Thêm thất bại");
    } finally {
      setSaving(false);
    }
  };

  // ---------------------- DELETE ----------------------
  const handleOpenDelete = (item) => {
    setBankToDelete(item);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await bankAccountApi.deleteBankAccountById(bankToDelete.id);
      toast.success("Xóa thành công");
      fetchBanks();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Xóa thất bại");
    } finally {
      setIsDeleting(false);
      setOpenDeleteModal(false);
    }
  };

  // ---------------------- RENDER ----------------------
  return (
     <div className="px-4">
      <h1 className="text-lg font-bold mb-3">Danh sách tài khoản ngân hàng</h1>

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
          <div className="flex-1 lg:max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {/* Input Số tài khoản */}
              <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100 hover:shadow-md">
                <input
                  type="text"
                  placeholder="Số tài khoản..."
                  value={searchAccountNumber}
                  onChange={(e) => setSearchAccountNumber(e.target.value)}
                  className="w-full text-gray-800 placeholder-gray-500 bg-transparent text-sm focus:outline-none"
                />
              </div>

              {/* Input Tên chủ tài khoản */}
              <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100 hover:shadow-md">
                <input
                  type="text"
                  placeholder="Tên chủ tài khoản..."
                  value={searchHolderName}
                  onChange={(e) => setSearchHolderName(e.target.value)}
                  className="w-full text-gray-800 placeholder-gray-500 bg-transparent text-sm focus:outline-none"
                />
              </div>

              {/* Dropdown Ngân hàng */}
              <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100 hover:shadow-md">
                <select
                  value={searchBankId}
                  onChange={(e) => setSearchBankId(e.target.value)}
                  className="w-full text-gray-800 placeholder-primary-darkest bg-transparent text-sm focus:outline-none"
                >
                  <option value="">-- Ngân hàng --</option>
                  {bankList.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.codeBank} - {bank.name}
                    </option>
                  ))}
                </select>
              </div>
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
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium text-gray-900 uppercase tracking-wider w-1/12 text-primary-darkest"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium text-gray-900 tracking-wider w-1/4 text-primary-darkest"
                >
                  Số tài khoản
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium text-gray-900 tracking-wider w-1/4 text-primary-darkest"
                >
                  Chủ tài khoản
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium text-gray-900 tracking-wider w-1/4 text-primary-darkest"
                >
                  Ngân hàng
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium text-gray-900 tracking-wider w-1/4 text-primary-darkest"
                >
                  Code TK
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium text-gray-900 tracking-wider w-1/4 text-primary-darkest"
                >
                  Loại tài khoản
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium text-gray-900 tracking-wider w-1/12 text-primary-darkest"
                >
                  Tùy chọn
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {bankAccounts.length === 0 && (
                <tr>
                    <td colSpan="7" className="px-3 py-3 text-center text-gray-500 text-sm">
                      Không tìm thấy dữ liệu
                   </td>
                </tr>
              )}
              {bankAccounts.map((x, index) => (
                <tr key={x.id}>
                  <td className="w-1/12 px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {(pageNumber - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {x.accountBankNumber}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {x.accountBankHolderName}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {x.bankCode}
                  </td>
                   <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {x.code || "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {formatAccountType(x.type)}
                  </td>
                  <td className="w-1/12 px-3 py-2 whitespace-nowrap text-xs text-gray-900 flex items-center">
                    <button className=" " onClick={() => openEditModal(x.id)}>
                      <SquarePen className="h-4 w-4 text-warning mr-2 ml-1.5 flex-shrink-0 cursor-pointer" />
                    </button>
                    <button className="" onClick={() => handleOpenDelete(x)}>
                      <Trash className="h-4 w-4 text-error mr-2 flex-shrink-0 cursor-pointer" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Footer và Pagination */}
            <tfoot className="bg-white">
              <tr>
                 <td colSpan="6" className="px-3 py-2">
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
                    
                    {/* Thông tin số lượng hàng đang hiển thị */}
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

                      {/* Nút Next */}
                      <button
                        onClick={handleNext}
                        disabled={pageNumber === totalPages} 
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

      {/* Modals */}
      <EditBankAccountModal
        open={isEditModalOpen}
        loading={isEditLoading}
        saving={saving}
        formData={formData}
        onChange={handleEditChange}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        bankList={bankList}
        setIsPasswordEdited={setIsPasswordEdited} // Giữ lại prop này cho logic riêng của EditModal
      />

      <CreateBankAccountModal
        open={isCreateModalOpen}
        formData={formData}
        onChange={handleEditChange}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
        saving={saving}
        bankList={bankList}
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${bankToDelete?.accountBankNumber}" không?`}
        loading={isDeleting}
      />
    </div>
  );
}

export default BankAccountList;