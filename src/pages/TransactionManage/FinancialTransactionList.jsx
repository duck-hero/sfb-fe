import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { toast } from "react-toastify";
import { SquarePen, X } from "lucide-react";

import bankAccountApi from "../../api/bankAccountApi";
import financialTransactionApi from "../../api/financialTransactionApi";
import customerApi from "../../api/customerApi";
import customerGroupApi from "../../api/customerGroupApi";
import bmSourceApi from "../../api/bmSourceApi";
import accountApi from "../../api/accountApi";
import collaboratorApi from "../../api/collaboratorApi";

import DateRangePicker from "../../components/DateFilter/DateRangePicker";
import DateCell from "../../components/DateFilter/DateCell";
import EditFinancialTransactionModal from "./EditFinancialTransactionModal";

dayjs.extend(utc);
dayjs.locale("vi");

export default function FinancialTransactionList({ bankAccountType = 2 }) {
  const [transactions, setTransactions] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Scan modal state
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: 0,
    accountingObject: "",
    description: "",
    customerId: null,
    customerGroupId: null,
    paymentSource: null,
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [editLoading, setEditLoading] = useState(false);

  const [filters, setFilters] = useState({
    searchTerm: "",
    transactionType: "",
    bankAccountId: "",
    fromEffectiveDate: dayjs().startOf("day").toISOString(),
    toEffectiveDate: dayjs().endOf("day").toISOString(),
    amount: "",
    accountingObject: "",
  });

  // Search logic states for filters
  const [objectType, setObjectType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataList, setDataList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [localAmount, setLocalAmount] = useState("");
  const dropdownRef = useRef(null);

  // Amount debounce effect
  useEffect(() => {
    if (localAmount === filters.amount) return;
    const timer = setTimeout(() => {
      handleFilterChange("amount", localAmount);
    }, 500);
    return () => clearTimeout(timer);
  }, [localAmount]);

  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchTransactions(true);
        }
      });

      if (node) observer.current.observe(node);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, hasMore, nextCursor, filters, bankAccountType]
  );

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const res = await bankAccountApi.getBankList(
          1,
          999,
          undefined,
          undefined,
          undefined,
          bankAccountType
        );
        setBankList(res?.data || res?.items || []);
      } catch (err) {
        toast.error(typeof err === "string" ? err : "Không thể lấy danh sách tài khoản ngân hàng");
      }
    };
    fetchBankAccounts();
  }, [bankAccountType]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search effect for filter dropdown
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!objectType) {
        setDataList([]);
        return;
      }

      const fetchData = async () => {
        try {
          let res;
          switch (objectType) {
            case "KH":
              res = await customerApi.getCustomerList(1, 15, searchTerm || null, null, null);
              setDataList(res.data || []);
              break;
            case "NK":
              res = await customerGroupApi.getPagedList(1, 15);
              let itemsNK = res.data || [];
              if (searchTerm) {
                itemsNK = itemsNK.filter(g =>
                  g.name?.toLowerCase().includes(searchTerm.toLowerCase())
                );
              }
              setDataList(itemsNK);
              break;
            case "NCC":
              res = await bmSourceApi.getBmSourceList(1, 15, searchTerm || null);
              setDataList(res.data || []);
              break;
            case "BANK":
              res = await bankAccountApi.getBankList(1, 15, searchTerm || null);
              setDataList(res.data || []);
              break;
            case "NV":
              res = await accountApi.getUserList(1, 50);
              const itemsNV = res.items || res.data || [];
              let filteredNV = itemsNV;
              if (searchTerm) {
                filteredNV = itemsNV.filter(u =>
                  u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  u.userName?.toLowerCase().includes(searchTerm.toLowerCase())
                );
              }
              setDataList(filteredNV.slice(0, 15));
              break;
            case "CTV":
              res = await collaboratorApi.getPagedList(1, 15);
              let itemsCTV = res.data || [];
              if (searchTerm) {
                itemsCTV = itemsCTV.filter(c =>
                  c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.name?.toLowerCase().includes(searchTerm.toLowerCase())
                );
              }
              setDataList(itemsCTV);
              break;
          }
        } catch (error) {
          console.error("Search failed:", error);
        }
      };

      fetchData();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, objectType]);

  const handleSelectItem = (item) => {
    let name = "";
    switch (objectType) {
      case "KH": name = item.fullCustomerCode; break;
      case "NK": name = item.name; break;
      case "NCC": name = item.sourceName; break;
      case "BANK": name = item.code; break;
      case "NV": name = item.code; break;
      case "CTV": name = item.code; break;
      case "CP": name = item; break;
    }
    setSearchTerm(name);
    handleFilterChange("accountingObject", name);
    setShowDropdown(false);
  };

  const fetchTransactions = async (isLoadMore = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const cursorToUse = isLoadMore ? nextCursor : undefined;

      const res = await financialTransactionApi.getFinancialTransactionByCursor(
        cursorToUse,
        20,
        "desc",
        filters.fromEffectiveDate,
        filters.toEffectiveDate,
        filters.searchTerm || undefined,
        filters.transactionType || undefined,
        filters.bankAccountId || undefined,
        bankAccountType,
        filters.amount || undefined,
        filters.accountingObject || undefined
      );

      if (res && res.success) {
        setTransactions((prev) =>
          isLoadMore ? [...prev, ...(res.data || [])] : res.data || []
        );
        setNextCursor(res.pageInfo?.nextCursor ?? null);
        setHasMore(Boolean(res.pageInfo?.hasNextPage));
      }
    } catch (err) {
      setError("Không thể tải giao dịch.");
      toast.error(typeof err === "string" ? err : "Không thể tải giao dịch.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setNextCursor(null);
    setHasMore(true);
    setSelectedIds([]); // Clear selection when filters change
    fetchTransactions(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, bankAccountType]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      if (prev[field] === value) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleDateRangeChange = ({ startDate, endDate }) => {
    setFilters((prev) => ({
      ...prev,
      fromEffectiveDate: startDate,
      toEffectiveDate: endDate,
    }));
  };

  const handleScanTransaction = () => {
    if (!selectedAccount) return;

    const fromDate = dayjs(filters.fromEffectiveDate).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const toDate = dayjs(filters.toEffectiveDate).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';

    const url = `https://875ccbb5.automationacb.pages.dev/trigger?token=999999999&stk=${selectedAccount.accountBankNumber}&fromDate=${fromDate}&toDate=${toDate}&LoginUsername=${selectedAccount.loginUsername}&LoginPassword=${selectedAccount.loginPassword}&bank=${selectedAccount.bankCode.toLowerCase()}`;

    window.open(url, '_blank');
    setScanModalOpen(false);
    setSelectedAccount(null);
  };

  const handleOpenEditModal = (transactionOrIds) => {
    if (Array.isArray(transactionOrIds)) {
      setEditFormData({
        id: 0, // Not used for bulk
        ids: transactionOrIds,
        accountingObject: "",
        description: "",
        customerId: null,
        customerGroupId: null,
        paymentSource: null,
      });
    } else {
      setEditFormData({
        id: transactionOrIds.id,
        ids: [transactionOrIds.id],
        accountingObject: transactionOrIds.accountingObject || "",
        description: transactionOrIds.description || "",
        customerId: transactionOrIds.customerId || null,
        customerGroupId: transactionOrIds.customerGroupId || null,
        paymentSource: transactionOrIds.paymentSource || null,
      });
    }
    setEditModalOpen(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = async () => {
    setEditLoading(true);
    try {
      await financialTransactionApi.updateFinancialTransaction(
        editFormData.ids,
        {
          accountingObject: editFormData.accountingObject,
          paymentSource: editFormData.paymentSource,
          customerId: editFormData.customerId,
          customerGroupId: editFormData.customerGroupId,
        }
      );
      toast.success("Cập nhật giao dịch thành công!");
      setEditModalOpen(false);
      setSelectedIds([]); // Clear selection after update

      // Refresh data
      fetchTransactions(false);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Không thể cập nhật giao dịch");
    } finally {
      setEditLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const blob = await financialTransactionApi.exportExcel(
        undefined,
        filters.fromEffectiveDate,
        filters.toEffectiveDate,
        filters.searchTerm || undefined,
        filters.transactionType || undefined,
        filters.bankAccountId || undefined,
        bankAccountType,
        filters.amount || undefined,
        filters.accountingObject || undefined
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with timestamp
      const timestamp = dayjs().format('YYYYMMDD_HHmmss');
      const prefix = bankAccountType === 3 ? "LoiNhuan" : "ThuChi";
      link.download = `GiaoDich${prefix}_${timestamp}.xlsx`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Xuất file Excel thành công!");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Không thể xuất file Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isDateRangeTooLarge = useMemo(() => {
    const fromDate = dayjs(filters.fromEffectiveDate);
    const toDate = dayjs(filters.toEffectiveDate);
    return toDate.diff(fromDate, "day") > 31; // nới rộng cho thu/chi
  }, [filters.fromEffectiveDate, filters.toEffectiveDate]);

  const isDateRangeTooLargeForScan = useMemo(() => {
    const fromDate = dayjs(filters.fromEffectiveDate);
    const toDate = dayjs(filters.toEffectiveDate);
    const diffInDays = toDate.diff(fromDate, 'day');
    return diffInDays > 3;
  }, [filters.fromEffectiveDate, filters.toEffectiveDate]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-lg font-bold mb-3">
        {bankAccountType === 3
          ? "Giao dịch tài khoản lợi nhuận"
          : "Giao dịch thu chi"}
      </h1>

      {/* Date filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Thời gian:
          </label>
          <DateRangePicker onChange={handleDateRangeChange} />
          <button
            type="button"
            onClick={() => setScanModalOpen(true)}
            disabled={isDateRangeTooLargeForScan}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${isDateRangeTooLargeForScan
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            title={isDateRangeTooLargeForScan ? 'Khoảng thời gian không được vượt quá 3 ngày' : ''}
          >
            Quét giao dịch
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${isExporting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xuất...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Xuất Excel
              </>
            )}
          </button>
          {isDateRangeTooLarge && (
            <span className="text-xs text-amber-600">
              Khoảng thời gian lớn có thể tải chậm
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Mã GD hoặc nội dung..."
              className="w-full border-gray-300 rounded-md shadow-sm border px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại giao dịch
            </label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm border px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={filters.transactionType}
              onChange={(e) => handleFilterChange("transactionType", e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="IN">Tiền vào (IN)</option>
              <option value="OUT">Tiền ra (OUT)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tài khoản ngân hàng
            </label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm border px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={filters.bankAccountId}
              onChange={(e) => handleFilterChange("bankAccountId", e.target.value)}
            >
              <option value="">Tất cả tài khoản</option>
              {bankList.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.accountBankNumber || bank.accountNumber} - {bank.accountBankHolderName || 'Unknown'} - {bank.bankCode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số tiền
            </label>
            <input
              type="number"
              placeholder="Nhập số tiền..."
              className="w-full border-gray-300 rounded-md shadow-sm border px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={localAmount}
              onChange={(e) => setLocalAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại hạch toán
            </label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm border px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={objectType || ""}
              onChange={(e) => {
                const type = e.target.value || null;
                setObjectType(type);
                setSearchTerm("");
                if (!type) handleFilterChange("accountingObject", "");
              }}
            >
              <option value="">Tất cả</option>
              <option value="KH">Khách hàng</option>
              <option value="NK">Nhóm khách</option>
              <option value="NCC">NCC</option>
              <option value="CP">Chi phí</option>
              <option value="BANK">Bank nội bộ</option>
              <option value="NV">Nhân viên</option>
              <option value="CTV">CTV</option>
            </select>
          </div>

          {objectType && (
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm {objectType === "CTV" ? "CTV" : objectType}
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                  placeholder={`Tìm kiếm...`}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      handleFilterChange("accountingObject", "");
                      setShowDropdown(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Dropdown Results */}
              {showDropdown && objectType === "CP" && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {["CP AGC", "Mua BM", "Mua TK"].map(item => (
                    <div
                      key={item}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium"
                      onClick={() => handleSelectItem(item)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}

              {showDropdown && objectType !== "CP" && dataList.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {dataList.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none"
                      onClick={() => handleSelectItem(item)}
                    >
                      <div className="flex flex-col">
                        {objectType === "KH" && (
                          <>
                            <span className="text-xs font-bold text-gray-900">{item.customerCode}</span>
                            <span className="text-[10px] text-gray-500">{item.fullCustomerCode} - {item.name}</span>
                          </>
                        )}
                        {objectType === "NK" && <span className="text-xs font-bold">{item.name}</span>}
                        {objectType === "NCC" && <span className="text-xs font-bold">{item.sourceName}</span>}
                        {objectType === "BANK" && (
                          <>
                            <span className="text-xs font-bold">{item.code}</span>
                            <span className="text-[10px] text-gray-500">{item.accountBankNumber} - {item.accountBankHolderName}</span>
                          </>
                        )}
                        {objectType === "NV" && (
                          <>
                            <span className="text-xs font-bold">{item.code}</span>
                            <span className="text-[10px] text-gray-500">{item.userName} - {item.fullName}</span>
                          </>
                        )}
                        {objectType === "CTV" && (
                          <>
                            <span className="text-xs font-bold">{item.code}</span>
                            <span className="text-[10px] text-gray-500">{item.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!objectType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đối tượng hạch toán
              </label>
              <input
                type="text"
                placeholder="Nhập thủ công..."
                className="w-full border-gray-300 rounded-md shadow-sm border px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={filters.accountingObject}
                onChange={(e) => handleFilterChange("accountingObject", e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {
        selectedIds.length > 0 && (
          <div className="flex justify-start mb-2 animate-in slide-in-from-left-2 duration-300">
            <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-blue-100 flex items-center gap-4 text-[11px]">
              <span className="font-bold text-gray-700">
                Đã chọn <span className="text-blue-600">{selectedIds.length}</span> GD
              </span>
              <div className="flex items-center gap-2 border-l pl-4 border-gray-100">
                <button
                  onClick={() => handleOpenEditModal(selectedIds)}
                  className="px-3 py-1 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <SquarePen size={12} />
                  Cập nhật đồng loạt
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Hủy chọn"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 table-fixed min-w-[1000px]">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="px-2 py-2 text-center"
                  style={{ width: "40px" }}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={transactions.length > 0 && selectedIds.length === transactions.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(transactions.map(t => t.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
                <th
                  className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase border-r border-gray-300"
                  style={{ width: "80px" }}
                >
                  Ngày hiệu lực
                </th>
                <th
                  className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase border-r border-gray-300"
                  style={{ width: "80px" }}
                >
                  Ngày giao dịch
                </th>
                <th
                  className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase border-r border-gray-300"
                  style={{ width: "100px" }}
                >
                  Mã GD
                </th>
                <th
                  className="px-2 py-2 text-center text-[10px] font-bold text-gray-600 uppercase"
                  style={{ width: "80px" }}
                >
                  Loại
                </th>
                <th
                  className="px-2 py-2 text-right text-[10px] font-bold text-gray-600 uppercase"
                  style={{ width: "100px" }}
                >
                  Số tiền
                </th>
                <th
                  className="px-2 py-2 text-right text-[10px] font-bold text-gray-600 uppercase"
                  style={{ width: "100px" }}
                >
                  Số dư
                </th>
                <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">
                  Nội dung
                </th>
                <th
                  className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase"
                  style={{ width: "110px" }}
                >
                  Đối tượng hạch toán
                </th>
                <th
                  className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase"
                  style={{ width: "100px" }}
                >
                  STK Bank
                </th>
                <th
                  className="px-2 py-2 text-center text-[10px] font-bold text-gray-600 uppercase"
                  style={{ width: "80px" }}
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-8 text-center text-gray-500 text-sm"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((item, index) => {
                  const isLast = transactions.length === index + 1;
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={`${item.id}-${index}`}
                      ref={isLast ? lastElementRef : null}
                      className={`transition-colors duration-150 group ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-2 py-2 text-center align-middle border-r border-gray-200">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(prev => [...prev, item.id]);
                            } else {
                              setSelectedIds(prev => prev.filter(id => id !== item.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-2 py-2 text-[11px] align-top border-r border-gray-200">
                        <DateCell dateString={item.effectiveDate} />
                      </td>
                      <td className="px-2 py-2 text-[11px] align-top border-r border-gray-200">
                        <DateCell dateString={item.transactionDate} />
                      </td>
                      <td className="px-2 py-2 text-[11px] text-gray-900 font-semibold align-top border-r border-gray-200 break-all">
                        {item.transactionCode || "-"}
                      </td>
                      {/* Loại */}
                      <td className="px-2 py-2 text-center align-top">
                        <span className={`px-2 py-1 inline-flex text-[10px] font-bold rounded ${item.transactionType === 'IN'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                          }`}>
                          {item.transactionType}
                        </span>
                      </td>
                      {/* Số tiền */}
                      <td className={`px-2 py-2 text-[11px] text-right font-bold align-top ${item.transactionType === 'IN' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {item.transactionType === 'IN' ? '+' : '-'}{formatCurrency(item.amount)}
                      </td>
                      <td className="px-2 py-2 text-[11px] text-right text-gray-700 font-medium align-top">
                        {formatCurrency(item.balance)}
                      </td>
                      <td className="px-2 py-2 align-top">
                        <div
                          className="text-[11px] text-gray-700 truncate cursor-help"
                          title={item.description || "-"}
                        >
                          {item.description || "-"}
                        </div>
                      </td>
                      <td className="px-2 py-2 align-top">
                        <div
                          className="text-[11px] text-gray-700 truncate cursor-help"
                          title={item.accountingObject || "-"}
                        >
                          {item.accountingObject || "-"}
                        </div>
                      </td>
                      {/* <td className="px-2 py-2 text-[11px] text-gray-700 align-middle">
                        {item.accountingObject || "-"}
                      </td> */}
                      <td className="px-2 py-2 text-[11px] text-gray-700 font-semibold align-top">
                        {item.accountBankNumber || item.accountBankNumber || "-"}
                      </td>
                      <td className="px-2 py-2 text-center align-top">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleOpenEditModal(item)}
                        >
                          <SquarePen className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                !isLoading && (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-8 text-center text-gray-500 text-sm"
                    >
                      {error || "Không tìm thấy giao dịch nào."}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {isLoading && transactions.length > 0 && (
          <div className="flex justify-center items-center py-2 bg-gray-50 border-t">
            <span className="text-xs text-gray-500">Đang tải thêm...</span>
          </div>
        )}
      </div>

      {/* Scan Transaction Modal */}
      {
        scanModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Quét giao dịch</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian quét:</label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  Từ: {dayjs(filters.fromEffectiveDate).format('DD/MM/YYYY HH:mm:ss')}<br />
                  Đến: {dayjs(filters.toEffectiveDate).format('DD/MM/YYYY HH:mm:ss')}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn tài khoản ngân hàng:</label>
                <select
                  value={selectedAccount ? bankList.findIndex(bank =>
                    (bank.id === selectedAccount.id) ||
                    (bank.accountBankNumber === selectedAccount.accountBankNumber)
                  ) : ''}
                  onChange={(e) => {
                    const account = bankList[parseInt(e.target.value)];
                    setSelectedAccount(account);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn tài khoản...</option>
                  {bankList.map((bank, index) => (
                    <option key={bank.id || bank.accountBankNumber || index} value={index}>
                      {bank.accountBankNumber || bank.accountNumber} - {bank.accountBankHolderName || 'Unknown'} - {bank.bankCode}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setScanModalOpen(false);
                    setSelectedAccount(null);
                  }}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleScanTransaction}
                  disabled={!selectedAccount || !selectedAccount.accountBankNumber || !selectedAccount.loginUsername}
                  className={`px-4 py-2 text-sm rounded-md ${selectedAccount && selectedAccount.accountBankNumber && selectedAccount.loginUsername
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  Bắt đầu quét
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Edit Transaction Modal */}
      <EditFinancialTransactionModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        formData={editFormData}
        onChange={handleEditFormChange}
        onSave={handleSaveEdit}
        loading={editLoading}
      />
    </div >
  );
}