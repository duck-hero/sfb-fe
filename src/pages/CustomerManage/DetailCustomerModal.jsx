import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Plus } from "lucide-react";
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
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="w-full h-10 flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 text-sm text-gray-800 truncate">
      {value || "N/A"}
    </div>
  </div>
);

// --- SKELETON INPUT ---
const InputSkeleton = () => (
  <div className="flex flex-col gap-1">
    <div className="h-4 w-24 bg-gray-200 rounded-full animate-pulse mb-1"></div>
    <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
  </div>
);

// --- SKELETON CONTENT ---
const ContentSkeleton = () => (
  <>
    <div className="mb-3">
        <div className="h-5 w-40 bg-gray-300 rounded-full animate-pulse mb-3"></div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <InputSkeleton />
            <InputSkeleton />
            <div className="col-span-2">
                <InputSkeleton />
            </div>
        </div>
    </div>
    
    <div className="mt-4">
        <div className="h-5 w-40 bg-gray-300 rounded-full animate-pulse mb-3"></div>
        <div className="space-y-2">
             <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
             <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
    </div>

    <div className="mt-6 flex justify-end">
        <div className="px-4 py-2 w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
  </>
);

const DetailCustomerModal = ({ open, id, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("ACTIVE"); // 'ACTIVE' | 'HISTORY'
  
  // Add Rental Modal State
  const [isAddRentalOpen, setIsAddRentalOpen] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [searchAccount, setSearchAccount] = useState(""); // Search for accounts
  
  // Status Update State
  const [updatingStatus, setUpdatingStatus] = useState({});

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getCustomerById(id);
      const fetchedData = res.data || res;
      setData(fetchedData); 
    } catch (error) {
      toast.error("Không tải được chi tiết khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && id) {
      fetchDetail();
      setActiveTab("ACTIVE");
    } else {
        setData(null);
    }
  }, [open, id]);

  // Derived state for filtered list
  const activeAccounts = data?.adsAccountDtos?.filter(acc => acc.status === 'ACTIVE') || [];
  const allAccounts = data?.adsAccountDtos || [];
  
  const displayAccounts = activeTab === 'ACTIVE' ? activeAccounts : allAccounts;

  // Fetch Available Ads Accounts
  const fetchAvailableAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const res = await adsAccountApi.getAdsAccountList(1, 100); // Fetch first 100
      const accounts = res.data || res.items || [];
      setAvailableAccounts(accounts);
    } catch (error) {
      toast.error("Không tải được danh sách tài khoản");
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleOpenAddRental = () => {
    setIsAddRentalOpen(true);
    setSelectedAccountId(null);
    setSearchAccount(""); // Reset search
    fetchAvailableAccounts();
  };

  // Filter available accounts based on search
  const filteredAccounts = availableAccounts.filter(account => 
    account.adAccountIdNumber?.toLowerCase().includes(searchAccount.toLowerCase())
  );

  const handleAddRental = async () => {
    if (!selectedAccountId) {
      toast.error("Vui lòng chọn tài khoản");
      return;
    }
    
    setAdding(true);
    try {
      await customerAdsAccountApi.createCustomerAdsAccount({
        adAccountId: selectedAccountId,
        customerId: id
      });
      toast.success("Thêm tài khoản thuê thành công");
      setIsAddRentalOpen(false);
      fetchDetail(); // Refresh data
    } catch (error) {
    //   console.error("Add rental error:", error);
    //   console.log("Error type:", typeof error);
      // Handle different error formats
      let errorMessage = "Thêm thất bại";
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.description) {
        errorMessage = error.description;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        errorMessage = error.errors[0].description || error.errors[0].message || "Thêm thất bại";
      }
      
    //   console.log("Showing toast with message:", errorMessage);
      toast.error(errorMessage);
    //   console.log("Toast called");
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
      fetchDetail(); // Refresh data
    } catch (error) {
    //   console.error("Status update error:", error);
      let errorMessage = "Cập nhật thất bại";
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.description) {
        errorMessage = error.description;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        errorMessage = error.errors[0].description || error.errors[0].message || "Cập nhật thất bại";
      }
      
      toast.error(errorMessage);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [customerAdsAccountId]: false }));
    }
  };


  return (
    <>
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                <Dialog.Title className="text-xl font-semibold text-center mb-5 border-b pb-3">
                  Chi tiết khách hàng
                </Dialog.Title>

                {loading ? (
                  <ContentSkeleton />
                ) : data ? (
                  <>
                    <div className="flex flex-col gap-6">
                      {/* Section 1: Thông tin chung */}
                      <section>
                        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                           <span className="w-1 h-5 bg-blue-600 rounded-full block"></span>
                            Thông tin chung
                        </h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            <DetailField
                                label="Tên khách hàng"
                                value={data.name}
                            />
                            
                            <DetailField
                                label="Code Camp"
                                value={data.codeCamp}
                            />

                            {/* Optional fields if available */}
                            {data.phone && <DetailField label="Số điện thoại" value={data.phone} />}
                            {data.email && <DetailField label="Email" value={data.email} />}
                            {data.address && <DetailField label="Địa chỉ" value={data.address} className="col-span-2" />}
                        </div>
                      </section>
                      
                      {/* Section 2: Tài khoản quảng cáo thuê */}
                      <section>
                         <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                           <span className="w-1 h-5 bg-green-600 rounded-full block"></span>
                            Danh sách tài khoản thuê
                        </h3>

                        {/* Tabs and Add Button */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex space-x-1 rounded-xl bg-blue-900/10 p-1 w-fit">
                                <button
                                    onClick={() => setActiveTab("ACTIVE")}
                                    className={`w-40 rounded-lg py-2.5 text-sm font-medium leading-5 transition ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                                        ${activeTab === 'ACTIVE' 
                                            ? 'bg-white shadow text-blue-700' 
                                            : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-800'}`}
                                >
                                    Đang thuê ({activeAccounts.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab("HISTORY")}
                                    className={`w-40 rounded-lg py-2.5 text-sm font-medium leading-5 transition ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                                        ${activeTab === 'HISTORY' 
                                            ? 'bg-white shadow text-blue-700' 
                                            : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-800'}`}
                                >
                                    Lịch sử thuê ({allAccounts.length})
                                </button>
                            </div>
                            
                            <button
                                onClick={handleOpenAddRental}
                                className="flex items-center px-3 py-2 rounded-lg font-semibold text-sm transition bg-primary-dark text-white hover:bg-primary-darkest"
                            >
                                <Plus className="h-4 w-4 mr-1.5" />
                                Thêm tài khoản
                            </button>
                        </div>
                        
                        <div className="border rounded-lg overflow-hidden border-gray-200">
                             {displayAccounts.length > 0 ? (
                                 <div className="overflow-x-auto max-h-[400px]">
                                     <table className="min-w-full divide-y divide-gray-200">
                                         <thead className="bg-gray-50 sticky top-0 z-10">
                                             <tr>
                                                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Tài khoản</th>
                                                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Tài khoản</th>
                                                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày thuê</th>
                                                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tình trạng TK</th>
                                                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái thuê</th>
                                             </tr>
                                         </thead>
                                         <tbody className="bg-white divide-y divide-gray-200">
                                             {displayAccounts.map((acc) => (
                                                 <tr key={acc.id} className="hover:bg-gray-50">
                                                     <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{acc.adAccountIdNumber}</td>
                                                     <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={acc.adAccountName}>
                                                         {acc.adAccountName}
                                                     </td>
                                                     <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatDate(acc.rentalDate)}</td>
                                                     <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                          {/* statusAdsAccount: true (Locked/Die), false (Live/Normal) */}
                                                          {acc.statusAdsAccount ? (
                                                             <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Locked</span>
                                                          ) : (
                                                             <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Live</span>
                                                          )}
                                                     </td>
                                                     <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                          <select
                                                              value={acc.status || 'ACTIVE'}
                                                              onChange={(e) => handleStatusChange(acc.customerAdsAccountId, e.target.value)}
                                                              disabled={updatingStatus[acc.customerAdsAccountId]}
                                                              className="text-xs font-semibold rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                          >
                                                              <option value="ACTIVE">Active</option>
                                                              <option value="INACTIVE">Inactive</option>
                                                          </select>
                                                      </td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>
                             ) : (
                                 <div className="p-4 text-center text-sm text-gray-500">
                                     {activeTab === 'ACTIVE' 
                                        ? "Khách hàng không có tài khoản đang thuê." 
                                        : "Khách hàng chưa có lịch sử thuê tài khoản nào."
                                     }
                                 </div>
                             )}
                        </div>
                      </section>
                    </div>

                    <div className="mt-8 flex justify-end pt-4 border-t border-gray-100">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium text-sm"
                      >
                        Đóng
                      </button>
                    </div>
                  </>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        Không có dữ liệu
                    </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>

    {/* Add Rental Modal */}
    <Transition appear show={isAddRentalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setIsAddRentalOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title className="text-lg font-semibold mb-4 border-b pb-3">
                  Thêm tài khoản thuê
                </Dialog.Title>

                {loadingAccounts ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {/* Search Input */}
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="Tìm kiếm theo ID tài khoản..."
                        value={searchAccount}
                        onChange={(e) => setSearchAccount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      <div className="space-y-2">
                        {filteredAccounts.length === 0 ? (
                          <div className="text-center text-gray-500 py-4">
                            {searchAccount ? "Không tìm thấy tài khoản" : "Không có tài khoản nào"}
                          </div>
                        ) : (
                          filteredAccounts.map((account) => (
                            <label
                              key={account.id}
                              className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                                selectedAccountId === account.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="account"
                                value={account.id}
                                checked={selectedAccountId === account.id}
                                onChange={() => setSelectedAccountId(account.id)}
                                className="mr-3"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-sm text-gray-900">
                                  {account.adAccountIdNumber}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {account.adAccountName}
                                </div>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => setIsAddRentalOpen(false)}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition"
                    disabled={adding}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAddRental}
                    disabled={adding || !selectedAccountId}
                    className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {adding ? "Đang thêm..." : "Thêm"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
    </>
  );
};

export default DetailCustomerModal;
