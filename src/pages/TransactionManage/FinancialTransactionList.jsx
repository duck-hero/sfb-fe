import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { toast } from "react-toastify";
import { SquarePen } from "lucide-react";

import bankAccountApi from "../../api/bankAccountApi";
import financialTransactionApi from "../../api/financialTransactionApi";

import DateRangePicker from "../../components/DateFilter/DateRangePicker";
import DateCell from "../../components/DateFilter/DateCell";
import EditFinancialTransactionModal from "./EditFinancialTransactionModal";

dayjs.extend(utc);
dayjs.locale("vi");

export default function FinancialTransactionList({ bankAccountType = 2 }) {
  const [transactions, setTransactions] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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
  });
  const [editLoading, setEditLoading] = useState(false);

  const [filters, setFilters] = useState({
    transactionCode: "",
    transactionType: "",
    bankAccountId: "",
    fromEffectiveDate: dayjs().startOf("day").toISOString(),
    toEffectiveDate: dayjs().endOf("day").toISOString(),
  });

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
        console.error("Lỗi lấy danh sách tài khoản ngân hàng:", err);
      }
    };
    fetchBankAccounts();
  }, [bankAccountType]);

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
        filters.transactionCode || undefined,
        filters.transactionType || undefined,
        filters.bankAccountId || undefined,
        bankAccountType
      );

      if (res && res.success) {
        setTransactions((prev) =>
          isLoadMore ? [...prev, ...(res.data || [])] : res.data || []
        );
        setNextCursor(res.pageInfo?.nextCursor ?? null);
        setHasMore(Boolean(res.pageInfo?.hasNextPage));
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải giao dịch.");
      toast.error(typeof err === "string" ? err : "Không thể tải giao dịch.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setNextCursor(null);
    setHasMore(true);
    fetchTransactions(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, bankAccountType]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
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

    const url = `https://acb.duckhero.store/trigger?token=999999999&stk=${selectedAccount.accountBankNumber}&fromDate=${fromDate}&toDate=${toDate}&LoginUsername=${selectedAccount.loginUsername}&LoginPassword=${selectedAccount.loginPassword}`;

    window.open(url, '_blank');
    setScanModalOpen(false);
    setSelectedAccount(null);
  };

  const handleOpenEditModal = (transaction) => {
    setEditFormData({
      id: transaction.id,
      accountingObject: transaction.accountingObject || "",
      description: transaction.description || "",
    });
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
        editFormData.id,
        editFormData.accountingObject
      );
      toast.success("Cập nhật giao dịch thành công!");
      setEditModalOpen(false);

      // Refresh data
      fetchTransactions(false);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Không thể cập nhật giao dịch");
    } finally {
      setEditLoading(false);
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
              Mã GD
            </label>
            <input
              type="text"
              placeholder="Nhập mã GD..."
              className="w-full border-gray-300 rounded-md shadow-sm border px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={filters.transactionCode}
              onChange={(e) => handleFilterChange("transactionCode", e.target.value)}
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
                  {bank.accountBankNumber || bank.accountNumber}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 table-fixed min-w-[1000px]">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase border-r border-gray-300"
                  style={{ width: "90px" }}
                >
                  Ngày hiệu lực
                </th>
                <th
                  className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase border-r border-gray-300"
                  style={{ width: "90px" }}
                >
                  Ngày giao dịch
                </th>
                <th
                  className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase"
                  style={{ width: "70px" }}
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
                  style={{ width: "120px" }}
                >
                  Số tiền
                </th>
                <th
                  className="px-2 py-2 text-right text-[10px] font-bold text-gray-600 uppercase"
                  style={{ width: "120px" }}
                >
                  Số dư
                </th>
                <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">
                  Nội dung
                </th>
                <th
                  className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase"
                  style={{ width: "100px" }}
                >
                  Đối tượng hạch toán
                </th>
                <th
                  className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase"
                  style={{ width: "120px" }}
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
                    colSpan={10}
                    className="px-4 py-8 text-center text-gray-500 text-sm"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((item, index) => {
                  const isLast = transactions.length === index + 1;
                  return (
                    <tr
                      key={`${item.id}-${index}`}
                      ref={isLast ? lastElementRef : null}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="px-2 py-2 text-[11px] align-top border-r border-gray-200">
                        <DateCell dateString={item.effectiveDate} />
                      </td>
                      <td className="px-2 py-2 text-[11px] align-top border-r border-gray-200">
                        <DateCell dateString={item.transactionDate} />
                      </td>
                      <td className="px-2 py-2 text-[11px] text-gray-900 font-semibold align-middle">
                        {item.transactionCode || "-"}
                      </td>
                      <td className="px-2 py-2 text-center align-middle">
                        <span className="px-2 py-1 inline-flex text-[10px] font-bold rounded bg-gray-100 text-gray-700">
                          {item.transactionType || "-"}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-[11px] text-right font-bold align-middle">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-2 py-2 text-[11px] text-right text-gray-700 font-medium align-middle">
                        {formatCurrency(item.balance)}
                      </td>
                      <td className="px-2 py-2 align-middle">
                        <div
                          className="text-[11px] text-gray-700 truncate cursor-help"
                          title={item.description || "-"}
                        >
                          {item.description || "-"}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-[11px] text-gray-700 align-middle">
                        {item.accountingObject || "-"}
                      </td>
                      <td className="px-2 py-2 text-[11px] text-gray-700 font-semibold align-middle">
                        {item.accountBankNumber || item.accountBankNumber || "-"}
                      </td>
                      <td className="px-2 py-2 text-center align-middle">
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
                      colSpan={10}
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
      {scanModalOpen && (
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
                    {bank.accountBankNumber || bank.accountNumber} - {bank.accountBankHolderName || 'Unknown'}
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
      )}

      {/* Edit Transaction Modal */}
      <EditFinancialTransactionModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        formData={editFormData}
        onChange={handleEditFormChange}
        onSave={handleSaveEdit}
        loading={editLoading}
      />
    </div>
  );
}