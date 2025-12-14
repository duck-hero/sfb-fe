import React, { useEffect, useRef, useState } from "react";
import { Search, Plus, SquarePen, Trash } from "lucide-react";
import { toast } from "react-toastify";
import bankCardApi from "../../api/bankCardApi";
import accountApi from "../../api/accountApi";
import DeleteConfirmModal from "../../components/Modal/DeleteConfirmModal";
import TableSkeleton from "../../components/Loading/TableSkeleton";
import CreateBankCardModal from "./CreateBankCardModal";
import bankAccountApi from "../../api/bankAccountApi";
import EditBankCardModal from "./EditBankCardModal";
import DetailBankCardModal from "./DetailBankCardModal";
import SecurityHelper from "../../utils/crypto";

function BankCardList() {
  const [bankCards, setBankCards] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // Search fields
  const [searchCardNumber, setSearchCardNumber] = useState("");
  const [searchHolderName, setSearchHolderName] = useState("");
  const [searchAssignedTo, setSearchAssignedTo] = useState("");
  const [searchKeyword, setSearchKeyword] = useState({
    cardNumber: "",
    cardHolderName: "",
    assignedToUserId: "",
  });

  const [userList, setUserList] = useState([]);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);

  // Edit form
  const [formData, setFormData] = useState({
    id: 0,
    cardNumber: "",
    cardHolderName: "",
    cvvCode: "",
    issuedDate: "",
    expirationDate: "",
    bankAccountId: "",
    assignedToUserId: "",
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Delete
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const requestRef = useRef(0);

  // --- THÊM STATE CHO DETAIL MODAL ---
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null); // Lưu dữ liệu chi tiết

  const openDetailModal = async (id) => {
    setIsDetailModalOpen(true);
    setIsDetailLoading(true);
    setDetailData(null); // Reset dữ liệu cũ

    // Dùng requestRef để quản lý race condition, giống logic của Edit
    const reqId = ++requestRef.current;

    try {
      // API lấy chi tiết thẻ (đã có sẵn trong file gốc)
      const res = await bankCardApi.getBankCardById(id);
      if (requestRef.current !== reqId) return;

      setDetailData(res?.data); // Lưu dữ liệu chi tiết
    } catch {
      toast.error("Không tải được dữ liệu chi tiết thẻ");
    } finally {
      if (requestRef.current === reqId) setIsDetailLoading(false);
    }
  };

  // Fetch List
  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await bankCardApi.getBankCardList(
        pageNumber,
        pageSize,
        searchKeyword.cardNumber,
        searchKeyword.cardHolderName,
        searchKeyword.assignedToUserId
      );

      setBankCards(res?.data || []);
      setTotalItems(res?.totalItems || 0);
      setTotalPages(res?.totalItems ? Math.ceil(res.totalItems / pageSize) : 1);
    } catch (err) {
      toast.error("Lấy danh sách thẻ thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [pageNumber, pageSize, searchKeyword]);

  // Fetch Users
  useEffect(() => {
    const fetchUsersDropdown = async () => {
      try {
        const res = await accountApi.getUserList(1, 50);
        setUserList(res?.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsersDropdown();
  }, []);

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const res = await bankAccountApi.getBankList(1, 999);
        setBankAccounts(res.items || res.data || []);
      } catch (err) {
        console.error("Lỗi tải BankAccount:", err);
      }
    };

    fetchBankAccounts();
  }, []);

  // Search
  const handleSearch = () => {
    setPageNumber(1);
    setSearchKeyword({
      cardNumber: searchCardNumber.trim() || "",
      cardHolderName: searchHolderName.trim() || "",
      assignedToUserId: searchAssignedTo || "",
    });
  };

  // Pagination
  const handlePrev = () => pageNumber > 1 && setPageNumber(pageNumber - 1);
  const handleNext = () =>
    pageNumber < totalPages && setPageNumber(pageNumber + 1);

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageNumber(1);
  };

  // Edit
  const openEditModal = async (id) => {
    setIsEditModalOpen(true);
    setIsEditLoading(true);
    setSelectedId(id);

    const reqId = ++requestRef.current;

    try {
      const res = await bankCardApi.getBankCardById(id);
      if (requestRef.current !== reqId) return;

      const data = res?.data;

      setFormData({
        id: data.id,
        cardNumber: data.cardNumber,
        cardHolderName: data.cardHolderName,
        cvvCode: data.cvvCode,
        issuedDate: data.issuedDate,
        expirationDate: data.expirationDate,
        bankAccountId: data.bankAccountId,
        assignedToUserId: data.assignedToUserId,
        status: data.status,
      });
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Không tải được dữ liệu thẻ");
    } finally {
      if (requestRef.current === reqId) setIsEditLoading(false);
    }
  };

  const handleEditChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  //   const handleEditSave = async () => {
  //     setSaving(true);
  //     try {
  //       await bankCardApi.updateBankCard(formData);
  //       toast.success("Cập nhật thành công");
  //       setIsEditModalOpen(false);
  //       fetchCards();
  //     } catch {
  //       toast.error("Cập nhật thất bại");
  //     } finally {
  //       setSaving(false);
  //     }
  //   };

  // Nhận tham số dataToSend từ Modal gửi sang
  const handleEditSave = async (dataToSend) => {
    setSaving(true);
    try {
      // Sử dụng dataToSend thay vì formData
      await bankCardApi.updateBankCard(dataToSend);

      toast.success("Cập nhật thành công");
      setIsEditModalOpen(false);
      fetchCards();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  // ...

  // Create
  const openCreateModal = () => {
    setFormData({
      cardNumber: "",
      cardHolderName: "",
      cvvCode: "",
      issuedDate: "",
      expirationDate: "",
      bankAccountId: "",
      assignedToUserId: "",
    });
    setIsCreateModalOpen(true);
  };

  // const handleCreateSave = async () => {
  //   setSaving(true);
  //   try {
  //               console.log("Create", formData)
  //     await bankCardApi.createBankCard(
  //       formData.cardNumber,
  //       formData.cardHolderName,
  //       formData.cvvCode,
  //       formData.issuedDate,
  //       formData.expirationDate,
  //       formData.bankAccountId,
  //       formData.assignedToUserId
  //     );
  //     toast.success("Tạo thẻ thành công");
  //     setIsCreateModalOpen(false);
  //     fetchCards();
  //   } catch {
  //     toast.error("Tạo thất bại");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleCreateSave = async () => {
    setSaving(true);
    
    // 1. Tạo bản sao của formData để xử lý mã hóa
    const payload = { ...formData };
    
    // 2. Xử lý Mã hóa CVV (Async/Await)
    const cvvValue = payload.cvvCode;

    if (cvvValue && String(cvvValue).trim() !== "") {
        try {
            // Mã hóa và thay thế giá trị CVV
            payload.cvvCode = await SecurityHelper.encrypt(String(cvvValue));
        } catch (error) {
            toast.error("Lỗi mã hóa dữ liệu. Vui lòng thử lại.");
            setSaving(false);
            return; // Dừng quá trình nếu mã hóa thất bại
        }
    }
    
    try {
        // console.log("Create Payload đã mã hóa:", payload);

        // 3. Gửi payload đã mã hóa vào API
        await bankCardApi.createBankCard(
            payload.cardNumber,
            payload.cardHolderName,
            payload.cvvCode,
            payload.issuedDate,
            payload.expirationDate,
            payload.bankAccountId,
            payload.assignedToUserId
        );
        
        toast.success("Tạo thẻ thành công");
        setIsCreateModalOpen(false);
        fetchCards();
    } catch (error) {
        toast.error(typeof error === 'string' ? error : "Tạo thất bại");
    } finally {
        setSaving(false);
    }
};

  // Delete
  const handleOpenDelete = (item) => {
    setCardToDelete(item);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await bankCardApi.deleteBankCardById(cardToDelete.id);
      toast.success("Xóa thành công");
      fetchCards();
    } catch (error) {
      toast.error(typeof error === 'string' ? error : "Xóa thất bại");
    }
    setIsDeleting(false);
    setOpenDeleteModal(false);
  };

  // 1. Chuyển đổi ngày tháng: 2026-11-29 -> 29/11/2026
  const formatDate = (dateString) => {
    if (!dateString) return "";
    // Cắt chuỗi để đảm bảo không bị lệch múi giờ khi dùng new Date()
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  // 2. Hiển thị trạng thái theo style badge (có viền)
  const renderStatus = (status) => {
    if (status === "Active") {
      return (
        <span className="inline-block px-2 py-0.5 text-xs font-medium text-green-600 border border-green-600 rounded-md bg-white whitespace-nowrap">
          Hoạt động
        </span>
      );
    } else {
      // Giả sử các trạng thái khác (Inactive, Blocked...) là Danger
      return (
        <span className="inline-block px-2 py-0.5 text-xs font-medium text-red-600 border border-red-600 rounded-md bg-white whitespace-nowrap">
          Khóa
        </span>
      );
    }
  };

  return (
    <div className="px-4">
      <h1 className="text-lg font-bold mb-3">Danh sách thẻ ngân hàng</h1>

      {/* --- SEARCH BAR SECTION --- */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
        <div className="flex items-center w-full max-w-4xl gap-3">
          {/* Input: Card Number */}
          <div className="flex-1 flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-md transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100">
            <input
              type="text"
              placeholder="Tìm theo số thẻ..."
              value={searchCardNumber}
              onChange={(e) => setSearchCardNumber(e.target.value)}
              className="w-full text-gray-800 placeholder-gray-500 bg-transparent text-sm focus:outline-none"
            />
          </div>

          {/* Input: Holder Name */}
          <div className="flex-1 flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-md transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100">
            <input
              type="text"
              placeholder="Tìm theo tên chủ thẻ..."
              value={searchHolderName}
              onChange={(e) => setSearchHolderName(e.target.value)}
              className="w-full text-gray-800 placeholder-gray-500 bg-transparent text-sm focus:outline-none"
            />
          </div>

          {/* Select: Assigned User */}
          <div className="flex-1 flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-md transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100">
            <select
              value={searchAssignedTo}
              onChange={(e) => setSearchAssignedTo(e.target.value)}
              className="w-full text-gray-800 placeholder-primary-darkest bg-transparent text-sm focus:outline-none"
            >
              <option value="">-- Vận hành --</option>
              {userList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.userName}
                </option>
              ))}
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


      {/* --- CARD-STYLED LIST SECTION --- */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          {/* Cards List */}
          {bankCards.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm mt-4">
              <p className="text-gray-500 text-sm">Không tìm thấy dữ liệu</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {bankCards.map((card, index) => {
                return (
                  <div
                    key={card.id}
                    className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 group cursor-pointer"
                    onClick={() => openDetailModal(card.id)}
                  >
                    <div className="flex items-center gap-3 overflow-x-auto">
                      {/* Chip Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-7 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded flex items-center justify-center shadow-sm">
                          <div className="w-5 h-4 border border-yellow-600 rounded-sm"></div>
                        </div>
                      </div>

                      {/* Card Number */}
                      <div className="flex-shrink-0 w-50">
                        <p className="text-sm font-mono font-semibold text-gray-800">
                          {card.cardNumber ? card.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ') : '•••• •••• •••• ••••'}
                        </p>
                      </div>

                      {/* Card Holder */}
                      <div className="flex-shrink-0 w-50">
                        <p className="text-xs text-gray-500 mb-0.5">Chủ thẻ</p>
                        <p className="text-sm font-medium text-gray-800 truncate uppercase">
                          {card.cardHolderName || 'N/A'}
                        </p>
                      </div>

                      {/* Expiry Date - Hidden on mobile */}
                      <div className="hidden sm:block flex-shrink-0 w-30 text-center">
                        <p className="text-xs text-gray-500 mb-0.5">Hết hạn</p>
                        <p className="text-sm font-medium text-gray-700">
                          {formatDate(card.expirationDate) || 'N/A'}
                        </p>
                      </div>

                      {/* Assigned User - Hidden on mobile */}
                      <div className="hidden md:block flex-shrink-0 w-40">
                        <p className="text-xs text-gray-500 mb-0.5">Vận hành</p>
                        <p className="text-sm text-gray-700 truncate">
                          {card.assignedUserName || 'N/A'}
                        </p>
                      </div>

                      {/* Add Total - Hidden on mobile */}
                      <div className="hidden lg:block flex-shrink-0 w-30 text-center">
                        <p className="text-xs text-gray-500 mb-0.5">Tài khoản QC</p>
                        <p className="text-sm font-semibold text-blue-600">
                          {card.addTotal || 0}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="flex-shrink-0 w-30 text-center">
                        {renderStatus(card.status)}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 ml-auto flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(card.id);
                          }}
                          className="p-1.5 bg-white hover:bg-blue-50 rounded shadow-sm transition-colors"
                          title="Chỉnh sửa"
                        >
                          <SquarePen className="h-3.5 w-3.5 text-blue-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDelete(card);
                          }}
                          className="p-1.5 bg-white hover:bg-red-50 rounded shadow-sm transition-colors"
                          title="Xóa"
                        >
                          <Trash className="h-3.5 w-3.5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-4 bg-white rounded-lg shadow-sm p-3">
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
                  className="border border-gray-300 rounded px-1.5 py-0.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </select>
              </div>

              {/* Show Count */}
              <span className="text-gray-700 mr-4">
                {(pageNumber - 1) * pageSize + 1}–
                {Math.min(pageNumber * pageSize, totalItems)} trên {totalItems}
              </span>

              {/* Prev/Next Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => pageNumber > 1 && setPageNumber(pageNumber - 1)}
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
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    ></path>
                  </svg>
                </button>

                <button
                  onClick={() =>
                    pageNumber < totalPages && setPageNumber(pageNumber + 1)
                  }
                  disabled={pageNumber === totalPages}
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
          </div>
        </>
      )}

      {/* --- MODALS --- */}
      <DetailBankCardModal
        open={isDetailModalOpen}
        loading={isDetailLoading}
        cardData={detailData}
        onClose={() => setIsDetailModalOpen(false)}
        refreshData={() => openDetailModal(detailData?.id)} // Refresh current modal data
      />

      <DeleteConfirmModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận"
        message={`Bạn có chắc chắn muốn xóa thẻ "${cardToDelete?.cardNumber}" không?`}
        loading={isDeleting}
      />

      <CreateBankCardModal
        open={isCreateModalOpen}
        formData={formData}
        onChange={handleEditChange}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
        saving={saving}
        userList={userList}
        bankAccounts={bankAccounts}
      />

      <EditBankCardModal
        open={isEditModalOpen}
        loading={isEditLoading}
        saving={saving}
        formData={formData}
        onChange={handleEditChange}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        userList={userList}
        bankAccounts={bankAccounts}
      />
    </div>
  );
}

export default BankCardList;
