import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Search,
    Plus,
    Trash,
    SquarePen,
    LineChart,
    RotateCw,
    LayoutList,
    Filter,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { toast } from "react-toastify";
import customerApi from "../../api/customerApi";
import customerGroupApi from "../../api/customerGroupApi";
import accountApi from "../../api/accountApi";
import CreateCustomerModal from "./CreateCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import DeleteConfirmModal from "../../components/Modal/DeleteConfirmModal";
import DetailCustomerModal from "./DetailCustomerModal";
import SpendTrackingModal from "./SpendTrackingModal";
import CustomerDetailView from "./CustomerDetailView";
import collaboratorApi from "../../api/collaboratorApi";
import ImportCustomerModal from "./ImportCustomerModal";

function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [collaborators, setCollaborators] = useState([]);
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);

    // Pagination
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filter
    const [searchCode, setSearchCode] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [selectedOperatorId, setSelectedOperatorId] = useState("");

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

    // Fetch Collaborators
    const fetchCollaborators = async () => {
        try {
            const res = await collaboratorApi.getPagedList(1, 100);
            if (res.success) {
                setCollaborators(res.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch collaborators", error);
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

            if (items.length === 0) {
                setInlineDetailId(null);
            } else if (!items.some((customer) => customer.id === inlineDetailId)) {
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
        fetchCollaborators();
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
        const normalizedKeyword = searchCode.trim();
        setPageNumber(1);
        fetchCustomers(1, pageSize, normalizedKeyword, selectedGroupId, selectedOperatorId);
    };

    const handleRefresh = () => {
        fetchCustomers(pageNumber, pageSize, searchCode.trim(), selectedGroupId, selectedOperatorId);
    };

    const handleClearFilters = () => {
        setSearchCode("");
        setSelectedGroupId("");
        setSelectedOperatorId("");
        setPageNumber(1);
        fetchCustomers(1, pageSize, null, null, null);
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

        let finalValue;

        // If the empty option is selected for dropdown fields, use null
        if ((name === "customerGroupId" || name === "operatorUserId" || name === "collaboratorId") && value === "") {
            finalValue = null;
        }
        else {
            finalValue = value;
        }

        setFormData((prev) => ({ ...prev, [name]: finalValue }));
    };

    // Create
    const handleOpenCreate = () => {
        setFormData({ name: "", agencyCode: "", customerGroupId: null, operatorUserId: null, collaboratorId: null, collaboratorRate: 0 });
        setIsCreateModalOpen(true);
    };

    const handleCreateSave = async () => {
        if (!formData.name) {
            toast.error("Vui lòng nhập tên khách hàng");
            return;
        }
        setSaving(true);
        try {
            // Convert collaboratorRate from percentage to decimal before sending to API
            const dataToSend = {
                ...formData,
                collaboratorRate: formData.collaboratorRate ? Number(formData.collaboratorRate) / 100 : 0
            };
            await customerApi.createCustomer(dataToSend);
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
                customerGroupId: detailData.customerGroupId || null,
                operatorUserId: detailData.operatorUserId || null,
                collaboratorId: detailData.collaboratorId || null,
                // Convert API decimal to UI percentage (0.01 -> 1)
                collaboratorRate: detailData.collaboratorRate ? (detailData.collaboratorRate * 100) : 0
            });
        } catch {
            toast.error("Không tải được dữ liệu khách hàng");
            setFormData({
                ...item,
                customerGroupId: item.customerGroupId || null,
                operatorUserId: item.operatorUserId || null,
                collaboratorId: item.collaboratorId || null,
                // Convert API decimal to UI percentage (0.01 -> 1)
                collaboratorRate: item.collaboratorRate ? (item.collaboratorRate * 100) : 0
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
            // Convert collaboratorRate from percentage to decimal before sending to API
            const dataToSend = {
                ...formData,
                collaboratorRate: formData.collaboratorRate ? Number(formData.collaboratorRate) / 100 : 0
            };
            await customerApi.updateCustomer(selectedCustomer.id, dataToSend);
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

    const activeFilterCount = [searchCode, selectedGroupId, selectedOperatorId].filter(Boolean).length;
    const selectedGroupLabel = groups.find((group) => String(group.id) === String(selectedGroupId))?.name;
    const selectedOperatorLabel = users.find((user) => String(user.id) === String(selectedOperatorId))?.fullName
        || users.find((user) => String(user.id) === String(selectedOperatorId))?.userName;

    return (
        <div className="space-y-4 isolate">
            

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,0.95fr)]">
                <div className="flex min-h-[620px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 bg-gray-50/80 px-4 py-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm theo tên khách, mã khách, mã agency hoặc code tổng..."
                                        value={searchCode}
                                        onChange={(e) => setSearchCode(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSearch();
                                        }}
                                        className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-2.5 text-xs text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />
                                </div>

                                <div className="flex items-center gap-2 self-end lg:self-auto">
                                    <button
                                        onClick={handleRefresh}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-100"
                                    >
                                        <RotateCw className="h-3.5 w-3.5" />
                                        Làm mới
                                    </button>
                                    <button
                                        onClick={handleOpenCreate}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary-dark px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-darkest"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Tạo khách hàng
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
                                <select
                                    value={selectedGroupId}
                                    onChange={(e) => setSelectedGroupId(e.target.value)}
                                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                >
                                    <option value="">Tất cả nhóm khách</option>
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>{group.name}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedOperatorId}
                                    onChange={(e) => setSelectedOperatorId(e.target.value)}
                                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                >
                                    <option value="">Tất cả nhân viên phụ trách</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>{user.fullName || user.userName}</option>
                                    ))}
                                </select>

                                <button
                                    onClick={handleSearch}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                                >
                                        <Filter className="h-3.5 w-3.5" />
                                    Lọc dữ liệu
                                </button>

                                <button
                                    onClick={handleClearFilters}
                                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-100"
                                >
                                    Xóa lọc
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                                    {totalItems} khách hàng
                                </span>
                                <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600">
                                    {activeFilterCount} bộ lọc đang áp dụng
                                </span>
                                {selectedGroupLabel && (
                                    <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                                        Nhóm: {selectedGroupLabel}
                                    </span>
                                )}
                                {selectedOperatorLabel && (
                                    <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
                                        Phụ trách: {selectedOperatorLabel}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-1 items-center justify-center p-10">
                            <RotateCw className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="sticky top-0 z-[1] bg-white/95 backdrop-blur-sm">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                                                Tên khách
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                                                Mã khách
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                                                Mã agency
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                                                Code Khách
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                                                Nhóm
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                                                Phụ trách
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                                                Cộng tác viên
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {customers.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="px-4 py-16 text-center">
                                                    <div className="mx-auto max-w-sm space-y-2">
                                                        <p className="text-sm font-semibold text-gray-700">Không tìm thấy khách hàng phù hợp</p>
                                                        <p className="text-sm text-gray-400">
                                                            Thử nới bộ lọc hoặc tìm bằng tên khách, mã khách và code tổng.
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            customers.map((customer) => (
                                                <tr
                                                    key={customer.id}
                                                    className={`cursor-pointer align-top transition ${inlineDetailId === customer.id
                                                        ? "bg-blue-50/80 shadow-[inset_4px_0_0_0_#2563eb]"
                                                        : "hover:bg-gray-50"
                                                        }`}
                                                    onClick={() => handleRowClick(customer)}
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="text-sm font-bold text-gray-800 leading-tight">
                                                            {customer.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-xs text-gray-600 font-medium">
                                                            {customer.customerCode || "-"}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-[11px] text-gray-600 font-medium">
                                                            {customer.agencyCode || "-"}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-xs text-blue-600 font-bold">
                                                            {customer.fullCustomerCode || "-"}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-xs text-gray-600 font-medium">
                                                            {customer.customerGroupName || "-"}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-xs text-gray-600 font-medium">
                                                            {customer.operatorUserName || "-"}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-xs text-gray-600 font-medium">
                                                            {customer.collaboratorName || "-"}
                                                            {customer.collaboratorRate > 0 && (
                                                                <span className="ml-1 text-gray-500 text-[10px]">({(customer.collaboratorRate * 100).toFixed(1)}%)</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex justify-end gap-1.5">
                                                            <button
                                                                onClick={() => handleOpenSpend(customer)}
                                                                className="rounded-lg border border-transparent p-2 text-green-600 transition hover:border-green-100 hover:bg-green-50"
                                                                title="Theo dõi chi tiêu"
                                                            >
                                                                <LineChart className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenEdit(customer)}
                                                                className="rounded-lg border border-transparent p-2 text-warning transition hover:border-orange-100 hover:bg-orange-50"
                                                                title="Sửa"
                                                            >
                                                                <SquarePen className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenDelete(customer)}
                                                                className="rounded-lg border border-transparent p-2 text-error transition hover:border-red-100 hover:bg-red-50"
                                                                title="Xóa"
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span>
                                        Hiển thị trang <span className="font-semibold text-gray-800">{pageNumber}</span> trên{" "}
                                        <span className="font-semibold text-gray-800">{totalPages}</span>
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Mỗi trang</span>
                                        <select
                                            value={pageSize}
                                            onChange={handlePageSizeChange}
                                            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
                                        >
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <button
                                        onClick={handlePrev}
                                        disabled={pageNumber === 1}
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Trước
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={pageNumber === totalPages}
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Sau
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="min-h-[520px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)]">
                    <CustomerDetailView id={inlineDetailId} />
                </div>
            </div>

            {/* --- Modals --- */}
            <CreateCustomerModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleCreateSave}
                onImportClick={() => setIsImportModalOpen(true)}
                saving={saving}
                formData={formData}
                onChange={handleInputChange}
                groups={groups}
                users={users}
                collaborators={collaborators}
            />

            <ImportCustomerModal
                open={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={() => {
                    fetchCustomers(pageNumber, pageSize, searchCode, selectedGroupId, selectedOperatorId);
                }}
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
                users={users}
                collaborators={collaborators}
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
