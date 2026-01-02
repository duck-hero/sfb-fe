import { useEffect, useState, useMemo } from "react";
import { Plus, RotateCw, Trash2, Search } from "lucide-react";
import customerApi from "../../api/customerApi";
import adsAccountApi from "../../api/adsAccountApi";
import customerAdsAccountApi from "../../api/customerAdsAccountApi";
import { toast } from "react-toastify";

// Helper formatter
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString("vi-VN");
  } catch {
    return dateString;
  }
};

// Component hiển thị trường thông tin
const DetailField = ({ label, value, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
      {label}
    </label>
    <div className="w-full h-9 flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm text-gray-800 truncate">
      {value || "N/A"}
    </div>
  </div>
);

// --- SKELETON INPUT ---
const InputSkeleton = () => (
  <div className="flex flex-col gap-1">
    <div className="h-3 w-20 bg-gray-100 rounded-full animate-pulse mb-1"></div>
    <div className="w-full h-9 bg-gray-100 rounded-lg animate-pulse"></div>
  </div>
);

// --- SKELETON CONTENT ---
const ContentSkeleton = () => (
  <div className="p-4 space-y-6">
    <div className="space-y-3">
        <div className="h-4 w-32 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4">
            <InputSkeleton />
            <InputSkeleton />
            <InputSkeleton />
            <InputSkeleton />
        </div>
    </div>
    <div className="space-y-3">
        <div className="h-4 w-32 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-32 w-full bg-gray-100 rounded-lg animate-pulse"></div>
    </div>
  </div>
);

const CustomerDetailView = ({ id }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("ACTIVE"); // 'ACTIVE' | 'HISTORY'
  
  // Add Rental State
  const [isAddRentalOpen, setIsAddRentalOpen] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [searchAccount, setSearchAccount] = useState(""); 
  
  // New Rental Fields
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const [startAt, setStartAt] = useState(getTodayString()); 
  const [feePercent, setFeePercent] = useState("");
  const [paymentMode, setPaymentMode] = useState(2); // Default 2: AgencyPays

  // Status Update State
  const [updatingStatus, setUpdatingStatus] = useState({});

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await customerApi.getCustomerById(id);
      setData(res.data || res); 
    } catch (error) {
      toast.error("Không tải được chi tiết khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    setActiveTab("ACTIVE");
  }, [id]);

  const allAccounts = useMemo(() => data?.adsAccountDtos || [], [data]);
  const activeAccounts = useMemo(() => allAccounts.filter(acc => acc.status === 'ACTIVE'), [allAccounts]);
  const displayAccounts = activeTab === 'ACTIVE' ? activeAccounts : allAccounts;

  const handleOpenAddRental = async () => {
    setIsAddRentalOpen(true);
    setSelectedAccountId(null);
    setSearchAccount("");
    setStartAt(getTodayString());
    setFeePercent("");
    setPaymentMode(2);
    
    setLoadingAccounts(true);
    try {
      const res = await adsAccountApi.getAdsAccountList(1, 100);
      setAvailableAccounts(res.data || res.items || []);
    } catch (error) {
      toast.error("Không tải được danh sách tài khoản");
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleAddRental = async () => {
    if (!selectedAccountId) return;
    setAdding(true);
    try {
      const fee = feePercent ? parseFloat(feePercent) / 100 : 0;
      await customerAdsAccountApi.createCustomerAdsAccount({
        adAccountId: selectedAccountId,
        customerId: id,
        startAt: new Date(startAt).toISOString(),
        feePercent: fee,
        paymentMode: parseInt(paymentMode)
      });
      toast.success("Thêm tài khoản thuê thành công");
      setIsAddRentalOpen(false);
      fetchDetail();
    } catch (error) {
      toast.error(typeof error === 'string' ? error : "Thêm thất bại");
    } finally {
      setAdding(false);
    }
  };

  const handleStatusChange = async (customerAdsAccountId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [customerAdsAccountId]: true }));
    try {
      await customerAdsAccountApi.updateCustomerAdsAccount({
        id: customerAdsAccountId,
        status: newStatus
      });
      toast.success("Cập nhật trạng thái thành công");
      fetchDetail();
    } catch (error) {
      toast.error(typeof error === 'string' ? error : "Cập nhật thất bại");
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [customerAdsAccountId]: false }));
    }
  };

  if (!id) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 m-4">
        <Search className="w-12 h-12 mb-3 opacity-20" />
        <p className="text-sm font-medium">Chọn một khách hàng để xem chi tiết</p>
      </div>
    );
  }

  if (loading) return <ContentSkeleton />;

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header Info */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/30">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-lg font-bold text-gray-800">{data?.fullCustomerCode}</h2>
                <p className="text-xs text-secondary italic">{data?.name}</p>
            </div>
            <button
                onClick={handleOpenAddRental}
                className="flex items-center px-3 py-1.5 rounded-lg font-bold text-xs transition bg-primary-dark text-white hover:bg-primary-darkest shadow-sm"
            >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Thuê Tài Khoản
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-2 py-2 border-b border-gray-100 flex items-center justify-between bg-white">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            <button
                onClick={() => setActiveTab("ACTIVE")}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${activeTab === 'ACTIVE' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                ĐANG THUÊ ({activeAccounts.length})
            </button>
            <button
                onClick={() => setActiveTab("HISTORY")}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${activeTab === 'HISTORY' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                LỊCH SỬ ({allAccounts.length})
            </button>
        </div>
      </div>

      {/* Account List */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white">
        {displayAccounts.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50 sticky top-0 z-10">
                    <tr>
                <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Tài khoản</th>
                <th className="px-1 py-2 text-left text-[10px] font-bold text-gray-500 uppercase min-w-[100px]">Thanh toán</th>
                <th className="px-1 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Trạng thái</th>
                <th className="px-2 py-2 text-right text-[10px] font-bold text-gray-500 uppercase">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {displayAccounts.map((acc) => (
                        <tr key={acc.customerAdsAccountId} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-2 py-2">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-gray-800 truncate max-w-[120px]" title={acc.adAccountIdNumber}>
                                        {acc.adAccountIdNumber}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]" title={acc.adAccountName}>{acc.adAccountName}</span>
                                </div>
                            </td>
                            <td className="px-1 py-2">
                                <div className="flex flex-col gap-1">
                                    {acc.paymentMode === 1 ? (
                                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100 flex items-center w-fit gap-1 text-[10px] font-bold">
                                            <span className="w-1 h-1 rounded-full bg-purple-400"></span>
                                            Thẻ khách
                                        </span>
                                    ) : acc.paymentMode === 3 ? (
                                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-600 border border-teal-100 flex items-center w-fit gap-1 text-[10px] font-bold">
                                            <span className="w-1 h-1 rounded-full bg-teal-400"></span>
                                            Thẻ đầu tổng
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100 flex items-center w-fit gap-1 text-[10px] font-bold">
                                            <span className="w-1 h-1 rounded-full bg-orange-400"></span>
                                            Thẻ HDG
                                        </span>
                                    )}
                                    <span className="text-[11px] font-black text-blue-600 ml-1">
                                        Phí: {(acc.feePercent * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </td>
                            <td className="px-1 py-2">
                                <div className="flex flex-col gap-1">
                                    {acc.statusAdsAccount ? 
                                        <span className="w-fit px-1.5 py-0.5 text-[8px] font-black bg-red-100 text-red-700 rounded-full border border-red-200">LOCKED</span> : 
                                        <span className="w-fit px-1.5 py-0.5 text-[8px] font-black bg-green-100 text-green-700 rounded-full border border-green-200">LIVE</span>
                                    }
                                    <span className="text-[9px] text-gray-400">{formatDate(acc.rentalDate)}</span>
                                    <span className="text-[9px] text-gray-400">{formatDate(acc.endAt)}</span>
                                </div>
                            </td>
                            <td className="px-1 py-2 text-right">
                                <select
                                    value={acc.status || 'ACTIVE'}
                                    onChange={(e) => handleStatusChange(acc.customerAdsAccountId, e.target.value)}
                                    disabled={updatingStatus[acc.customerAdsAccountId]}
                                    className={`text-[10px] font-bold border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-colors ${acc.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                                >
                                    <option value="ACTIVE">Đang Thuê</option>
                                    <option value="INACTIVE">Ngừng Thuê</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
            <div className="py-20 text-center text-gray-400 text-xs italic">
                {activeTab === 'ACTIVE' ? "Không có tài khoản đang thuê" : "Không có lịch sử thuê"}
            </div>
        )}
      </div>

      {/* Add Rental Modal Internal */}
      {isAddRentalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-sm font-bold text-gray-700">Tạo phiên thuê</h3>
                    <button onClick={() => setIsAddRentalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <Plus className="w-5 h-5 rotate-45" />
                    </button>
                </div>
                
                <div className="p-4 space-y-4">
                    {/* Filter Accounts */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="Tìm ID tài khoản..."
                            value={searchAccount}
                            onChange={(e) => setSearchAccount(e.target.value)}
                        />
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-blue-500 rounded-lg divide-y divide-gray-50">
                        {loadingAccounts ? (
                            <div className="p-4 flex justify-center"><RotateCw className="w-5 h-5 animate-spin text-blue-500" /></div>
                        ) : availableAccounts.filter(a => a.adAccountIdNumber?.includes(searchAccount)).map(acc => (
                            <div 
                                key={acc.id}
                                onClick={() => setSelectedAccountId(acc.id)}
                                className={`p-3 cursor-pointer transition-colors ${selectedAccountId === acc.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            >
                                <div className="text-xs font-bold text-gray-800">{acc.adAccountIdNumber}</div>
                                <div className="text-[10px] text-gray-400 truncate">{acc.adAccountName}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Ngày bắt đầu thuê</label>
                            <input 
                                type="date" 
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs" 
                                value={startAt}
                                onChange={(e) => setStartAt(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Phí (%)</label>
                            <input 
                                type="number" 
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs" 
                                placeholder="0"
                                value={feePercent}
                                onChange={(e) => setFeePercent(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Mode thanh toán</label>
                        <select 
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value)}
                        >
                            <option value={2}>Thẻ HDG</option>
                            <option value={1}>Thẻ khách</option>
                            <option value={3}>Thẻ đầu tổng</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button onClick={() => setIsAddRentalOpen(false)} className="flex-1 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-200 transition-colors">Hủy</button>
                    <button 
                        onClick={handleAddRental}
                        disabled={adding || !selectedAccountId}
                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {adding ? "Đang xử lý..." : "Xác nhận"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailView;
