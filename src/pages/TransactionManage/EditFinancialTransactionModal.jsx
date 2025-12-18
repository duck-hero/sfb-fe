import { useState, useEffect, useRef } from "react";
import customerApi from "../../api/customerApi";

export default function EditFinancialTransactionModal({
  open,
  onClose,
  formData,
  onChange,
  onSave,
  loading,
}) {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch customers when search term changes
  useEffect(() => {
    if (!formData.isCustomerPay) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await customerApi.getCustomerList(1, 20, searchTerm);
        setCustomers(res.data || []);
      } catch (error) {
        console.error("Failed to fetch customers", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, formData.isCustomerPay]);

  // Handle form field changes
  const handleFormChange = (field, value) => {
    onChange(field, value);
    if (field === 'isCustomerPay' && !value) {
       // Reset customer if unchecked (optional, or keep generic logic)
       onChange('customerId', null);
    }
  };

  const handleSelectCustomer = (customer) => {
    onChange('customerId', customer.id);
    setSearchTerm(customer.name); // Display selected name
    setShowDropdown(false);
  };
  
  // Set initial search term if customerId exists and we have the customer loaded? 
  // Or just show placeholder. Ideally we'd need the customer Name if we only have ID.
  // For now, let's assume if we edit, we might want to fetch that specific customer or just let user search again.
  // Simplification: We won't pre-fetch the name for existing customerId unless we look it up.
  // Keep it simple: if customerId is set, show "Đã chọn khách hàng (ID: ...)" or just let them search.

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Chỉnh sửa giao dịch</h3>

            <div className="space-y-4">
              {/* Checkbox Của khách */}
              <div className="flex items-center">
                <input
                  id="isCustomerPay"
                  type="checkbox"
                  checked={formData.isCustomerPay || false}
                  onChange={(e) => handleFormChange("isCustomerPay", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isCustomerPay" className="ml-2 block text-sm text-gray-900">
                  Của khách ({formData.isCustomerPay ? "True" : "False"})
                </label>
              </div>

              {formData.isCustomerPay ? (
                // Customer Selection Mode
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chọn khách hàng
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tìm kiếm khách hàng theo tên..."
                  />
                  
                  {/* Selected Info Helper */}
                  {formData.customerId && (
                     <div className="text-xs text-green-600 mt-1">
                        Khách hàng đã chọn (ID: {formData.customerId})
                     </div>
                  )}

                  {/* Dropdown Results */}
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {isSearching ? (
                        <div className="px-4 py-2 text-gray-500 text-sm">Đang tìm...</div>
                      ) : customers.length > 0 ? (
                        customers.map((customer) => (
                          <div
                            key={customer.id}
                            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-100 ${
                              formData.customerId === customer.id ? 'bg-blue-50 font-semibold text-blue-900' : 'text-gray-900'
                            }`}
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <span className="block truncate">
                              {customer.name} - {customer.customerCode || "No Code"}
                            </span>
                          </div>
                        ))
                      ) : (
                         <div className="px-4 py-2 text-gray-500 text-sm">Không tìm thấy khách hàng.</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Accounting Object Input Mode
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đối tượng hạch toán
                  </label>
                  <input
                    type="text"
                    value={formData.accountingObject || ""}
                    onChange={(e) => handleFormChange("accountingObject", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập đối tượng hạch toán..."
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={onSave}
                disabled={loading}
                className={`px-4 py-2 text-sm rounded-md ${
                  loading
                    ? 'bg-blue-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}