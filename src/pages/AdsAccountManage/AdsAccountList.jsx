import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify"; // Giả sử bạn dùng thư viện này
import { Search, Plus, SquarePen, Trash } from "lucide-react"; // Hoặc icon từ thư viện bạn đang dùng
import DeleteConfirmModal from "../../components/Modal/DeleteConfirmModal";

// Import API

// Giả định đường dẫn
import adsAccountApi from "../../api/adsAccountApi";
import bmAccountApi from "../../api/bmAccountApi";
import CreateAdsAccountModal from "./CreateAdsAccountModal";
import EditAdsAccountModal from "./EditAdsAccountModal";
import TableSkeleton from "../../components/Loading/TableSkeleton";

// Import các Modal Create/Edit của bạn (nếu đã tạo)
// import CreateAdsAccountModal from ...
// import EditAdsAccountModal from ...

function AdsAccountList() {
  const [adsAccounts, setAdsAccounts] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Mặc định 10 cho dễ nhìn
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // --- SEARCH & FILTER STATES ---
  const [searchAdAccountId, setSearchAdAccountId] = useState(""); // Input
  const [filterBmAccountId, setFilterBmAccountId] = useState(""); // Select
  const [filterLocked, setFilterLocked] = useState(""); // Select (Boolean: "", "true", "false")

  // State lưu giá trị thực sự khi ấn nút Search
  const [queryKeyword, setQueryKeyword] = useState({
    adAccountIdNumber: "",
    bmAccountId: "",
    locked: "", // "" là all
  });

  // Dropdown Data
  const [bmList, setBmList] = useState([]);

  // --- MODAL STATES ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Data cho Edit/Create
  const [formData, setFormData] = useState({
    id: 0,
    adAccountName: "",
    adAccountIdNumber: "",
    bmAccountId: "",
    locked: false,
  });

  // Delete
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const requestRef = useRef(0);

  // --- 1. FETCH DATA LIST ---
  const fetchAdsAccounts = async () => {
    setLoading(true);
    try {
      // Xử lý locked: convert string sang boolean hoặc null
      let lockedParam = null;
      if (queryKeyword.locked === "true") lockedParam = true;
      if (queryKeyword.locked === "false") lockedParam = false;

      const res = await adsAccountApi.getAdsAccountList(
        pageNumber,
        pageSize,
        queryKeyword.adAccountIdNumber,
        lockedParam,
        queryKeyword.bmAccountId
      );

      setAdsAccounts(res?.data || []);
      setTotalItems(res?.totalItems || 0);
      setTotalPages(res?.totalItems ? Math.ceil(res.totalItems / pageSize) : 1);
    } catch (err) {
      toast.error("Lấy danh sách tài khoản quảng cáo thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdsAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize, queryKeyword]);

  // --- 2. FETCH DROPDOWN DATA (BM Account) ---
  useEffect(() => {
    const fetchBmDropdown = async () => {
      try {
        // Giả sử API getBmAccountList trả về { data: [...] } hoặc { items: [...] }
        const res = await bmAccountApi.getBmAccountList(1, 999); 
        setBmList(res?.data || res?.items || []);
      } catch (err) {
        console.error("Lỗi tải BM Account:", err);
      }
    };
    fetchBmDropdown();
  }, []);

  // --- 3. HANDLE SEARCH ---
  const handleSearch = () => {
    setPageNumber(1);
    setQueryKeyword({
      adAccountIdNumber: searchAdAccountId.trim(),
      bmAccountId: filterBmAccountId,
      locked: filterLocked,
    });
  };

  // --- PAGINATION HELPERS ---
  // const handlePrev = () => pageNumber > 1 && setPageNumber(pageNumber - 1);
  // const handleNext = () => pageNumber < totalPages && setPageNumber(pageNumber + 1);

  // --- 4. CREATE ---
  const openCreateModal = () => {
    setFormData({
      adAccountName: "",
      adAccountIdNumber: "",
      bmAccountId: "",
      locked: false, // Mặc định
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async () => {
    setSaving(true);
    try {
      await adsAccountApi.createAdsAccount(
        formData.adAccountName,
        formData.adAccountIdNumber,
        formData.bmAccountId
      );
      toast.success("Tạo tài khoản thành công");
      setIsCreateModalOpen(false);
      fetchAdsAccounts();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Tạo thất bại");
    } finally {
      setSaving(false);
    }
  };

  // --- 5. EDIT ---
  const openEditModal = async (id) => {
    setIsEditModalOpen(true);
    setIsEditLoading(true);

    const reqId = ++requestRef.current;

    try {
      const res = await adsAccountApi.getAdsAccountById(id);
      if (requestRef.current !== reqId) return;

      const data = res?.data || res; // Tùy format trả về của API GetById
      setFormData({
        id: data.id,
        adAccountName: data.adAccountName,
        adAccountIdNumber: data.adAccountIdNumber,
        bmAccountId: data.bmAccountId,
        locked: data.locked,
        // Các trường khác nếu cần update
      });
    } catch {
      toast.error("Không tải được dữ liệu tài khoản");
      setIsEditModalOpen(false);
    } finally {
      if (requestRef.current === reqId) setIsEditLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value
    });
  };

  // Hàm save cho Edit Modal gọi
//   const handleEditSave = async (dataToSend) => {
//     setSaving(true);
//     try {
//       // Nếu dataToSend không được truyền từ modal, dùng formData
//       const payload = dataToSend || formData;
//       await adsAccountApi.updateAdsAccount(payload);

//       toast.success("Cập nhật thành công");
//       setIsEditModalOpen(false);
//       fetchAdsAccounts();
//     } catch (err) {
//       console.error(err);
//       toast.error("Cập nhật thất bại");
//     } finally {
//       setSaving(false);
//     }
//   };
// File: AdsAccountList.js

const handleEditSave = async (dataToSend) => {
    setSaving(true);
    try {
      // Lấy dữ liệu hiện tại từ form
      const rawData = dataToSend || formData;

      // --- SỬA LỖI TẠI ĐÂY ---
      // Tạo payload mới ánh xạ từ "ad..." (frontend) sang "ads..." (API)
      const payload = {
        id: rawData.id,
        bmAccountId: rawData.bmAccountId,
        locked: rawData.locked,
        // Đổi tên key cho khớp API
        adsAccountName: rawData.adAccountName,       // API cần ads, State đang là ad
        adsAccountIdNumber: rawData.adAccountIdNumber // API cần ads, State đang là ad
      };

      await adsAccountApi.updateAdsAccount(payload);

      toast.success("Cập nhật thành công");
      setIsEditModalOpen(false);
      fetchAdsAccounts();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
};

  // --- 6. DELETE ---
  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await adsAccountApi.deleteAdsAccountById(itemToDelete.id);
      toast.success("Xóa thành công");
      fetchAdsAccounts();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setIsDeleting(false);
      setOpenDeleteModal(false);
    }
  };

  // --- RENDER HELPERS ---
  const renderLockedStatus = (isLocked) => {
    if (isLocked) {
      return (
        <span className="inline-block px-3 py-1 text-sm font-medium text-red-600 border border-red-600 rounded-lg bg-white whitespace-nowrap">
          Đã khóa 
        </span>
      );
    } else {
      return (
        <span className="inline-block px-3 py-1 text-sm font-medium text-green-600 border border-green-600 rounded-lg bg-white whitespace-nowrap">
          Hoạt động
        </span>
      );
    }
  };

  return (
    <div className="px-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách tài khoản quảng cáo</h1>

      {/* --- SEARCH BAR SECTION --- */}
      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
        <div className="flex items-center w-full max-w-5xl gap-4">
          
          {/* Input 1: Ad Account ID Number (Search) */}
          <div className="flex-1 flex items-center px-5 py-2 bg-white border border-gray-200 rounded-xl shadow-lg transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-4 focus-within:ring-blue-100">
            <input
              type="text"
              placeholder="Tìm theo ID tài khoản FB..."
              value={searchAdAccountId}
              onChange={(e) => setSearchAdAccountId(e.target.value)}
              className="w-full text-gray-800 placeholder-gray-500 bg-transparent text-base focus:outline-none"
            />
          </div>

          {/* Input 2: BM Account (Filter) */}
          <div className="flex-1 flex items-center px-5 py-2 bg-white border border-gray-200 rounded-xl shadow-lg transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-4 focus-within:ring-blue-100">
            <select
              value={filterBmAccountId}
              onChange={(e) => setFilterBmAccountId(e.target.value)}
              className="w-full text-gray-800 placeholder-primary-darkest bg-transparent text-base focus:outline-none"
            >
              <option value="">-- Tất cả BM --</option>
              {bmList.map((bm) => (
                // Giả sử BM object có id và name
                <option key={bm.id} value={bm.id}>
                  {bm.name || bm.bmId} 
                </option>
              ))}
            </select>
          </div>

          {/* Input 3: Locked Status (Filter) */}
          <div className="w-48 flex items-center px-5 py-2 bg-white border border-gray-200 rounded-xl shadow-lg transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-4 focus-within:ring-blue-100">
            <select
              value={filterLocked}
              onChange={(e) => setFilterLocked(e.target.value)}
              className="w-full text-gray-800 bg-transparent text-base focus:outline-none"
            >
              <option value="">-- Trạng thái --</option>
              <option value="false">Hoạt động</option>
              <option value="true">Đã khóa</option>
            </select>
          </div>

          {/* Button: Search */}
          <button
            onClick={handleSearch}
            className="px-5 py-2 rounded-xl font-semibold text-md transition bg-primary-dark text-white hover:bg-primary-darkest cursor-pointer whitespace-nowrap flex items-center justify-center"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* Button: Create New */}
        <button
          className="px-5 py-2 rounded-xl font-semibold text-md transition bg-primary-dark text-white hover:bg-primary-darkest cursor-pointer"
          onClick={openCreateModal}
        >
          <Plus className="h-5 w-5 inline-block mr-2" /> Tạo mới
        </button>
      </div>

      {/* --- TABLE SECTION --- */}
      {loading ? (
      <TableSkeleton/> // Hoặc component TableSkeleton
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-xl ">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-md font-medium text-gray-900 uppercase tracking-wider text-primary-darkest">
                  #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-md font-medium text-gray-900  tracking-wider text-primary-darkest">
                  Tên tài khoản
                </th>
                <th scope="col" className="px-6 py-3 text-left text-md font-medium text-gray-900  tracking-wider text-primary-darkest">
                  ID tài khoản FB
                </th>
                <th scope="col" className="px-6 py-3 text-left text-md font-medium text-gray-900  tracking-wider text-primary-darkest">
                BM
                </th>
                <th scope="col" className="px-6 py-3 text-center text-md font-medium text-gray-900  tracking-wider text-primary-darkest">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-center text-md font-medium text-gray-900  tracking-wider text-primary-darkest">
                  Tuỳ chọn
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adsAccounts.length === 0 && (
                <tr>
                   <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Không tìm thấy dữ liệu
                   </td>
                </tr>
              )}
              {adsAccounts.map((x, index) => (
                <tr key={x.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(pageNumber - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium ">
                    {x.adAccountName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-sm">
                    {x.adAccountIdNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* Hiển thị tên BM, nếu API trả về bmName thì dùng, không thì check logic */}
                    {x.bmAccountname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      {renderLockedStatus(x.locked)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex justify-center items-center gap-2">
                    <button onClick={() => openEditModal(x.id)} title="Chỉnh sửa">
                      <SquarePen className="h-5 w-5 text-warning cursor-pointer" />
                    </button>
                    <button onClick={() => handleOpenDelete(x)} title="Xóa">
                      <Trash className="h-5 w-5 text-error cursor-pointer" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Footer Pagination */}
            <tfoot className="bg-white">
              <tr>
                <td colSpan="6" className="px-6 py-3">
                  <div className="flex justify-end items-center text-sm">
                    {/* Select Page Size */}
                    <div className="flex items-center gap-2 mr-6">
                      <span className="text-gray-700">Hiển thị:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setPageNumber(1);
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>

                    {/* Show Count */}
                    <span className="text-gray-700 mr-6">
                      {(pageNumber - 1) * pageSize + 1}–
                      {Math.min(pageNumber * pageSize, totalItems)} trên{" "}
                      {totalItems}
                    </span>

                    {/* Prev/Next Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => pageNumber > 1 && setPageNumber(pageNumber - 1)}
                        disabled={pageNumber === 1}
                        className={`p-2 rounded-full transition duration-150 ${
                          pageNumber === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                         &lt; {/* Icon Prev */}
                      </button>

                      <button
                        onClick={() => pageNumber < totalPages && setPageNumber(pageNumber + 1)}
                        disabled={pageNumber === totalPages}
                        className={`p-2 rounded-full transition duration-150 ${
                          pageNumber === totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                         &gt; {/* Icon Next */}
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
      
      {/* Modal Xóa - Sử dụng lại của bạn */}
      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${itemToDelete?.adAccountName || itemToDelete?.adAccountIdNumber}" không?`}
        loading={isDeleting}
      />

      {/* --- Placeholder cho Modal Create/Edit --- */}
      {/* Bạn cần cập nhật component Modal Create/Edit để nhận đúng props (adAccountName, bmList...) */}
      
      <CreateAdsAccountModal
        open={isCreateModalOpen}
        formData={formData}
        onChange={handleEditChange} // Hàm update state form
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
        saving={saving}
        bmList={bmList} // Truyền list BM vào để select
      /> 
     

      <EditAdsAccountModal
        open={isEditModalOpen}
        loading={isEditLoading}
        saving={saving}
        formData={formData}
        onChange={handleEditChange}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        bmList={bmList}
      /> 
     
    </div>
  );
}

export default AdsAccountList;