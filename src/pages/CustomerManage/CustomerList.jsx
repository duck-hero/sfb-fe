import { useEffect, useState } from "react";
import { Search, Plus, Trash, SquarePen } from "lucide-react";
import { toast } from "react-toastify";
import customerApi from "../../api/customerApi";
import CreateCustomerModal from "./CreateCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import DeleteConfirmModal from "../../components/Modal/DeleteConfirmModal";
import DetailCustomerModal from "./DetailCustomerModal";
import TableSkeleton from "../../components/Loading/TableSkeleton";

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter
  const [searchKeyword, setSearchKeyword] = useState("");
  // const [debouncedKeyword, setDebouncedKeyword] = useState(""); // Removed debounce state to use direct search handler pattern like BmSourceList if desired, but debounce is better. Let's keep debounce logic but maybe align style.
  // Actually BmSourceList uses explicit Enter or button to search, but let's stick to auto-debounce or Enter. The user asked for pagination *style*, not necessarily removing debounce.
  // BmSourceList: Input has `onKeyDown Enter -> handleSearch`. Let's adopt that manual trigger style if "like BmSourceList" implies behavior too.
  // But usually users prefer debounce. I will support BOTH: Enter to search immediately, and debounce if typing stops? 
  // Let's stick to BmSourceList exact behavior since requested "like BmSourceList". 
  // BmSourceList uses `searchCode` state and `handleSearch` function triggered by Enter.
  
  const [searchCode, setSearchCode] = useState("");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Detail Modal
  const [detailId, setDetailId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Loading states for actions
  const [saving, setSaving] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null);


  // Fetch Data
  const fetchCustomers = async (page = 1, size = 10, keyword = "") => {
    setLoading(true);
    try {
      const res = await customerApi.getCustomerList(page, size, keyword);
      
      const items = res.data || res.items || [];
      const total = res.totalItems || 0;
      
      setCustomers(items);
      setTotalItems(total);
      setTotalPages(Math.ceil(total / size) || 1);
      setPageNumber(page); // Sync state
      setLoading(false);
    } catch (error) {
       console.error("Failed to fetch customers", error);
       setCustomers([]);
       setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchCustomers(pageNumber, pageSize, searchCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize]); // Trigger when page/size changes. Search is manual or separate.

  // Handlers
  const handleSearch = () => {
      setPageNumber(1);
      fetchCustomers(1, pageSize, searchCode);
  };
  
  // Pagination Handlers
  const handlePrev = () => {
      if (pageNumber > 1) {
          setPageNumber(prev => prev - 1);
      }
  };
  
  const handleNext = () => {
      if (pageNumber < totalPages) {
           setPageNumber(prev => prev + 1);
      }
  };

  const handlePageSizeChange = (e) => {
      setPageSize(Number(e.target.value));
      setPageNumber(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create
  const handleOpenCreate = () => {
    setFormData({ name: "", codeCamp: "" });
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async () => {
      if (!formData.name) {
          toast.error("Vui lòng nhập tên khách hàng");
          return;
      }
      setSaving(true);
      try {
          await customerApi.createCustomer(formData);
          toast.success("Thêm khách hàng thành công");
          setIsCreateModalOpen(false);
          fetchCustomers(pageNumber, pageSize, searchCode);
      } catch (error) {
          toast.error(typeof error === 'string' ? error : "Thêm thất bại");
      } finally {
          setSaving(false);
      }
  };

  // Edit
  const handleOpenEdit = async (item) => {
      setSelectedCustomer(item);
      setIsEditModalOpen(true);
      setIsEditLoading(true);
      // Fetch details fresh from API
      try {
         const res = await customerApi.getCustomerById(item.id);
         setFormData(res.data || res); 
      } catch (error) {
         toast.error("Không tải được dữ liệu khách hàng");
         setFormData(item);
      } finally {
         setIsEditLoading(false);
      }
  };

  const handleEditSave = async () => {
     if (!formData.name) {
          toast.error("Vui lòng nhập tên khách hàng");
          return;
      }
      setSaving(true);
      try {
          await customerApi.updateCustomer(selectedCustomer.id, formData);
          toast.success("Cập nhật thành công");
          setIsEditModalOpen(false);
          fetchCustomers(pageNumber, pageSize, searchCode);
      } catch (error) {
          toast.error(typeof error === 'string' ? error : "Cập nhật thất bại");
      } finally {
          setSaving(false);
      }
  };

  // Delete
  const handleOpenDelete = (item) => {
      setSelectedCustomer(item);
      setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
      setDeleting(true);
      try {
          await customerApi.deleteCustomer(selectedCustomer.id);
          toast.success("Xóa thành công");
          setIsDeleteModalOpen(false);
          fetchCustomers(pageNumber, pageSize, searchCode);
      } catch (error) {
          toast.error(typeof error === 'string' ? error : "Xóa thất bại");
      } finally {
          setDeleting(false);
      }
  };

  // Click Row for Detail
  const handleRowClick = (item) => {
      setDetailId(item.id);
      setIsDetailModalOpen(true);
  };

  return (
    <div className="px-4">
      <h1 className="text-lg font-bold mb-3">Danh sách khách hàng</h1>

      {/* --- Toolbar (Matched BmSourceList Style) --- */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
        <div className="w-full max-w-3xl">
          <div
            className="flex items-center w-full px-3 py-1.5 bg-white 
                   border border-gray-200 rounded-lg shadow-md 
                   transition-all duration-300 ease-in-out
                   focus-within:border-primary-darkest focus-within:ring-2 focus-within:ring-blue-100"
          >
             <Search className="h-4 w-4 text-primary-darkest mr-2 flex-shrink-0" />
            <input
               type="text"
               placeholder="Tìm kiếm theo tên..."
               value={searchCode}
               onChange={(e) => setSearchCode(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === "Enter") handleSearch();
               }}
               className="w-full text-gray-800 placeholder-gray-500 bg-transparent text-sm focus:outline-none"
            />
          </div>
        </div>

         {/* Add Button */}
         <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 rounded-lg font-semibold text-sm transition bg-primary-dark text-white hover:bg-primary-darkest cursor-pointer"
         >
            <Plus className="h-4 w-4 inline-block mr-1.5" />
            Tạo mới
         </button>
      </div>

      {/* --- List/Table --- */}
      {loading ? (
          <TableSkeleton />
      ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
             <table className="w-full divide-y divide-gray-200">
                 <thead className="bg-white">
                     <tr>
                         <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-900 uppercase tracking-wider text-primary-darkest">
                             Tên khách hàng
                         </th>
                         <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-900 uppercase tracking-wider text-primary-darkest">
                             Code Camp
                         </th>
                         <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-900 uppercase tracking-wider w-1/12 text-primary-darkest">
                             Tùy chọn
                         </th>
                     </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                     {customers.length === 0 ? (
                        <tr>
                           <td colSpan="3" className="px-3 py-3 text-center text-gray-500 text-sm">
                              Không tìm thấy dữ liệu
                           </td>
                        </tr>
                     ) : (
                         customers.map((customer) => (
                             <tr 
                                key={customer.id} 
                                className="hover:bg-blue-50 transition-colors group cursor-pointer"
                                onClick={() => handleRowClick(customer)}
                             >
                                 <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                     {customer.name}
                                 </td>
                                 <td className="px-3 py-2 whitespace-nowrap">
                                     <div className="text-sm text-gray-500 bg-gray-100 rounded px-2 py-1 inline-block">
                                        {customer.codeCamp || "-"}
                                     </div>
                                 </td>
                                 <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 w-1/12" onClick={(e) => e.stopPropagation()}>
                                     <div className="flex">
                                         <button
                                             onClick={() => handleOpenEdit(customer)}
                                             className="mr-2"
                                             title="Sửa"
                                         >
                                             <SquarePen className="h-4 w-4 text-warning flex-shrink-0 cursor-pointer" />
                                         </button>
                                         <button
                                             onClick={() => handleOpenDelete(customer)}
                                             className=""
                                             title="Xóa"
                                         >
                                             <Trash className="h-4 w-4 text-error flex-shrink-0 cursor-pointer" />
                                         </button>
                                     </div>
                                 </td>
                             </tr>
                         ))
                     )}
                 </tbody>
                 {/* Footer Pagination */}
                 <tfoot className="bg-white">
                    <tr>
                        <td colSpan="3" className="px-3 py-2">
                           <div className="flex justify-end items-center text-xs">
                              {/* Page Size */}
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
                                    <option value={20}>20</option>
                                 </select>
                              </div>

                              {/* Count Info */}
                              <span className="text-gray-700 mr-4">
                                 {(pageNumber - 1) * pageSize + 1}–
                                 {Math.min(pageNumber * pageSize, totalItems)} trên {totalItems}
                              </span>

                              {/* Nav Buttons */}
                              <div className="flex items-center gap-1.5">
                                 <button
                                    onClick={handlePrev}
                                    disabled={pageNumber === 1}
                                    className={`p-1.5 rounded-full transition duration-150 ${
                                       pageNumber === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                 >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                    </svg>
                                 </button>
                                 <button
                                    onClick={handleNext}
                                    disabled={pageNumber === totalPages}
                                    className={`p-1.5 rounded-full transition duration-150 ${
                                       pageNumber === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                 >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
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

      {/* --- Modals --- */}
      <CreateCustomerModal
         open={isCreateModalOpen}
         onClose={() => setIsCreateModalOpen(false)}
         onSave={handleCreateSave}
         saving={saving}
         formData={formData}
         onChange={handleInputChange}
      />

      <EditCustomerModal
         open={isEditModalOpen}
         onClose={() => setIsEditModalOpen(false)}
         onSave={handleEditSave}
         saving={saving}
         loading={isEditLoading}
         formData={formData}
         onChange={handleInputChange}
      />

      <DeleteConfirmModal
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa khách hàng "${selectedCustomer?.name}"?`}
          loading={deleting}
      />
      
      <DetailCustomerModal
          open={isDetailModalOpen}
          id={detailId}
          onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
}

export default CustomerList;
