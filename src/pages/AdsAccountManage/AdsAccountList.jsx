import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify"; // Giả sử bạn dùng thư viện này
import { Search, Plus, SquarePen, Trash, RefreshCcw, DollarSign } from "lucide-react"; // Hoặc icon từ thư viện bạn đang dùng
import DeleteConfirmModal from "../../components/Modal/DeleteConfirmModal";

// Import API

// Giả định đường dẫn
import adsAccountApi from "../../api/adsAccountApi";
import bmAccountApi from "../../api/bmAccountApi";
import CreateAdsAccountModal from "./CreateAdsAccountModal";
import EditAdsAccountModal from "./EditAdsAccountModal";
import DetailAdsAccountModal from "./DetailAdsAccountModal";
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

  // Detail Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // Bank card details tooltip
  const [showBankCardTooltip, setShowBankCardTooltip] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [currentTooltipId, setCurrentTooltipId] = useState(null);

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
        // toast.error("Lỗi tải BM Account");
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
      toast.error(typeof err === 'string' ? err : "Tạo thất bại");
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
      toast.error(typeof err === 'string' ? err : "Không tải được dữ liệu tài khoản");
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
      toast.error(typeof err === 'string' ? err : "Cập nhật thất bại");
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
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Xóa thất bại");
    } finally {
      setIsDeleting(false);
      setOpenDeleteModal(false);
    }
  };

  // --- 7. DETAIL MODAL ---
  const openDetailModal = async (id) => {
    setIsDetailModalOpen(true);
    setIsDetailLoading(true);
    setDetailData(null);

    const reqId = ++requestRef.current;

    try {
      const res = await adsAccountApi.getAdsAccountById(id);
      if (requestRef.current !== reqId) return;

      setDetailData(res?.data || res);
    } catch (err) {
      toast.error("Không thể tải dữ liệu chi tiết tài khoản");
    } finally {
      if (requestRef.current === reqId) setIsDetailLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const renderLockedStatus = (isLocked) => {
    if (isLocked) {
      return (
        <span className="inline-block px-2 py-0.5 text-xs font-medium text-red-600 border border-red-600 rounded-md bg-white whitespace-nowrap">
          Đã khóa
        </span>
      );
    } else {
      return (
        <span className="inline-block px-2 py-0.5 text-xs font-medium text-green-600 border border-green-600 rounded-md bg-white whitespace-nowrap">
          Hoạt động
        </span>
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderBankCardStatus = (status) => {
    switch (status) {
      case 'NEW':
        return <span className="text-green-600 font-medium">Mới</span>;
      case 'OUT':
        return <span className="text-orange-600 font-medium">Đã đá</span>;
      default:
        return <span className="text-gray-600">{status}</span>;
    }
  };

  return (
    <div className="px-4">
      <h1 className="text-lg font-bold mb-3">Danh sách tài khoản quảng cáo</h1>

      {/* --- SEARCH BAR SECTION --- */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
        <div className="flex items-center w-full max-w-5xl gap-3">
          
          {/* Input 1: Ad Account ID Number (Search) */}
          <div className="flex-1 flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-md transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100">
            <input
              type="text"
              placeholder="Tìm theo ID tài khoản FB..."
              value={searchAdAccountId}
              onChange={(e) => setSearchAdAccountId(e.target.value)}
              className="w-full text-gray-800 placeholder-gray-500 bg-transparent text-sm focus:outline-none"
            />
          </div>

          {/* Input 2: BM Account (Filter) */}
          <div className="flex-1 flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-md transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100">
            <select
              value={filterBmAccountId}
              onChange={(e) => setFilterBmAccountId(e.target.value)}
              className="w-full text-gray-800 placeholder-primary-darkest bg-transparent text-sm focus:outline-none"
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
          <div className="w-40 flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-md transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100">
            <select
              value={filterLocked}
              onChange={(e) => setFilterLocked(e.target.value)}
              className="w-full text-gray-800 bg-transparent text-sm focus:outline-none"
            >
              <option value="">-- Trạng thái --</option>
              <option value="false">Hoạt động</option>
              <option value="true">Đã khóa</option>
            </select>
          </div>

          {/* Button: Search */}
          <button
            onClick={handleSearch}
            className="px-3 py-1.5 rounded-lg font-semibold text-sm transition bg-primary-dark text-white hover:bg-primary-darkest cursor-pointer whitespace-nowrap flex items-center justify-center"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Button: Create New */}
        <button
          className="px-3 py-1.5 rounded-lg font-semibold text-sm transition bg-primary-dark text-white hover:bg-primary-darkest cursor-pointer"
          onClick={openCreateModal}
        >
          <Plus className="h-4 w-4 inline-block mr-1.5" /> Tạo mới
        </button>
      </div>

      {/* --- TABLE SECTION --- */}
      {loading ? (
      <TableSkeleton/> // Hoặc component TableSkeleton
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg ">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-900 uppercase tracking-wider text-primary-darkest">
                  #
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-900  tracking-wider text-primary-darkest">
                  ID tài khoản FB
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-900  tracking-wider text-primary-darkest">
                  Tên tài khoản
                </th>
                <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-900  tracking-wider text-primary-darkest">
                  <div className="flex items-center justify-center gap-1">
                    Dư nợ hiện tại
                    <a 
                      href="https://acb.duckhero.store/scan-account?token=999999999"
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="Quét toàn bộ"
                    >
                      <RefreshCcw className="h-4 w-4 text-blue-600 cursor-pointer hover:text-blue-800" />
                    </a>
                  </div>
                </th>
                <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-900  tracking-wider text-primary-darkest">
                  Đơn vị tiền tệ
                </th>
                <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-900  tracking-wider text-primary-darkest">
                  Thời gian cập nhật dư nợ
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-900  tracking-wider text-primary-darkest">
                BM
                </th>
                <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-900  tracking-wider text-primary-darkest">
                  Trạng thái tài khoản
                </th>
                <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-900  tracking-wider text-primary-darkest">
                  Thẻ
                </th>
                <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-900  tracking-wider text-primary-darkest">
                  Tuỳ chọn
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adsAccounts.length === 0 && (
                <tr>
                   <td colSpan="10" className="px-3 py-3 text-center text-gray-500 text-sm">
                      Không tìm thấy dữ liệu
                   </td>
                </tr>
              )}
              {adsAccounts.map((x, index) => (
                <tr 
                  key={x.id}
                  onClick={() => openDetailModal(x.id)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                    {(pageNumber - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">
                    {x.adAccountIdNumber}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 max-w-[200px] truncate" title={x.adAccountName}>
                    {x.adAccountName}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                    <div className="flex items-center justify-center gap-2 group">
                       <span className="cursor-default">{x.currentDebt ? Number(x.currentDebt).toLocaleString('vi-VN') : 0}</span>
                       <a 
                          href={`https://acb.duckhero.store/scan-account?token=999999999&id=${x.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          title="Quét dư nợ tài khoản"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                       >
                          <RefreshCcw className="h-4 w-4 text-blue-600 cursor-pointer" />
                       </a>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                    <div className="flex items-center justify-center gap-1 font-medium">
                      {x.currencyCode}
                      {x.currencyCode === 'USD' && (
                         <DollarSign className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-blue-600">
                    <div className="text-center">
                      {formatDate(x.debtUpdatedAt)}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                    {/* Hiển thị tên BM, nếu API trả về bmName thì dùng, không thì check logic */}
                    {x.bmAccountname}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      {renderLockedStatus(x.locked)}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    <div
                      className="flex items-center justify-center cursor-pointer hover:bg-gray-50 rounded p-1.5 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        if (currentTooltipId === x.id) {
                          // Click vào cùng một item thì đóng tooltip
                          setShowBankCardTooltip(false);
                          setCurrentTooltipId(null);
                        } else {
                          // Click vào item khác thì mở tooltip cho item đó
                          setTooltipPosition({ x: rect.left, y: rect.bottom + 5 });
                          setTooltipData(x.linkedBankCards || []);
                          setShowBankCardTooltip(true);
                          setCurrentTooltipId(x.id);
                        }
                      }}
                    >
                      <span className="font-medium text-blue-600">{x.totalAddBankCards || 0}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 flex justify-center items-center gap-1.5">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(x.id);
                      }} 
                      title="Chỉnh sửa"
                    >
                      <SquarePen className="h-4 w-4 text-warning cursor-pointer" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDelete(x);
                      }} 
                      title="Xóa"
                    >
                      <Trash className="h-4 w-4 text-error cursor-pointer" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Footer Pagination */}
            <tfoot className="bg-white">
              <tr>
                <td colSpan="10" className="px-3 py-2">
                  <div className="flex justify-end items-center text-xs">
                    {/* Select Page Size */}
                    <div className="flex items-center gap-1.5 mr-4">
                      <span className="text-gray-700">Hiển thị:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setPageNumber(1);
                        }}
                        className="border border-gray-300 rounded px-1.5 py-0.5 text-gray-700 focus:outline-none text-xs"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>

                    {/* Show Count */}
                    <span className="text-gray-700 mr-4">
                      {(pageNumber - 1) * pageSize + 1}–
                      {Math.min(pageNumber * pageSize, totalItems)} trên{" "}
                      {totalItems}
                    </span>

                    {/* Prev/Next Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => pageNumber > 1 && setPageNumber(pageNumber - 1)}
                        disabled={pageNumber === 1}
                        className={`p-1.5 rounded-full transition duration-150 text-xs ${
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
                        className={`p-1.5 rounded-full transition duration-150 text-xs ${
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

      <DetailAdsAccountModal
        open={isDetailModalOpen}
        loading={isDetailLoading}
        accountData={detailData}
        onClose={() => setIsDetailModalOpen(false)}
        refreshData={() => openDetailModal(detailData?.id)}
      />
     
    </div>
  );
}

export default AdsAccountList;