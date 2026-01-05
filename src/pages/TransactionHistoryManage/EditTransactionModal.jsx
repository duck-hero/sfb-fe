import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect, useRef } from "react";
import customerApi from "../../api/customerApi";
import customerGroupApi from "../../api/customerGroupApi";
import bmSourceApi from "../../api/bmSourceApi";
import bankAccountApi from "../../api/bankAccountApi";
import accountApi from "../../api/accountApi";
import { X, Search, ChevronDown, Check, Edit2, Clock } from "lucide-react";

// Spinner
const TailwindSpinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-white border-r-white border-b-white border-l-blue-200"></div>
  </div>
);

// Skeleton Content
const ContentSkeleton = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="h-10 bg-gray-200 rounded-xl"></div>
    <div className="h-10 bg-gray-200 rounded-xl"></div>
    <div className="h-20 bg-gray-200 rounded-xl"></div>
    <div className="h-10 bg-gray-200 rounded-xl"></div>
  </div>
);

export default function EditTransactionModal({
  open,
  loading,
  saving,
  formData,
  onChange,
  onClose,
  onSave,
  bankList = [],
  adsAccountList = [], // Pass suggestions or basic list if available
  bankAccountList = [], 
}) {
  const isContentReady = !loading;

  const [dataList, setDataList] = useState([]);
  const [objectType, setObjectType] = useState(null);
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
        setObjectType(null);
      }
    } else {
      setObjectType(null);
      setSearchTerm("");
      setDataList([]);
    }
  }, [open, formData.accountingObject, formData.paymentSource]);

  // Fetch data based on objectType and search term
  useEffect(() => {
    if (!open || !objectType || objectType === "CP") {
      setDataList([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        let res;
        switch (objectType) {
          case "KH":
            res = await customerApi.getCustomerList(1, 15, searchTerm || null, null, null, true);
            setDataList(res.data || []);
            break;
          case "NK":
            res = await customerGroupApi.getPagedList(1, 15);
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
            const items = res.items || res.data || [];
            const filtered = items.filter(u =>
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

  const setFieldValue = (name, value) => {
    onChange({ target: { name, value } });
  };

  const handleTypeChange = (type) => {
    const newType = objectType === type ? null : type;
    setObjectType(newType);
    setSearchTerm("");
    setShowDropdown(false);

    const sourceMap = {
      "KH": 1, "NK": 2, "NCC": 3, "CP": 4, "BANK": 5, "NV": 6
    };
    setFieldValue("paymentSource", sourceMap[newType] || null);

    // Clear related fields if needed
    if (newType !== "KH" && newType !== "NK") {
      setFieldValue("customerId", null);
      setFieldValue("customerGroupId", null);
    }
    setFieldValue("accountingObject", "");
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

    setFieldValue("accountingObject", name);
    if (objectType === "KH") {
      setFieldValue("customerId", id);
      setFieldValue("customerGroupId", null);
    } else if (objectType === "NK") {
      setFieldValue("customerGroupId", groupId);
      setFieldValue("customerId", null);
    } else {
      setFieldValue("customerId", null);
      setFieldValue("customerGroupId", null);
    }
    setSearchTerm(name);
    setShowDropdown(false);
  };

  return (
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left shadow-xl transition-all">
                <Dialog.Title className="text-2xl font-semibold text-center mb-5">
                  Cập nhật Giao dịch
                </Dialog.Title>

                {isContentReady ? (
                  <div className="space-y-4">
                    {/* FB Transaction Code */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Mã giao dịch FB
                      </label>
                      <input
                        type="text"
                        name="fbTransactionCode"
                        value={formData.fbTransactionCode || ""}
                        onChange={onChange}
                        disabled={saving}
                        className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    {/* FB Account ID */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        FB Account ID
                      </label>
                      <input
                        type="text"
                        name="fbAccountId"
                        value={formData.fbAccountId || ""}
                        onChange={onChange}
                        disabled={saving}
                        className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    {/* Amount FB */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Số tiền FB (AmountFb)
                      </label>
                      <input
                        type="number"
                        name="amountFb"
                        value={formData.amountFb || ""}
                        onChange={onChange}
                        disabled={saving}
                        className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    
                    {/* Card Last Digits */}
                    <div>
                         <label className="block text-sm font-medium mb-1">
                           Đuôi thẻ (Card last digits)
                         </label>
                         <input
                            type="text"
                            name="cardLastDigits"
                            placeholder="4 số cuối..."
                            value={formData.cardLastDigits || ""}
                            onChange={onChange}
                             disabled={saving}
                             className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                         />
                    </div>

                    {/* Accounting Object Selection */}
                    <div className="pt-2 border-t">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Loại đối tượng hạch toán
                      </label>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {[
                          { id: "KH", label: "Khách hàng" },
                          { id: "NK", label: "Nhóm khách" },
                          { id: "NCC", label: "NCC" },
                          { id: "CP", label: "Chi phí" },
                          { id: "BANK", label: "Bank nội bộ" },
                          { id: "NV", label: "Nhân viên" },
                        ].map((type) => (
                          <label key={type.id} className={`flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${objectType === type.id ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'}`}>
                            <input
                              type="radio"
                              name="objectType"
                              checked={objectType === type.id}
                              onChange={() => handleTypeChange(type.id)}
                              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-xs font-semibold text-gray-700">{type.label}</span>
                          </label>
                        ))}
                      </div>

                      {/* Dynamic Selection Input */}
                      {objectType === "CP" ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chọn khoản chi phí
                          </label>
                          <select
                            className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.accountingObject || ""}
                            onChange={(e) => handleSelectItem(e.target.value)}
                          >
                            <option value="">-- Chọn chi phí --</option>
                            <option value="CP AGC">CP AGC</option>
                            <option value="Mua BM">Mua BM</option>
                            <option value="Mua TK">Mua TK</option>
                          </select>
                        </div>
                      ) : objectType && (
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
                              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder={`Tìm kiếm ${objectType === "KH" ? "khách" : objectType === "NK" ? "nhóm khách" : objectType}...`}
                              value={searchTerm}
                              onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowDropdown(true);
                              }}
                              onFocus={() => setShowDropdown(true)}
                              disabled={saving}
                            />
                            {isSearching ? (
                              <div className="absolute right-3 top-2.5">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                              </div>
                            ) : (
                              <div className="absolute right-3 top-2.5 text-gray-400">
                                <Search size={16} />
                              </div>
                            )}
                          </div>

                          {showDropdown && (
                            <div className="absolute z-[70] w-full mt-1 bg-white shadow-2xl border border-gray-100 max-h-60 rounded-xl py-1 text-sm overflow-auto ring-1 ring-black/5">
                              {dataList.length > 0 ? (
                                dataList.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className={`px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 ${(objectType === "KH" && formData.customerId === item.id) ||
                                      (objectType !== "KH" && formData.accountingObject === (item.sourceName || item.code || item.fullName || item.userName))
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
                                        <span className="text-[10px] text-gray-400">{item.fullName || item.userName}</span>
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-6 text-gray-400 italic text-center">Không tìm thấy dữ liệu</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {!objectType && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Đối tượng hạch toán
                          </label>
                          <input
                            type="text"
                            name="accountingObject"
                            placeholder="Vui lòng chọn loại đối tượng..."
                            readOnly
                            value={formData.accountingObject || ""}
                            className="w-full h-10 border border-gray-100 bg-gray-50 rounded-lg px-3 text-sm text-gray-400 cursor-not-allowed outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="mt-8 flex justify-end gap-3">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                        disabled={saving}
                      >
                        Hủy
                      </button>

                      <button
                        onClick={onSave}
                        disabled={saving}
                        className={`px-6 py-2 rounded-xl font-semibold transition flex justify-center items-center text-white ${
                          saving
                            ? "bg-blue-800 opacity-50 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {saving ? (
                          <>
                            <TailwindSpinner />
                            <span className="ml-2 text-sm">Đang lưu...</span>
                          </>
                        ) : (
                          "Cập nhật"
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <ContentSkeleton />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
