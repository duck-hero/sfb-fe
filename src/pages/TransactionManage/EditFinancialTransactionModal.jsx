import { useState, useEffect, useRef } from "react";
import customerApi from "../../api/customerApi";
import customerGroupApi from "../../api/customerGroupApi";
import bmSourceApi from "../../api/bmSourceApi";
import bankAccountApi from "../../api/bankAccountApi";
import accountApi from "../../api/accountApi";

export default function EditFinancialTransactionModal({
  open,
  onClose,
  formData,
  onChange,
  onSave,
  loading,
}) {
  const [customers, setCustomers] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [objectType, setObjectType] = useState("KH");
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

  // Initialize objectType based on formData ONLY when modal opens
  useEffect(() => {
    if (open) {
      const accObj = formData.accountingObject || "";
      setSearchTerm(accObj);

      if (formData.paymentSource) {
        const sourceMap = {
          1: "KH",
          2: "NK",
          3: "NCC",
          4: "CP",
          5: "BANK",
          6: "NV"
        };
        setObjectType(sourceMap[formData.paymentSource] || null);
      } else if (["CP AGC", "Mua BM", "Mua TK"].includes(accObj)) {
        setObjectType("CP");
      } else {
        // No radio selected, show manual text input
        setObjectType(null); 
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Fetch data based on objectType and search term
  useEffect(() => {
    if (!open) return;
    if (!objectType || objectType === "CP") {
      setDataList([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        let res;
        switch (objectType) {
          case "KH":
            res = await customerApi.getCustomerList(1, 15, searchTerm);
            setDataList(res.data || []);
            break;
          case "NK":
            res = await customerGroupApi.getPagedList(1, 15);
            // Filter locally if API doesn't support search - keeping it simple
            const groups = (res.data || []).filter(g => 
              g.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setDataList(groups);
            break;
          case "NCC":
            res = await bmSourceApi.getBmSourceList(1, 15, searchTerm);
            setDataList(res.data || []);
            break;
          case "BANK":
            res = await bankAccountApi.getBankList(1, 15, searchTerm);
            setDataList(res.data || []);
            break;
          case "NV":
            res = await accountApi.getUserList(1, 50);
            const filtered = (res.items || res.data || []).filter(u => 
              u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
              u.userName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setDataList(filtered.slice(0, 15));
            break;
          default:
            setDataList([]);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, objectType, open]);

  const handleTypeChange = (type) => {
    // Toggle logic: if clicking the same type, revert to manual (null)
    const newType = objectType === type ? null : type;
    setObjectType(newType);
    setSearchTerm("");
    setShowDropdown(false);
    
    // Payment source mapping: 1:KH, 2:NK, 3:NCC, 4:CP, 5:BANK, 6:NV
    const sourceMap = {
      "KH": 1,
      "NK": 2,
      "NCC": 3,
      "CP": 4,
      "BANK": 5,
      "NV": 6
    };
    
    const pSource = sourceMap[newType] || null;
    onChange("paymentSource", pSource);
    
    if (newType !== "KH" && newType !== "NK") {
      onChange("customerId", null);
      onChange("customerGroupId", null);
      if (!newType) {
         // Revert search term to current object name if going to manual
         setSearchTerm(formData.accountingObject || "");
      }
    }
    
    // Only reset accountingObject if we are switching to a searchable type
    if (newType && !["KH", "NK", "CP", "NCC", "BANK", "NV"].includes(objectType)) {
       // logic improvement: clear if we are entering a Searchable type 
    }
    
    if (newType) {
       onChange("accountingObject", "");
    }
  };

  const handleSelectItem = (item) => {
    let name = "";
    let id = null;
    let groupId = null;

    switch (objectType) {
      case "KH":
        name = item.fullCustomerCode;
        id = item.id;
        break;
      case "NK":
        name = item.name;
        groupId = item.id;
        break;
      case "NCC":
        name = item.sourceName;
        break;
      case "BANK":
        name = item.code;
        break;
      case "NV":
        name = item.code;
        break;
      case "CP":
        name = item;
        break;
    }

    onChange("accountingObject", name);
    if (objectType === "KH") {
      onChange("customerId", id);
      onChange("customerGroupId", null);
    } else if (objectType === "NK") {
      onChange("customerGroupId", groupId);
      onChange("customerId", null);
    } else {
      onChange("customerId", null);
      onChange("customerGroupId", null);
    }
    setSearchTerm(name);
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
              {/* Radio Buttons group */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Loại đối tượng
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "KH", label: "Khách hàng" },
                    { id: "NK", label: "Nhóm khách" },
                    { id: "NCC", label: "NCC" },
                    { id: "CP", label: "Chi phí" },
                    { id: "BANK", label: "Bank nội bộ" },
                    { id: "NV", label: "Nhân viên" },
                  ].map((type) => (
                    <label key={type.id} className="flex items-center gap-2 p-2 border border-gray-100 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="objectType"
                        checked={objectType === type.id}
                        onChange={() => handleTypeChange(type.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-xs font-medium text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dynamic Input / Selection */}
              {!objectType ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đối tượng hạch toán
                  </label>
                  <input
                    type="text"
                    value={formData.accountingObject || ""}
                    onChange={(e) => onChange("accountingObject", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Nhập đối tượng hạch toán..."
                  />
                </div>
              ) : objectType === "CP" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chọn khoản chi phí
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.accountingObject || ""}
                    onChange={(e) => handleSelectItem(e.target.value)}
                  >
                    <option value="">-- Chọn chi phí --</option>
                    <option value="CP AGC">CP AGC</option>
                    <option value="Mua BM">Mua BM</option>
                    <option value="Mua TK">Mua TK</option>
                  </select>
                </div>
              ) : (
                // Searchable Dropdown for KH, NCC, BANK, NV
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {objectType === "KH" ? "Tìm khách hàng" : 
                     objectType === "NK" ? "Tìm nhóm khách" : 
                     objectType === "NCC" ? "Tìm NCC" : 
                     objectType === "BANK" ? "Tìm Bank" : "Tìm nhân viên"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                      placeholder={`Tìm kiếm ${objectType === "KH" ? "khách" : objectType === "NK" ? "nhóm khách" : objectType}...`}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-2.5">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                      </div>
                    )}
                  </div>

                  {showDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white shadow-xl border border-gray-100 max-h-60 rounded-lg py-1 text-sm overflow-auto ring-1 ring-black ring-opacity-5">
                      {dataList.length > 0 ? (
                        dataList.map((item, idx) => (
                          <div
                            key={idx}
                            className={`px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 ${
                              (objectType === "KH" && formData.customerId === item.id) || 
                              (objectType !== "KH" && formData.accountingObject === (item.sourceName || item.accountBankNumber || item.fullName || item.userName)) 
                              ? "bg-blue-50 font-bold text-blue-700" : "text-gray-700"
                            }`}
                            onClick={() => handleSelectItem(item)}
                          >
                            {objectType === "KH" && (
                              <div className="flex flex-col">
                                <span className="font-bold">{item.customerCode}</span>
                                <span className="text-[10px] text-gray-400">{item.fullCustomerCode} - {item.name}</span>
                              </div>
                            )}
                            {objectType === "NK" && <span>{item.name}</span>}
                            {objectType === "NCC" && <span>{item.sourceName}</span>}
                            {objectType === "BANK" && (
                              <div className="flex flex-col">
                                <span className="font-bold">{item.code || "---"}</span>
                                <span className="text-[10px] text-gray-400">{item.accountBankNumber} - {item.accountBankHolderName}</span>
                              </div>
                            )}
                            {objectType === "NV" && (
                                <div className="flex flex-col">
                                    <span className="font-bold">{item.code}</span>
                                    <span className="text-[10px] text-gray-400">{item.name} - {item.userName}</span>
                                </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-400 italic text-center">Không tìm thấy dữ liệu</div>
                      )}
                    </div>
                  )}
                  {formData.customerId && objectType === "KH" && (
                      <div className="mt-1 text-[10px] text-green-600 font-medium">Selected ID: {formData.customerId}</div>
                  )}
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