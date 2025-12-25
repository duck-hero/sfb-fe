import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Plus, Trash, SquarePen, LineChart, RotateCw } from "lucide-react";
import { toast } from "react-toastify";
import customerApi from "../../api/customerApi";
import customerGroupApi from "../../api/customerGroupApi";
import accountApi from "../../api/accountApi";
import CreateCustomerModal from "./CreateCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import DeleteConfirmModal from "../../components/Modal/DeleteConfirmModal";
import DetailCustomerModal from "./DetailCustomerModal";
import SpendTrackingModal from "./SpendTrackingModal";
import TableSkeleton from "../../components/Loading/TableSkeleton";
import CustomerDetailView from "./CustomerDetailView";

function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);

    // Pagination
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filter
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchCode, setSearchCode] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [selectedOperatorId, setSelectedOperatorId] = useState("");

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Detail Modal
    const [detailId, setDetailId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Spend Modal
    const [spendCustomer, setSpendCustomer] = useState(null);
    const [isSpendModalOpen, setIsSpendModalOpen] = useState(false);

    // Inline Detail
    const [inlineDetailId, setInlineDetailId] = useState(null);

    // Loading states for actions
    const [saving, setSaving] = useState(false);
    const [isEditLoading, setIsEditLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({});
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Fetch Groups
    const fetchGroups = async () => {
        try {
            const res = await customerGroupApi.getPagedList(1, 100); // Fetch up to 100 groups
            if (res.success) {
                setGroups(res.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch customer groups", error);
        }
    };

    // Fetch Users (Operators)
    const fetchUsers = async () => {
        try {
            const res = await accountApi.getUserList(1, 100);
            if (res.data) {
                setUsers(res.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    // Fetch Data
    const fetchCustomers = async (page = 1, size = 10, keyword = null, groupId = null, operatorId = null) => {
        setLoading(true);
        try {
            const res = await customerApi.getCustomerList(
                page, 
                size, 
                keyword || null, 
                groupId || null, 
                operatorId || null
            );

            const items = res.data || [];
            const total = res.totalItems || 0;

            setCustomers(items);
            setTotalItems(total);
            setTotalPages(res.totalPages || Math.ceil(total / size) || 1);
            setPageNumber(page); // Sync state
            
            // Auto select first customer if none selected and items exist
            if (items.length > 0 && !inlineDetailId) {
                setInlineDetailId(items[0].id);
            }
            
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch customers", error);
            setCustomers([]);
            setLoading(false);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchCustomers(pageNumber, pageSize, searchCode, selectedGroupId, selectedOperatorId);
        fetchGroups();
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageNumber, pageSize]); // Trigger when page/size changes. Search is manual or separate.

    // Check for detailId in URL
    useEffect(() => {
        const detailIdParam = searchParams.get("detailId");
        if (detailIdParam) {
            setDetailId(detailIdParam);
            setIsDetailModalOpen(true);
        }
    }, [searchParams]);

    // Handlers
    const handleSearch = () => {
        setPageNumber(1);
        fetchCustomers(1, pageSize, searchCode, selectedGroupId, selectedOperatorId);
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
        setFormData({ name: "", agencyCode: "", customerGroupId: "" });
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
            fetchCustomers(pageNumber, pageSize, searchCode, selectedGroupId, selectedOperatorId);
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
            const detailData = res.data || res;
            setFormData({
                ...detailData,
                customerGroupId: detailData.customerGroupId || ""
            });
        } catch (error) {
            toast.error("Không tải được dữ liệu khách hàng");
            setFormData({
                ...item,
                customerGroupId: item.customerGroupId || ""
            });
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
            fetchCustomers(pageNumber, pageSize, searchCode, selectedGroupId, selectedOperatorId);
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
            fetchCustomers(pageNumber, pageSize, searchCode, selectedGroupId, selectedOperatorId);
        } catch (error) {
            toast.error(typeof error === 'string' ? error : "Xóa thất bại");
        } finally {
            setDeleting(false);
        }
    };

    // Click Row for Detail
    const handleRowClick = (item) => {
        setInlineDetailId(item.id);
    };

    // Spend Tracking
    const handleOpenSpend = (item) => {
        setSpendCustomer(item);
        setIsSpendModalOpen(true);
    }

    return (
        <div className="">

            <div className="grid grid-cols-10 gap-4 mt-4 min-h-[600px]">
                {/* Left Column: List (7/10) */}
                <div className="col-span-7 flex flex-col gap-3 h-full">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                        {/* Integrated Toolbar */}
                        <div className="p-3 border-b border-gray-100 bg-gray-50/30 flex flex-col gap-2">
                             <div className="flex items-center gap-2">
                                <div className="flex-1 relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm..."
                                        value={searchCode}
                                        onChange={(e) => setSearchCode(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSearch();
                                        }}
                                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                    />
                                </div>
                                <button
                                    onClick={handleOpenCreate}
                                    className="p-1.5 rounded-lg bg-primary-dark text-white hover:bg-primary-darkest transition-colors shadow-sm"
                                    title="Tạo mới"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                             </div>
                             
                             <div className="flex items-center gap-2">
                                <select
                                    value={selectedGroupId}
                                    onChange={(e) => setSelectedGroupId(e.target.value)}
                                    className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium min-w-[140px]"
                                >
                                    <option value="">Tất cả nhóm</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedOperatorId}
                                    onChange={(e) => setSelectedOperatorId(e.target.value)}
                                    className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium min-w-[140px]"
                                >
                                    <option value="">Tất cả NV phụ trách</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.fullName || u.userName}</option>
                                    ))}
                                </select>

                                <button
                                    onClick={handleSearch}
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
                                >
                                    Lọc dữ liệu
                                </button>
                             </div>
                        </div>

                        {loading ? (
                            <div className="p-10 flex justify-center"><RotateCw className="w-8 h-8 animate-spin text-blue-500" /></div>
                        ) : (
                            <>
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full divide-y divide-gray-100">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Tên khách
                                                </th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Mã khách
                                                </th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Mã agency
                                                </th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Code Khách
                                                </th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Nhóm
                                                </th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    NV phụ trách
                                                </th>
                                                <th scope="col" className="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    Thao tác
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-50">
                                            {customers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-3 py-10 text-center text-gray-400 text-xs italic">
                                                        Không tìm thấy dữ liệu
                                                    </td>
                                                </tr>
                                            ) : (
                                                customers.map((customer) => (
                                                    <tr
                                                        key={customer.id}
                                                        className={`hover:bg-blue-50 transition-colors cursor-pointer ${inlineDetailId === customer.id ? 'bg-blue-50/80 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                                                        onClick={() => handleRowClick(customer)}
                                                    >
                                                        <td className="px-3 py-2">
                                                            <div className="text-sm font-bold text-gray-800 leading-tight">
                                                                {customer.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <div className="text-xs text-gray-600 font-medium">
                                                                {customer.customerCode || "-"}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <div className="text-[11px] text-gray-600 font-medium">
                                                                {customer.agencyCode || "-"}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <div className="text-xs text-blue-600 font-bold">
                                                                {customer.fullCustomerCode || "-"}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <div className="text-[11px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded-full inline-block">
                                                                {customer.customerGroupName || "-"}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <div className="text-[11px] text-orange-600 font-bold bg-orange-50 px-1.5 py-0.5 rounded-full inline-block">
                                                                {customer.operatorUserName || "-"}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex justify-end gap-1.5">
                                                                <button
                                                                    onClick={() => handleOpenSpend(customer)}
                                                                    className="p-1 hover:bg-green-50 rounded transition-colors"
                                                                    title="Theo dõi chi tiêu"
                                                                >
                                                                    <LineChart className="h-3.5 w-3.5 text-green-600" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleOpenEdit(customer)}
                                                                    className="p-1 hover:bg-orange-50 rounded transition-colors"
                                                                    title="Sửa"
                                                                >
                                                                    <SquarePen className="h-3.5 w-3.5 text-warning" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleOpenDelete(customer)}
                                                                    className="p-1 hover:bg-red-50 rounded transition-colors"
                                                                    title="Xóa"
                                                                >
                                                                    <Trash className="h-3.5 w-3.5 text-error" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Footer Pagination */}
                                <div className="p-2 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-[11px]">
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={pageSize}
                                            onChange={handlePageSizeChange}
                                            className="border border-gray-200 rounded px-1.5 py-0.5 bg-white text-gray-600 outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                                        >
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                        <span className="text-gray-400 font-medium">{totalItems} khách</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={handlePrev}
                                            disabled={pageNumber === 1}
                                            className="p-1 rounded bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </button>
                                        <span className="font-bold text-gray-700 px-1">{pageNumber}/{totalPages}</span>
                                        <button
                                            onClick={handleNext}
                                            disabled={pageNumber === totalPages}
                                            className="p-1 rounded bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Column: Detail (3/10) */}
                <div className="col-span-3 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full ring-1 ring-black/5">
                    <CustomerDetailView id={inlineDetailId} />
                </div>
            </div>

            {/* --- Modals --- */}
            <CreateCustomerModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleCreateSave}
                saving={saving}
                formData={formData}
                onChange={handleInputChange}
                groups={groups}
            />

            <EditCustomerModal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditSave}
                saving={saving}
                loading={isEditLoading}
                formData={formData}
                onChange={handleInputChange}
                groups={groups}
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

            <SpendTrackingModal
                open={isSpendModalOpen}
                customer={spendCustomer}
                onClose={() => setIsSpendModalOpen(false)}
            />
        </div>
    );
}

export default CustomerList;
