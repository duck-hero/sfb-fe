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
  const [pageSize, setPageSize] = useState(5);
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
      });
    } catch {
      toast.error("Không tải được dữ liệu thẻ");
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
      console.error(err); // Log lỗi ra để dễ debug
      toast.error("Cập nhật thất bại");
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
            console.error("Lỗi mã hóa CVV:", error);
            toast.error("Lỗi mã hóa dữ liệu. Vui lòng thử lại.");
            setSaving(false);
            return; // Dừng quá trình nếu mã hóa thất bại
        }
    }
    
    try {
        console.log("Create Payload đã mã hóa:", payload);

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
        // Log lỗi chi tiết từ API nếu cần
        console.error("Lỗi tạo thẻ:", error);
        toast.error("Tạo thất bại");
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
    } catch {
      toast.error("Xóa thất bại");
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
        <span className="inline-block px-3 py-1 text-sm font-medium text-green-600 border border-green-600 rounded-lg bg-white whitespace-nowrap">
          Hoạt động
        </span>
      );
    } else {
      // Giả sử các trạng thái khác (Inactive, Blocked...) là Danger
      return (
        <span className="inline-block px-3 py-1 text-sm font-medium text-red-600 border border-red-600 rounded-lg bg-white whitespace-nowrap">
          Vô hiệu
        </span>
      );
    }
  };

  return (
    <div className="px-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách thẻ ngân hàng</h1>

      {/* --- SEARCH BAR SECTION --- */}
      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
        <div className="flex items-center w-full max-w-4xl gap-4">
          {/* Input: Card Number */}
          <div className="flex-1 flex items-center px-5 py-2 bg-white border border-gray-200 rounded-xl shadow-lg transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-4 focus-within:ring-blue-100">
            <input
              type="text"
              placeholder="Tìm theo số thẻ..."
              value={searchCardNumber}
              onChange={(e) => setSearchCardNumber(e.target.value)}
              className="w-full text-gray-800 placeholder-gray-500 bg-transparent text-base focus:outline-none"
            />
          </div>

          {/* Input: Holder Name */}
          <div className="flex-1 flex items-center px-5 py-2 bg-white border border-gray-200 rounded-xl shadow-lg transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-4 focus-within:ring-blue-100">
            <input
              type="text"
              placeholder="Tìm theo tên chủ thẻ..."
              value={searchHolderName}
              onChange={(e) => setSearchHolderName(e.target.value)}
              className="w-full text-gray-800 placeholder-gray-500 bg-transparent text-base focus:outline-none"
            />
          </div>

          {/* Select: Assigned User */}
          <div className="flex-1 flex items-center px-5 py-2 bg-white border border-gray-200 rounded-xl shadow-lg transition-all duration-300 ease-in-out focus-within:border-primary-darkest focus-within:ring-4 focus-within:ring-blue-100">
            <select
              value={searchAssignedTo}
              onChange={(e) => setSearchAssignedTo(e.target.value)}
              className="w-full text-gray-800 placeholder-primary-darkest bg-transparent text-base focus:outline-none"
            >
              <option value="">-- Quản trị --</option>
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
        <TableSkeleton />
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-xl ">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-md font-medium text-gray-900 uppercase tracking-wider text-primary-darkest"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-md font-medium text-gray-900  tracking-wider text-primary-darkest"
                >
                  Số thẻ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-md font-medium text-gray-900  tracking-wider text-primary-darkest"
                >
                  Chủ thẻ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-md font-medium text-gray-900  tracking-wider text-primary-darkest"
                >
                  Ngày hết hạn
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-md font-medium text-gray-900  tracking-wider text-primary-darkest"
                >
                  Quản trị
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-md font-medium text-gray-900  tracking-wider text-primary-darkest"
                >
                  Số lần thêm
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-md font-medium text-gray-900  tracking-wider text-primary-darkest"
                >
                  Trạng thái
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-md font-medium text-gray-900  tracking-wider text-primary-darkest"
                >
                  Tuỳ chọn
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bankCards.map((x, index) => (
                <tr key={x.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(pageNumber - 1) * pageSize + index + 1}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-darkest cursor-pointer hover:underline"
                    onClick={() => openDetailModal(x.id)}
                  >
                    {x.cardNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {x.cardHolderName}
                  </td>
                  {/* --- CẬP NHẬT NGÀY HẾT HẠN --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(x.expirationDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {x.assignedUserName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center justify-center">
                    {x.addTotal}
                    
                  </td>

                  {/* --- CẬP NHẬT TRẠNG THÁI (BADGE) --- */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      {renderStatus(x.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex justify-center items-center gap-2">
                    <button onClick={() => openEditModal(x.id)}>
                      <SquarePen className="h-5 w-5 text-warning cursor-pointer" />
                    </button>
                    <button onClick={() => handleOpenDelete(x)}>
                      <Trash className="h-5 w-5 text-error cursor-pointer" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Footer Pagination */}
            <tfoot className="bg-white">
              <tr>
                <td colSpan="8" className="px-6 py-3">
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
                        className="border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
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
                        onClick={() =>
                          pageNumber > 1 && setPageNumber(pageNumber - 1)
                        }
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
                          pageNumber < totalPages &&
                          setPageNumber(pageNumber + 1)
                        }
                        disabled={pageNumber === totalPages}
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

      {/* --- MODALS --- */}
      <DetailBankCardModal
        open={isDetailModalOpen}
        loading={isDetailLoading}
        cardData={detailData}
        onClose={() => setIsDetailModalOpen(false)}
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
