import React, { useState, useEffect } from "react";
import { X, Loader2, Save, Users, User, DollarSign, Calculator, Plus, Trash2 } from "lucide-react";
import adsAccountApi from "../../api/adsAccountApi";
import accountApi from "../../api/accountApi";
import { toast } from "react-toastify";

const RecordThresholdEatingModal = ({ open, onClose, adAccount, onSuccess, existingRecord }) => {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [users, setUsers] = useState([]);
  const [historicalCustomers, setHistoricalCustomers] = useState([]);

  const [formData, setFormData] = useState({
    adAccountId: 0,
    totalAmount: 0,
    sourceAmount: 0,
    operatorAmount: 0,
    operatorUserId: "",
    customerShares: []
  });

  useEffect(() => {
    if (open) {
      if (existingRecord) {
        setFormData({
          id: existingRecord.id, // Record ID for PUT
          adAccountId: existingRecord.adAccountId,
          totalAmount: existingRecord.totalAmount || 0,
          sourceAmount: existingRecord.sourceAmount || 0,
          operatorAmount: existingRecord.operatorAmount || 0,
          operatorUserId: existingRecord.operatorUserId || "",
          customerShares: existingRecord.customerShares?.map(s => ({
            customerId: s.customerId,
            amount: s.amount
          })) || []
        });
        fetchInitialData(existingRecord.adAccountId);
      } else if (adAccount) {
        setFormData({
          id: 0,
          adAccountId: adAccount.id,
          totalAmount: 0,
          sourceAmount: 0,
          operatorAmount: 0,
          operatorUserId: "",
          customerShares: []
        });
        fetchInitialData(adAccount.id);
      }
    }
  }, [open, adAccount, existingRecord]);

  const fetchInitialData = async (accId) => {
    setFetchingData(true);
    try {
      const [usersRes, customersRes] = await Promise.all([
        accountApi.getUserList(1, 1000),
        adsAccountApi.getHistoricalCustomers(accId)
      ]);
      setUsers(usersRes?.data || []);
      setHistoricalCustomers(customersRes?.data || []);
    } catch (error) {
      console.error("Error fetching modal data:", error);
      toast.error("Không thể tải danh sách nhân viên hoặc khách hàng");
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "operatorUserId" ? value : Number(value)
    }));
  };

  const handleAddCustomerShare = () => {
    setFormData(prev => ({
      ...prev,
      customerShares: [...prev.customerShares, { customerId: "", amount: 0 }]
    }));
  };

  const handleRemoveCustomerShare = (index) => {
    setFormData(prev => ({
      ...prev,
      customerShares: prev.customerShares.filter((_, i) => i !== index)
    }));
  };

  const handleCustomerShareChange = (index, field, value) => {
    const updatedShares = [...formData.customerShares];
    updatedShares[index] = {
      ...updatedShares[index],
      [field]: field === "customerId" ? Number(value) : Number(value)
    };
    setFormData(prev => ({ ...prev, customerShares: updatedShares }));
  };

  const calculateAgcShare = () => {
    const { totalAmount, sourceAmount, operatorAmount, customerShares } = formData;
    const totalCustomerShares = customerShares.reduce((sum, item) => sum + (item.amount || 0), 0);
    return totalAmount - sourceAmount - operatorAmount - totalCustomerShares;
  };

  const handleSave = async () => {
    if (formData.totalAmount <= 0) {
      toast.warning("Vui lòng nhập tổng tiền ngưỡng");
      return;
    }
    if (!formData.operatorUserId) {
      toast.warning("Vui lòng chọn nhân viên vận hành");
      return;
    }

    setLoading(true);
    try {
      let response;
      if (formData.id > 0) {
        // Edit mode (PUT)
        response = await adsAccountApi.updateThresholdStats(formData);
      } else {
        // Create mode (POST)
        response = await adsAccountApi.recordThresholdEating(formData);
      }

      if (response.success) {
        toast.success(formData.id > 0 ? "Cập nhật thành công" : "Ghi nhận cắn ngưỡng thành công");
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || "Thao tác thất bại");
      }
    } catch (error) {
      console.error("Error saving threshold eating:", error);
      toast.error(typeof error === "string" ? error : "Đã xảy ra lỗi khi lưu");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const agcShare = calculateAgcShare();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-primary-darkest text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-none">
                {formData.id > 0 ? "Chỉnh sửa ngưỡng" : "Ghi nhận ngưỡng"}
              </h2>
              <p className="text-xs text-white/70 mt-1">
                TK: {adAccount?.adAccountName || existingRecord?.adAccountName} ({adAccount?.adAccountIdNumber || existingRecord?.adAccountIdNumber})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {fetchingData ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary-darkest" />
            <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
            {/* Total Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Tổng tiền ngưỡng được
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount || ""}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-dark focus:border-transparent outline-none transition-all font-bold text-lg text-primary-darkest"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Nhân viên vận hành
                </label>
                <select
                  name="operatorUserId"
                  value={formData.operatorUserId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-dark focus:border-transparent outline-none transition-all"
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.fullName || user.userName}</option>
                  ))}
                </select>
              </div>
            </div>

            {formData.id > 0 && (
              <>
                {/* Shares Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Chia cho Đầu tổng (Source)</label>
                    <input
                      type="number"
                      name="sourceAmount"
                      value={formData.sourceAmount || ""}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-dark focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Thưởng cho nhân viên</label>
                    <input
                      type="number"
                      name="operatorAmount"
                      value={formData.operatorAmount || ""}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-dark focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Customers Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      Chia cho khách hàng
                    </label>
                    <button
                      type="button"
                      onClick={handleAddCustomerShare}
                      className="text-xs font-bold text-primary-dark hover:text-primary-darkest flex items-center gap-1 transition-colors px-2 py-1 bg-primary-100 rounded-lg"
                    >
                      <Plus className="w-3 h-3" /> Thêm khách hàng
                    </button>
                  </div>

                  {formData.customerShares.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-gray-100 rounded-2xl text-center">
                      <p className="text-sm text-gray-400 italic">Chưa có khách hàng được chọn</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.customerShares.map((share, index) => (
                        <div key={index} className="flex gap-2 items-end bg-gray-50 p-3 rounded-xl border border-gray-100 group">
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Khách hàng</label>
                            <select
                              value={share.customerId}
                              onChange={(e) => handleCustomerShareChange(index, "customerId", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-dark"
                            >
                              <option value="">-- Chọn khách --</option>
                              {historicalCustomers.map(c => (
                                <option key={c.customerId} value={c.customerId}>{c.fullCustomerCode || c.customerName}</option>
                              ))}
                            </select>
                          </div>
                          <div className="w-32 space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Số tiền</label>
                            <input
                              type="number"
                              value={share.amount || ""}
                              onChange={(e) => handleCustomerShareChange(index, "amount", e.target.value)}
                              placeholder="Amount"
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-dark"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomerShare(index)}
                            className="p-2 text-gray-400 hover:text-error transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary / Result */}
                <div className="bg-primary-50 p-4 rounded-2xl border border-primary-100 flex justify-between items-center mt-4">
                  <div>
                    <p className="text-xs font-bold text-primary-dark uppercase tracking-wider">AGC sẽ nhận</p>
                    <p className="text-2xl font-black text-primary-darkest">
                      {agcShare.toLocaleString("vi-VN")} <span className="text-sm font-normal">đ</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium px-2 py-1 rounded-full ${agcShare < 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {agcShare < 0 ? 'Vượt quá tổng thu' : 'Hợp lệ'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            disabled={loading || fetchingData}
            className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-primary-darkest hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-primary-darkest/20 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu ghi nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordThresholdEatingModal;
