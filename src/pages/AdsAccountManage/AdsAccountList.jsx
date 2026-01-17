import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { Plus, SquarePen, Trash, RefreshCcw, DollarSign, Zap, Coins } from "lucide-react";
import DeleteConfirmModal from "../../components/Modal/DeleteConfirmModal";

// Import API

// Giả định đường dẫn
import adsAccountApi from "../../api/adsAccountApi";
import bmAccountApi from "../../api/bmAccountApi";
import CreateAdsAccountModal from "./CreateAdsAccountModal";
import EditAdsAccountModal from "./EditAdsAccountModal";
import DetailAdsAccountModal from "./DetailAdsAccountModal";
import ImportAdsAccountModal from "./ImportAdsAccountModal";
import RecordThresholdEatingModal from "./RecordThresholdEatingModal";
import TableSkeleton from "../../components/Loading/TableSkeleton";
import { getBmWorkingDisplayText, getBmWorkingOptions } from "../../utils/bmConstants";

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

function AdsAccountList() {
  const { hasRole } = useAuth();
  const canAction = hasRole("Admin") || hasRole("Vận Hành");

  const [adsAccounts, setAdsAccounts] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(15); // Mặc định 15 cho dễ nhìn
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // --- SEARCH & FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState(""); // Input - real-time typing
  const [filterBmAccountId, setFilterBmAccountId] = useState(""); // Select
  const [filterBmWorking, setFilterBmWorking] = useState(""); // Select (Integer: "", "1", "2", ...)

  const [filterStatus, setFilterStatus] = useState(""); // Select ('LIVE', 'HOLD', 'BACK', 'DIE', 'UNPAID')
  const [filterTotalAddBankCards, setFilterTotalAddBankCards] = useState(""); // Select (1-10)

  // Debounced search text (500ms delay)
  const debouncedSearchText = useDebounce(searchTerm, 500);


  // Dropdown Data
  const [bmList, setBmList] = useState([]);

  // --- MODAL STATES ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Data cho Edit/Create
  const [formData, setFormData] = useState({
    id: 0,
    adAccountName: "",
    adAccountIdNumber: "",
    bmAccountId: "",
    bmWorking: "", // Integer value: 1, 2, etc.
    status: "LIVE",
  });

  // Delete
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Detail Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // Record Threshold Eating Modal
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [selectedAdAccount, setSelectedAdAccount] = useState(null);

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
      // Xử lý status: lấy trực tiếp giá trị chuỗi
      let statusParam = filterStatus || null;

      // Xử lý bmWorking: convert string sang number hoặc null
      let bmWorkingParam = null;
      if (filterBmWorking && filterBmWorking !== "") {
        bmWorkingParam = parseInt(filterBmWorking, 10);
      }

      const res = await adsAccountApi.getAdsAccountList(
        pageNumber,
        pageSize,
        debouncedSearchText.trim(),
        statusParam,
        filterBmAccountId,
        bmWorkingParam,
        filterTotalAddBankCards // Thêm param totalAddBankCards
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
  }, [pageNumber, pageSize, debouncedSearchText, filterBmAccountId, filterBmWorking, filterStatus, filterTotalAddBankCards]);

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearchText, filterBmAccountId, filterBmWorking, filterStatus, filterTotalAddBankCards]);

  // --- PAGINATION HELPERS ---
  // const handlePrev = () => pageNumber > 1 && setPageNumber(pageNumber - 1);
  // const handleNext = () => pageNumber < totalPages && setPageNumber(pageNumber + 1);

  // --- 4. CREATE ---
  const openCreateModal = () => {
    setFormData({
      adAccountName: "",
      adAccountIdNumber: "",
      bmAccountId: "",
      bmWorking: "", // Mặc định
      status: "LIVE", // Mặc định
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async () => {
    setSaving(true);
    try {
      // Xử lý bmWorking: convert sang number nếu có giá trị
      const bmWorkingValue = formData.bmWorking ? parseInt(formData.bmWorking, 10) : null;

      await adsAccountApi.createAdsAccount(
        formData.adAccountName,
        formData.adAccountIdNumber,
        formData.bmAccountId,
        bmWorkingValue // Thêm bmWorking param
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
        bmWorking: data.bmWorking ? data.bmWorking.toString() : "", // Convert sang string cho form
        status: data.status,
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

  const handleEditSave = async (dataToSend) => {
    setSaving(true);
    try {
      // Lấy dữ liệu hiện tại từ form
      const rawData = dataToSend || formData;

      // --- SỬA LỖI TẠI ĐÂY ---
      // Xử lý bmWorking: convert sang number nếu có giá trị
      const bmWorkingValue = rawData.bmWorking ? parseInt(rawData.bmWorking, 10) : null;

      // Tạo payload mới ánh xạ từ "ad..." (frontend) sang "ads..." (API)
      const payload = {
        id: rawData.id,
        bmAccountId: rawData.bmAccountId,
        bmWorking: bmWorkingValue, // Thêm bmWorking
        status: rawData.status,
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
  const renderAccountStatus = (account) => {
    const { status, isThresholdEating } = account;

    const getStatusBadge = (status) => {
      switch (status) {
        case 'LIVE':
          return (
            <span className="inline-block px-2 py-0.5 text-xs font-medium text-green-600 border border-green-600 rounded-md bg-white whitespace-nowrap">
              LIVE
            </span>
          );
        case 'HOLD':
          return (
            <span className="inline-block px-2 py-0.5 text-xs font-medium text-orange-600 border border-orange-600 rounded-md bg-white whitespace-nowrap">
              HOLD
            </span>
          );
        case 'BACK':
          return (
            <span className="inline-block px-2 py-0.5 text-xs font-medium text-gray-600 border border-gray-600 rounded-md bg-white whitespace-nowrap">
              BACK
            </span>
          );
        case 'DIE':
          return (
            <span className="inline-block px-2 py-0.5 text-xs font-medium text-red-600 border border-red-600 rounded-md bg-white whitespace-nowrap">
              DIE
            </span>
          );
        case 'UNPAID':
          return (
            <span className="inline-block px-2 py-0.5 text-xs font-medium text-red-600 border border-red-600 rounded-md bg-white whitespace-nowrap">
              UNPAID
            </span>
          );
        default:
          return (
            <span className="inline-block px-2 py-0.5 text-xs font-medium text-gray-600 border border-gray-600 rounded-md bg-white whitespace-nowrap">
              {status || 'N/A'}
            </span>
          );
      }
    };

    return (
      <div className="flex flex-col items-center gap-1">
        {getStatusBadge(status)}
        {isThresholdEating && (
          <span className="inline-block px-2 py-0.5 text-xs font-medium text-orange-600 border border-orange-600 rounded-md bg-white whitespace-nowrap">
            Đã cắt ngưỡng
          </span>
        )}
      </div>
    );
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

  const renderBmWorking = (bmWorkingValue) => {
    const displayText = getBmWorkingDisplayText(bmWorkingValue);
    return <span className="font-sm text-gray-900">{displayText}</span>;
  };

  return (
    <div className="px-4">
      <h1 className="text-lg font-bold mb-3">Danh sách tài khoản quảng cáo</h1>

      {/* --- SEARCH BAR SECTION --- */}
      <div className="pb-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          {/* Left Side: Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Button: Create New */}
            {canAction && (
              <button
                className="px-4 py-2.5 rounded-lg font-semibold text-sm transition bg-primary-dark text-white hover:bg-primary-darkest focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-offset-2 active:bg-primary-darkest flex items-center justify-center"
                onClick={openCreateModal}
              >
                <Plus className="h-4 w-4 mr-2" /> Tạo mới
              </button>
            )}
          </div>

          {/* Right Side: Search Filters */}
          <div className="flex-1 lg:max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {/* Input 1: Ad Account ID Number (Search) */}
              <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100 hover:shadow-md">
                <input
                  type="text"
                  placeholder="ID tài khoản, tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-gray-800 placeholder-gray-500 bg-transparent text-sm focus:outline-none"
                />
              </div>

              {/* Input 2: BM Account (Filter) */}
              <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100 hover:shadow-md">
                <select
                  value={filterBmAccountId}
                  onChange={(e) => setFilterBmAccountId(e.target.value)}
                  className="w-full text-gray-800 placeholder-primary-darkest bg-transparent text-sm focus:outline-none"
                >
                  <option value="">-- BM Gốc --</option>
                  {bmList.map((bm) => (
                    <option key={bm.id} value={bm.id}>
                      {bm.name || bm.bmId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input 3: BM Working (Filter) */}
              <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100 hover:shadow-md">
                <select
                  value={filterBmWorking}
                  onChange={(e) => setFilterBmWorking(e.target.value)}
                  className="w-full text-gray-800 bg-transparent text-sm focus:outline-none"
                >
                  <option value="">-- BM Cầm --</option>
                  {getBmWorkingOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input 4: Status (Filter) */}
              <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100 hover:shadow-md">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full text-gray-800 bg-transparent text-sm focus:outline-none"
                >
                  <option value="">-- Trạng thái --</option>
                  <option value="LIVE">LIVE</option>
                  <option value="HOLD">HOLD</option>
                  <option value="BACK">BACK</option>
                  <option value="DIE">DIE</option>
                  <option value="UNPAID">UNPAID</option>
                </select>
              </div>


              {/* Input 5: Total Add Bank Cards (Filter) */}
              <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100 hover:shadow-md">
                <select
                  value={filterTotalAddBankCards}
                  onChange={(e) => setFilterTotalAddBankCards(e.target.value)}
                  className="w-full text-gray-800 bg-transparent text-sm focus:outline-none"
                >
                  <option value="">-- Số thẻ Add --</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      {loading ? (
        <TableSkeleton /> // Hoặc component TableSkeleton
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
                  Tổng chi tiêu
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-900  tracking-wider text-primary-darkest">
                  BM Gốc
                </th>
                <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-900  tracking-wider text-primary-darkest">
                  BM Cầm
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
                  <td colSpan="9" className="px-3 py-3 text-center text-gray-500 text-sm">
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
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700 text-center">
                    <div className="flex flex-col items-center leading-tight">
                      <span className="font-medium text-[11px] text-gray-900">
                        {x.currentSpend ? Number(x.currentSpend).toLocaleString('vi-VN') : 0}
                      </span>
                      <span className="italic text-[10px] text-gray-500 -mt-0.5">
                        {formatDate(x.spendUpdatedAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                    {/* Hiển thị tên BM, nếu API trả về bmName thì dùng, không thì check logic */}
                    {x.bmAccountname}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                    <div className="flex items-center justify-center">
                      {renderBmWorking(x.bmWorking)}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      {renderAccountStatus(x)}
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
                    {canAction && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAdAccount(x);
                            setIsThresholdModalOpen(true);
                          }}
                          title="Cắn ngưỡng TK"
                        >
                          <Coins className="h-4 w-4 text-primary-dark cursor-pointer hover:text-primary-darkest transition-colors" />
                        </button>
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
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Footer Pagination */}
            <tfoot className="bg-white">
              <tr>
                <td colSpan="9" className="px-3 py-2">
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
                        <option value={15}>15</option>
                        <option value={30}>30</option>
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
                        className={`p-1.5 rounded-full transition duration-150 text-xs ${pageNumber === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        &lt; {/* Icon Prev */}
                      </button>

                      <button
                        onClick={() => pageNumber < totalPages && setPageNumber(pageNumber + 1)}
                        disabled={pageNumber === totalPages}
                        className={`p-1.5 rounded-full transition duration-150 text-xs ${pageNumber === totalPages
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
        onImportClick={() => {
          setIsImportModalOpen(true);
        }}
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

      <ImportAdsAccountModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchAdsAccounts();
          setIsImportModalOpen(false);
        }}
      />

      <RecordThresholdEatingModal
        open={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        adAccount={selectedAdAccount}
        onSuccess={() => fetchAdsAccounts()}
      />

    </div>
  );
}

export default AdsAccountList;