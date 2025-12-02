import React, { useEffect, useRef, useState } from "react";
import bankAccountApi from "../../api/bankAccountApi";
import { Search, Plus, SquarePen, Trash } from "lucide-react";
import { toast } from "react-toastify";

// import EditBankAccountModal from "./EditBankAccountModal";   // <-- modal edit tài khoản ngân hàng
// import CreateBankAccountModal from "./CreateBankAccountModal"; // <-- modal tạo tài khoản ngân hàng
import DeleteConfirmModal from "../../components/Modal/DeleteConfirmModal";
import TableSkeleton from "../../components/Loading/TableSkeleton";
import bankApi from "../../api/bankApi";
import EditBankAccountModal from "./EditBankAccountModal";
import CreateBankAccountModal from "./CreateBankAccountModal";


function BankAccountList() {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // Search fields
  const [searchAccountNumber, setSearchAccountNumber] = useState("");
  const [searchHolderName, setSearchHolderName] = useState("");
  const [searchKeyword, setSearchKeyword] = useState({ accountNumber: "", name: "", bankId: "" });
  const [bankList, setBankList] = useState([]);
  const [searchBankId, setSearchBankId] = useState(""); // filter dropdown


  // Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Edit form
  const [formData, setFormData] = useState({
    id: 0,
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
        searchKeyword.accountNumber,
        searchKeyword.name,
        searchKeyword.bankId 
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
  }, [pageNumber, pageSize, searchKeyword]);

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


  // Search
  const handleSearch = () => {
    setPageNumber(1);
    setSearchKeyword({
      accountNumber: searchAccountNumber.trim() || "",
      name: searchHolderName.trim() || "",
      bankId: searchBankId || "", // thêm param filter bankId
    });
  };


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
        accountBankNumber: acc?.accountBankNumber || "",
        accountBankHolderName: acc?.accountBankHolderName || "",
        loginUsername: acc?.loginUsername || "",
        loginPassword: "", 
        bankId: acc?.bankId || "",
      });
    } catch (err) {
      console.error(err);
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
      console.error(err);
      toast.error("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };


  // ---------------------- CREATE ----------------------
  const openCreateModal = () => {
    setFormData({
      accountBankNumber: "",
      accountBankHolderName: "",
      loginUsername: "",
      loginPassword: "",
      bankId: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async () => {
    setSaving(true);
    try {
      await bankAccountApi.createBankAccount(
        formData.accountBankNumber,
        formData.accountBankHolderName,
        formData.loginUsername,
        formData.loginPassword,
        formData.bankId
      );
      toast.success("Thêm tài khoản thành công");
      setIsCreateModalOpen(false);
      fetchBanks();
    } catch (err) {
      console.error(err);
      toast.error("Thêm thất bại");
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
      console.error(err);
      toast.error("Xóa thất bại");
    }
    setIsDeleting(false);
    setOpenDeleteModal(false);
  };

  // ---------------------- RENDER ----------------------
  return (
    <div className="px-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách tài khoản ngân hàng</h1>

      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
        {/* Cấu trúc Search Bar phức tạp, dùng flex và các input/select riêng biệt, và nút Tìm */}
        <div className="flex items-center w-full max-w-4xl gap-4">
          {/* Input Số tài khoản */}
          <div 
            className="flex-1 flex items-center px-5 py-2 bg-white 
                       border border-primary-darkest rounded-xl shadow-lg 
                       transition-all duration-300 ease-in-out
                       focus-within:border-primary-darkest focus-within:ring-4 focus-within:ring-blue-100"
          >
         
            <input
              type="text"
              placeholder="Tìm theo số tài khoản..."
              value={searchAccountNumber}
              onChange={(e) => setSearchAccountNumber(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              className="w-full text-gray-800 placeholder-gray-500 bg-transparent text-base focus:outline-none"
            />
          </div>

          {/* Input Tên chủ tài khoản */}
          <div 
            className="flex-1 flex items-center px-5 py-2 bg-white 
                       border border-primary-darkest rounded-xl shadow-lg 
                       transition-all duration-300 ease-in-out
                       focus-within:border-primary-darkest focus-within:ring-4 focus-within:ring-blue-100"
          >
      
            <input
              type="text"
              placeholder="Tìm theo tên chủ tài khoản..."
              value={searchHolderName}
              onChange={(e) => setSearchHolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              className="w-full text-gray-800 placeholder-gray-500 bg-transparent text-base focus:outline-none"
            />
          </div>
        
          {/* Dropdown Ngân hàng */}
          <div 
            className="flex-1 flex items-center px-5 py-2 bg-white 
                       border border-primary-darkest rounded-xl shadow-lg 
                        transition-all duration-300 ease-in-out
                       focus-within:border-primary-darkest focus-within:ring-4 focus-within:ring-blue-100"
          >
            <select
              value={searchBankId}
              onChange={(e) => setSearchBankId(e.target.value)}
              className="w-full text-gray-800 placeholder-primary-darkest bg-transparent text-base focus:outline-none"
            >
              <option value="">-- Chọn ngân hàng --</option>
              {bankList.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.codeBank} - {bank.name}
                </option>
              ))}
            </select>
          </div>
        
          {/* Nút Tìm */}
<button
  onClick={handleSearch}
  className="
    px-5 py-2 rounded-xl font-semibold text-md transition 
    bg-primary-dark text-white hover:bg-primary-darkest cursor-pointer 
    whitespace-nowrap
    /* CÁC LỚP BỔ SUNG ĐỂ CĂN GIỮA ICON */
    flex 
    items-center 
    justify-center
  "
>
  {/* Đảm bảo biểu tượng Search nằm chính giữa */}
  {/* Lớp `inline-block` có thể giữ hoặc bỏ, nhưng thường bỏ khi dùng Flex */}
  <Search className="h-5 w-5" /> 
</button>

        </div>

        {/* Nút Tạo mới */}
        <button
          className="px-5 py-2 rounded-xl font-semibold text-md transition bg-primary-dark text-white hover:bg-primary-darkest cursor-pointer"
          onClick={openCreateModal}
        >
          <Plus className="h-5 w-5 inline-block mr-2" />Tạo mới
        </button>
      </div>

      {/* Bảng dữ liệu */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-xl">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-md font-medium text-gray-900 uppercase tracking-wider w-1/12 text-primary-darkest"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-md font-medium text-gray-900 tracking-wider w-1/4 text-primary-darkest"
                >
                  Số tài khoản
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-md font-medium text-gray-900 tracking-wider w-1/4 text-primary-darkest"
                >
                  Chủ tài khoản
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-md font-medium text-gray-900 tracking-wider w-1/4 text-primary-darkest"
                >
                  Mã ngân hàng
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-md font-medium text-gray-900 tracking-wider w-1/12 text-primary-darkest"
                >
                  Tùy chọn
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bankAccounts.map((x, index) => (
                <tr key={x.id}>
                  <td className="w-1/12 px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(pageNumber - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {x.accountBankNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {x.accountBankHolderName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {x.bankCode}
                  </td>
                  <td className="w-1/12 px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                    <button className=" " onClick={() => openEditModal(x.id)}>
                      <SquarePen className="h-5 w-5 text-warning mr-3 ml-2 flex-shrink-0 cursor-pointer" />
                    </button>
                    <button className="" onClick={() => handleOpenDelete(x)}>
                      <Trash className="h-5 w-5 text-error mr-3 flex-shrink-0 cursor-pointer" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Footer và Pagination */}
            <tfoot className="bg-white">
              <tr>
                <td colSpan="5" className="px-6 py-3">
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
                    
                    {/* Thông tin số lượng hàng đang hiển thị */}
                    <span className="text-gray-700 mr-6">
                      {((pageNumber - 1) * pageSize) + 1}–{Math.min(pageNumber * pageSize, totalItems)} trên {totalItems}
                    </span>
                    
                    {/* Các nút điều hướng (Prev/Next) */}
                    <div className="flex items-center gap-2">
                      {/* Nút Previous */}
                      <button
                        onClick={handlePrev}
                        disabled={pageNumber === 1}
                        className={`p-2 rounded-full transition duration-150 ${
                          pageNumber === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                      </button>

                      {/* Nút Next */}
                      <button
                        onClick={handleNext}
                        disabled={pageNumber === totalPages} 
                        className={`p-2 rounded-full transition duration-150 ${
                          pageNumber === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
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