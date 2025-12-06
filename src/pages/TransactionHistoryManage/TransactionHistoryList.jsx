import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import weekday from "dayjs/plugin/weekday";
import isoWeek from "dayjs/plugin/isoWeek";
import utc from "dayjs/plugin/utc";
import bankAccountApi from "../../api/bankAccountApi";
import transactionHistoryApi from "../../api/transactionHistoryApi";


// --- CẤU HÌNH DAYJS ---
dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.extend(utc);
dayjs.locale("vi");

// =============================================================================
// PHẦN 1: COMPONENT DATE RANGE PICKER (Code của bạn)
// =============================================================================
function DateRangePicker({ onChange }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState({
    start: dayjs().startOf("day"),
    end: dayjs().endOf("day"),
  });
  const [preset, setPreset] = useState("Hôm nay");
  const [leftMonth, setLeftMonth] = useState(dayjs());
  const [rightMonth, setRightMonth] = useState(dayjs());

  const [inputStart, setInputStart] = useState(dayjs().format("DD/MM/YYYY"));
  const [inputEnd, setInputEnd] = useState(dayjs().format("DD/MM/YYYY"));

  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const presets = {
    "Hôm nay": () => ({ start: dayjs().startOf("day"), end: dayjs().endOf("day"), label: "Hôm nay" }),
    "Hôm qua": () => ({ start: dayjs().subtract(1, "day").startOf("day"), end: dayjs().subtract(1, "day").endOf("day"), label: "Hôm qua" }),
    "Tuần này": () => ({ start: dayjs().startOf("isoWeek"), end: dayjs().endOf("isoWeek"), label: "Tuần này" }),
    "Tuần trước": () => ({ start: dayjs().subtract(1, "week").startOf("isoWeek"), end: dayjs().subtract(1, "week").endOf("isoWeek"), label: "Tuần trước" }),
    "Tháng này": () => ({ start: dayjs().startOf("month"), end: dayjs().endOf("month"), label: "Tháng này" }),
    "Tháng trước": () => ({ start: dayjs().subtract(1, "month").startOf("month"), end: dayjs().subtract(1, "month").endOf("month"), label: "Tháng trước" }),
  };

  const applyPreset = (key) => {
    const { start, end, label } = presets[key]();
    updateRange(start, end, label);
    setOpen(false);
    emitValue(start, end);
  };

  const updateRange = (start, end, newPreset = "") => {
    setRange({ start, end });
    setPreset(newPreset);
    setInputStart(start.format("DD/MM/YYYY"));
    setInputEnd(end.format("DD/MM/YYYY"));
    setLeftMonth(start);
    setRightMonth(end);
  };

  const emitValue = (start, end) => {
    onChange?.({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
  };

  const handleInputChange = (type, value) => {
    const cleaned = value.replace(/[^\d/]/g, "");
    if (type === "start") setInputStart(cleaned);
    else setInputEnd(cleaned);

    if (cleaned.length === 10) {
      const parsed = dayjs(cleaned, "DD/MM/YYYY", true);
      if (parsed.isValid()) {
        const newDate = parsed.startOf("day");
        if (type === "start") {
            // Logic cập nhật state...
            const newRange = { ...range, start: newDate };
            if (newDate.isAfter(range.end)) newRange.end = newDate.endOf('day');
            setRange(newRange);
            setLeftMonth(newDate);
        } else {
            // Logic cập nhật state...
            const newRange = { ...range, end: newDate.endOf("day") };
            if (newDate.isBefore(range.start)) newRange.start = newDate.startOf('day');
            setRange(newRange);
            setRightMonth(newDate);
        }
        setPreset("");
      }
    }
  };

  const displayText = inputStart && inputEnd ? (inputStart === inputEnd ? inputStart : `${inputStart} - ${inputEnd}`) : "Chọn khoảng thời gian";

  return (
    <div className="relative inline-block" ref={popupRef}>
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center justify-between gap-3 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 min-w-[280px] text-sm shadow-sm">
        <span>{displayText}</span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 bg-white border rounded-lg shadow-2xl z-50 flex overflow-hidden">
          <div className="w-40 border-r bg-gray-50">
            {Object.keys(presets).map((key) => (
              <button key={key} type="button" onClick={() => applyPreset(key)} className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition ${preset === presets[key]().label ? "bg-blue-100 text-blue-700 font-medium" : ""}`}>{key}</button>
            ))}
          </div>
          <div className="p-5">
            <div className="flex gap-4 mb-5 justify-center">
                 {/* Input Start */}
                <div className="flex items-center border rounded">
                   <span className="px-2 text-xs text-gray-500 bg-gray-100 h-full flex items-center">Từ</span>
                   <input className="w-28 px-2 py-1 text-sm outline-none" value={inputStart} onChange={(e)=>handleInputChange('start', e.target.value)} />
                </div>
                 {/* Input End */}
                 <div className="flex items-center border rounded">
                   <span className="px-2 text-xs text-gray-500 bg-gray-100 h-full flex items-center">Đến</span>
                   <input className="w-28 px-2 py-1 text-sm outline-none" value={inputEnd} onChange={(e)=>handleInputChange('end', e.target.value)} />
                </div>
            </div>
            <div className="flex gap-6">
              <CalendarMonth month={leftMonth} onMonthChange={setLeftMonth} value={range.start} onChange={(d) => updateRange(d.startOf("day"), range.end)} />
              <CalendarMonth month={rightMonth} onMonthChange={setRightMonth} value={range.end} onChange={(d) => {
                  const newEnd = d.endOf("day");
                  if (newEnd.isBefore(range.start)) updateRange(newEnd, newEnd);
                  else updateRange(range.start, newEnd);
              }} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-4 py-1.5 border rounded text-sm hover:bg-gray-100">Hủy</button>
              <button onClick={() => { emitValue(range.start, range.end); setOpen(false); }} className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Áp dụng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
const DateCell = ({ dateString }) => {
  if (!dateString) return <span className="text-gray-400 text-[11px]">-</span>;
  const d = dayjs(dateString);
  return (
    <div className="flex flex-col leading-tight">
      <span className="font-semibold text-gray-800 text-[11px]">{d.format("HH:mm:ss")}</span>
      <span className="text-[10px] text-gray-500">{d.format("DD/MM/YYYY")}</span>
    </div>
  );
};

function CalendarMonth({ month, onMonthChange, value, onChange }) {
  const currentMonth = month || dayjs();
  const year = currentMonth.year();
  const monthNum = currentMonth.month();
  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const startDayOfWeek = startOfMonth.day() === 0 ? 6 : startOfMonth.day() - 1; // Điều chỉnh để T2 là đầu tuần nếu cần, ở đây dùng mặc định dayjs locale
  
  // Sửa lại logic render day grid cho đơn giản theo dayjs locale 'vi' (CN là 0)
  // Tuy nhiên ở trên bạn import weekday plugin.
  // Để an toàn với UI của bạn, tôi giữ logic render đơn giản
  
  const days = [];
  const emptyDays = startOfMonth.day() === 0 ? 6 : startOfMonth.day() - 1; // Giả sử T2 bắt đầu

  for (let i = 0; i < emptyDays; i++) days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = dayjs(new Date(year, monthNum, day));
    const isSelected = value && date.isSame(value, "day");
    days.push(
      <button key={day} onClick={() => onChange(date)} className={`w-8 h-8 rounded-full text-sm hover:bg-blue-100 ${isSelected ? "bg-blue-600 text-white" : ""}`}>{day}</button>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-2">
        <button onClick={() => onMonthChange(currentMonth.subtract(1, "month"))}>&lt;</button>
        <span className="text-sm font-semibold">Tháng {monthNum + 1}/{year}</span>
        <button onClick={() => onMonthChange(currentMonth.add(1, "month"))}>&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['T2','T3','T4','T5','T6','T7','CN'].map(d=><div key={d} className="text-xs text-gray-500">{d}</div>)}
        {days}
      </div>
    </div>
  );
}

// =============================================================================
// PHẦN 2: COMPONENT CHÍNH TransactionHistoryList
// =============================================================================

const TransactionHistoryList = () => {
  // --- STATE ---
  const [transactions, setTransactions] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null); // Meta data từ API

  // Tab State
  const [activeTab, setActiveTab] = useState("all"); // "all" hoặc "fb"

  // Pagination State
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Filter State
  const [filters, setFilters] = useState({
    searchQuery: "", // fbTransactionCode hoặc nội dung chung
    fbTransactionCode: "",
    fbAccountId: "",
    transactionType: "", // "IN", "OUT", ""
    isFbTransaction: "all", // "all", "true", "false"
    isAmountMismatched: "all", // "all", "true", "false"
    bankAccountId: "",
    fromEffectiveDate: dayjs().startOf("day").toISOString(),
    toEffectiveDate: dayjs().endOf("day").toISOString(),
    sortOrder: "desc",
  });

  // Modal states
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [facebookModalOpen, setFacebookModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Debug selectedAccount
  useEffect(() => {
    console.log("selectedAccount changed:", selectedAccount);
  }, [selectedAccount]);

  // Calculate if date range is greater than 3 days
  const isDateRangeTooLarge = useMemo(() => {
    const fromDate = dayjs(filters.fromEffectiveDate);
    const toDate = dayjs(filters.toEffectiveDate);
    const diffInDays = toDate.diff(fromDate, 'day');
    return diffInDays > 3;
  }, [filters.fromEffectiveDate, filters.toEffectiveDate]);

  // Observer ref cho infinite scroll
  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchTransactions(true); // Load more = true
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, nextCursor] // Phụ thuộc vào nextCursor để biết trang tiếp theo
  );

  // --- API GET BANK LIST ---
  useEffect(() => {
    // Gọi API lấy danh sách ngân hàng khi mount
    const fetchBanks = async () => {
      try {
        // Thay thế bằng call API thực tế của bạn
        const res = await bankAccountApi.getBankList();
        console.log("Bank API response:", res);
        console.log("Bank data:", res.data);
        // Temporary: Use mock data if API returns empty
        const mockData = [
          {
            id: 1,
            accountBankNumber: "1997568888",
            accountBankHolderName: "Test User",
            loginUsername: "7474251LTT",
            loginPassword: "t4LDtGe1V1EnBRQ5khhtHtYHRyJl7LHOiS3byW7fNv0=",
            bankCode: "ACB"
          },
          {
            id: 2,
            accountBankNumber: "1234567890",
            accountBankHolderName: "Another User",
            loginUsername: "testuser",
            loginPassword: "testpass",
            bankCode: "VCB"
          }
        ];
        const dataToUse = (res.data && res.data.length > 0) ? res.data : mockData;
        setBankList(dataToUse);
        console.log("Bank list length after set:", dataToUse.length);

      } catch (err) {
        console.error("Lỗi lấy danh sách ngân hàng", err);
      }
    };
    fetchBanks();
  }, []);

  // --- API FETCH TRANSACTIONS ---
  const fetchTransactions = async (isLoadMore = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // Xử lý logic boolean filter (vì select trả về string "true"/"false"/"all")
      const getBooleanValue = (val) => {
        if (val === "true") return true;
        if (val === "false") return false;
        return undefined; // "all" -> undefined
      };

      // Cursor: Nếu load more thì dùng nextCursor state, nếu filter mới thì undefined
      const cursorToUse = isLoadMore ? nextCursor : undefined;

      const res = await transactionHistoryApi.getTransactionHistoryList(
        cursorToUse,
        20, // pageSize cố định
        filters.sortOrder,
        filters.fromEffectiveDate,
        filters.toEffectiveDate,
        filters.fbTransactionCode || undefined, // Gửi undefined nếu chuỗi rỗng
        filters.transactionType || undefined,
        filters.fbAccountId || undefined,
        getBooleanValue(filters.isFbTransaction),
        getBooleanValue(filters.isAmountMismatched),
        filters.bankAccountId || undefined
      );

      if (res && res.success) {
        setTransactions((prev) => {
          return isLoadMore ? [...prev, ...res.data] : res.data;
        });
        console.log("data", res.data)
        // Cập nhật thông tin phân trang
        setNextCursor(res.pageInfo.nextCursor);
        setHasMore(res.pageInfo.hasNextPage);
        // Cập nhật meta data (chỉ cập nhật khi không phải load more)
        if (!isLoadMore && res.meta) {
          setMeta(res.meta);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải lịch sử giao dịch.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- EFFECT: CẬP NHẬT FILTER KHI TAB THAY ĐỔI ---
  useEffect(() => {
    const newValue = activeTab === "fb" ? "true" : "all";
    setFilters((prev) => {
      // Chỉ cập nhật nếu giá trị thay đổi để tránh re-render không cần thiết
      if (prev.isFbTransaction === newValue) return prev;

      // Clear data ngay khi tab thay đổi để tránh hiển thị data cũ
      setTransactions([]);
      setMeta(null);
      setIsLoading(true);

      return {
        ...prev,
        isFbTransaction: newValue,
      };
    });
  }, [activeTab]);

  // --- EFFECT: TRIGGER KHI FILTER THAY ĐỔI ---
  // Mỗi khi filters thay đổi, reset list và gọi lại trang 1
  useEffect(() => {
    // Reset state phân trang
    setNextCursor(null);
    setHasMore(true);
    // Gọi API (isLoadMore = false)
    fetchTransactions(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); 
  // Lưu ý: Đưa tất cả field trong filters vào dependency array hoặc object filters

  // --- HANDLERS ---
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateRangeChange = ({ startDate, endDate }) => {
    setFilters((prev) => ({
      ...prev,
      fromEffectiveDate: startDate,
      toEffectiveDate: endDate,
    }));
  };

  // --- RENDER HELPERS ---
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat('vi-VN', { style: 'decimal', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("HH:mm DD/MM/YYYY");
  };

  // --- META DATA CONFIG (Dễ mở rộng: chỉ cần thêm object vào đây) ---
  const metaConfig = [
    {
      key: 'totalAmountIn', // API có thể trả về totalAmountIn hoặc TotalAmountIn
      label: 'Tổng nhận',
      format: (value) => formatCurrency(value),
      className: 'text-green-600 font-semibold'
    },
    {
      key: 'totalAmountOut',
      label: 'Tổng trừ',
      format: (value) => formatCurrency(value),
      className: 'text-red-600 font-semibold'
    },
    {
      key: 'totalFbAmount',
      label: 'Tổng chi tiêu FB',
      format: (value) => formatCurrency(value),
      className: 'text-blue-600 font-semibold'
    },
    {
      key: 'fbUnreconciledCount',
      label: 'GD chưa đối chiếu',
      format: (value) => value !== null && value !== undefined ? value : '-',
      className: 'text-orange-600 font-semibold'
    }
  ];

  // Helper để lấy giá trị meta (hỗ trợ cả camelCase và PascalCase)
  const getMetaValue = (meta, key) => {
    if (!meta) return null;
    // Thử camelCase trước
    if (meta[key] !== undefined) return meta[key];
    // Thử PascalCase
    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
    if (meta[pascalKey] !== undefined) return meta[pascalKey];
    return null;
  };

  // Modal handlers
  const handleScanTransaction = () => {
    if (!selectedAccount) return;

    const fromDate = dayjs(filters.fromEffectiveDate).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const toDate = dayjs(filters.toEffectiveDate).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';

    const url = `https://acb.duckhero.store/trigger?token=999999999&stk=${selectedAccount.accountBankNumber}&fromDate=${fromDate}&toDate=${toDate}&LoginUsername=${selectedAccount.loginUsername}&LoginPassword=${selectedAccount.loginPassword}`;

    window.open(url, '_blank');
    setScanModalOpen(false);
    setSelectedAccount(null);
  };

  const handleFacebookReconciliation = () => {
    const fromDate = dayjs(filters.fromEffectiveDate).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const toDate = dayjs(filters.toEffectiveDate).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';

    const url = `https://acb.duckhero.store/check-bill-fb?token=999999999&fromDate=${fromDate}&toDate=${toDate}`;

    window.open(url, '_blank');
    setFacebookModalOpen(false);
  };

  // Modal components
  const ScanTransactionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Quét giao dịch</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian quét:</label>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            Từ: {dayjs(filters.fromEffectiveDate).format('DD/MM/YYYY HH:mm:ss')}<br/>
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
              console.log("Select value:", e.target.value);
              console.log("Bank list:", bankList);
              const account = bankList[parseInt(e.target.value)];
              console.log("Found account:", account);
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
            className={`px-4 py-2 text-sm rounded-md ${
              selectedAccount && selectedAccount.accountBankNumber && selectedAccount.loginUsername
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Bắt đầu quét
          </button>
        </div>
      </div>
    </div>
  );

  const FacebookBillModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Đối chiếu bill Facebook</h3>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng thời gian:</label>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            Từ: {dayjs(filters.fromEffectiveDate).format('DD/MM/YYYY HH:mm:ss')}<br/>
            Đến: {dayjs(filters.toEffectiveDate).format('DD/MM/YYYY HH:mm:ss')}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setFacebookModalOpen(false)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleFacebookReconciliation}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Đối chiếu
          </button>
        </div>
      </div>
    </div>
  );

return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Lịch sử giao dịch</h1>

      {/* --- DATE FILTER SECTION (Riêng biệt) --- */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Thời gian:</label>
          <DateRangePicker onChange={handleDateRangeChange} />
          <button
            type="button"
            onClick={() => setScanModalOpen(true)}
            disabled={isDateRangeTooLarge}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isDateRangeTooLarge
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title={isDateRangeTooLarge ? 'Khoảng thời gian không được vượt quá 3 ngày' : ''}
          >
            Quét giao dịch
          </button>
          <button
            type="button"
            onClick={() => setFacebookModalOpen(true)}
            disabled={isDateRangeTooLarge}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isDateRangeTooLarge
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            title={isDateRangeTooLarge ? 'Khoảng thời gian không được vượt quá 3 ngày' : ''}
          >
            Đối chiếu bill Facebook
          </button>
        </div>
      </div>

      {/* --- FILTER & SEARCH SECTION (Nhóm chung) --- */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {/* Search FB Trans Code */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Mã GD Facebook</label>
             <input
               type="text"
               placeholder="Nhập mã GD..."
               className="w-full border-gray-300 rounded-md shadow-sm border px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
               value={filters.fbTransactionCode}
               onChange={(e) => handleFilterChange("fbTransactionCode", e.target.value)}
             />
           </div>
           {/* Search FB Account ID */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">FB Account ID</label>
             <input
               type="text"
               placeholder="Nhập FB Account ID..."
               className="w-full border-gray-300 rounded-md shadow-sm border px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
               value={filters.fbAccountId}
               onChange={(e) => handleFilterChange("fbAccountId", e.target.value)}
             />
           </div>
           {/* Bank Account Select */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản ngân hàng</label>
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
           {/* Transaction Type */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Loại giao dịch</label>
             <select
               className="w-full border-gray-300 rounded-md shadow-sm border px-3 py-2 text-sm"
               value={filters.transactionType}
               onChange={(e) => handleFilterChange("transactionType", e.target.value)}
             >
               <option value="">Tất cả</option>
               <option value="IN">Tiền vào (IN)</option>
               <option value="OUT">Tiền ra (OUT)</option>
             </select>
           </div>
           {/* Is Amount Mismatched */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Lệch số tiền?</label>
             <select
               className="w-full border-gray-300 rounded-md shadow-sm border px-3 py-2 text-sm"
               value={filters.isAmountMismatched}
               onChange={(e) => handleFilterChange("isAmountMismatched", e.target.value)}
             >
               <option value="all">Tất cả</option>
               <option value="true">Có lệch</option>
               <option value="false">Khớp</option>
             </select>
           </div>
        </div>
      </div>

    {/* --- TABLE SECTION ĐÃ TỐI ƯU --- */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* --- META DATA & TABS --- */}
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            {/* Tabs - Bên trái */}
            <div className="flex">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === "all"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("fb")}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === "fb"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Giao dịch FB
              </button>
            </div>
            
            {/* Meta Data - Bên phải */}
            <div className="flex items-center gap-4 px-4 py-3 flex-wrap">
              {meta && metaConfig.map((config) => {
                const value = getMetaValue(meta, config.key);
                if (value === null || value === undefined) return null;
                return (
                  <div key={config.key} className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-md border border-gray-200">
                    <span className="text-xs text-gray-600 font-medium">{config.label}:</span>
                    <span className={`text-sm ${config.className}`}>
                      {config.format(value)}
                    </span>
                  </div>
                );
              })}
              {(!meta || metaConfig.every(config => getMetaValue(meta, config.key) === null || getMetaValue(meta, config.key) === undefined)) && (
                <span className="text-xs text-gray-400 italic">Đang tải thống kê...</span>
              )}
            </div>
          </div>
        </div>
        {/* Table container với overflow để responsive */}
        <div className="w-full overflow-x-auto"> 
          <table className="w-full divide-y divide-gray-200 table-fixed min-w-[1400px]">
            <thead className="bg-gray-100">
              <tr>
                {/* 3 cột ngày đặt liền nhau */}
                <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase border-r border-gray-300" style={{width: '90px'}}>Ngày hiệu lực</th>
                <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase border-r border-gray-300" style={{width: '90px'}}>Ngày giao dịch</th>
                <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase" style={{width: '90px'}}>Ngày GD chính xác</th>
                
                <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase" style={{width: '70px'}}>Mã GD</th>
                <th className="px-2 py-2 text-center text-[10px] font-bold text-gray-600 uppercase" style={{width: '60px'}}>Loại</th>
                <th className="px-2 py-2 text-right text-[10px] font-bold text-gray-600 uppercase" style={{width: '110px'}}>Số tiền</th>
                <th className="px-2 py-2 text-right text-[10px] font-bold text-gray-600 uppercase" style={{width: '100px'}}>Tiền FB</th>
                <th className="px-2 py-2 text-right text-[10px] font-bold text-gray-600 uppercase" style={{width: '110px'}}>Số dư</th>
                <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase" style={{minWidth: '180px'}}>Nội dung</th>
                
                <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase" style={{width: '100px'}}>Mã GD FB</th>
                <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase" style={{width: '120px'}}>FB Account ID</th>
                
                <th className="px-2 py-2 text-left text-[10px] font-bold text-gray-600 uppercase" style={{width: '110px'}}>STK Bank</th>
                {/* <th className="px-2 py-2 text-center text-[10px] font-bold text-gray-600 uppercase" style={{width: '60px'}}>Bank ID</th> */}
                <th className="px-2 py-2 text-center text-[10px] font-bold text-gray-600 uppercase" style={{width: '70px'}}>Thẻ</th>
                
                <th className="px-2 py-2 text-center text-[10px] font-bold text-gray-600 uppercase" style={{width: '80px'}}>Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && transactions.length === 0 ? (
                // Skeleton loading cho lần đầu với 16 cột
                Array.from({ length: 8 }, (_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-2 py-3 text-[11px] align-top border-r border-gray-200">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded mt-1 w-3/4"></div>
                    </td>
                    <td className="px-2 py-3 text-[11px] align-top border-r border-gray-200">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded mt-1 w-3/4"></div>
                    </td>
                    <td className="px-2 py-3 text-[11px] align-top">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded mt-1 w-3/4"></div>
                    </td>
                    <td className="px-2 py-3 text-[11px] align-middle">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-2 py-3 text-center align-middle">
                      <div className="h-5 bg-gray-200 rounded w-8 mx-auto"></div>
                    </td>
                    <td className="px-2 py-3 text-[11px] text-right align-middle">
                      <div className="h-3 bg-gray-200 rounded w-20 ml-auto"></div>
                    </td>
                    <td className="px-2 py-3 text-[11px] text-right align-middle">
                      <div className="h-3 bg-gray-200 rounded w-16 ml-auto"></div>
                    </td>
                    <td className="px-2 py-3 text-[11px] text-right align-middle">
                      <div className="h-3 bg-gray-200 rounded w-20 ml-auto"></div>
                    </td>
                    <td className="px-2 py-3 align-middle">
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-2 py-3 align-middle">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-2 py-3 align-middle">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-2 py-3 text-[11px] align-middle">
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </td>
                    <td className="px-2 py-3 text-[11px] text-center align-middle">
                      <div className="h-3 bg-gray-200 rounded w-4"></div>
                    </td>
                    <td className="px-2 py-3 text-center align-middle">
                      <div className="h-4 bg-gray-200 rounded w-5 mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : transactions.length > 0 ? (
                transactions.map((item, index) => {
                  const isLastElement = transactions.length === index + 1;
                  return (
                    <tr 
                      key={`${item.id}-${index}`} 
                      ref={isLastElement ? lastElementRef : null}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      {/* 1. Ngày hiệu lực */}
                      <td className="px-2 py-2 text-[11px] align-top border-r border-gray-200">
                        <DateCell dateString={item.effectiveDate} />
                      </td>
                      {/* 2. Ngày giao dịch */}
                      <td className="px-2 py-2 text-[11px] align-top border-r border-gray-200">
                        <DateCell dateString={item.transactionDate} />
                      </td>
                      {/* 3. Ngày giao dịch chính xác (FB) */}
                      <td className="px-2 py-2 text-[11px] align-top">
                        <DateCell dateString={item.fbTransactionExactDate} />
                      </td>

                      {/* Mã GD */}
                      <td className="px-2 py-2 text-[11px] text-gray-900 font-semibold align-middle">
                        {item.transactionCode}
                      </td>

                      {/* Loại */}
                      <td className="px-2 py-2 text-center align-middle">
                        <span className={`px-2 py-1 inline-flex text-[10px] font-bold rounded ${
                          item.transactionType === 'IN' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {item.transactionType}
                        </span>
                      </td>

                      {/* Số tiền */}
                      <td className={`px-2 py-2 text-[11px] text-right font-bold align-middle ${
                         item.transactionType === 'IN' ? 'text-green-600' : 'text-red-600'
                      }`}>
                         {item.transactionType === 'IN' ? '+' : '-'}{formatCurrency(item.amount)}
                      </td>

                      {/* Số tiền FB */}
                      <td className="px-2 py-2 text-[11px] text-right text-gray-600 align-middle">
                         {item.amountFb ? formatCurrency(item.amountFb) : '-'}
                      </td>

                      {/* Số dư */}
                      <td className="px-2 py-2 text-[11px] text-right text-gray-700 font-medium align-middle">
                        {formatCurrency(item.balance)}
                      </td>

                      {/* Nội dung */}
                      <td className="px-2 py-2 align-middle">
                        <div className="text-[11px] text-gray-700 truncate cursor-help" title={item.description || "-"}>
                            {item.description || "-"}
                        </div>
                      </td>

                      {/* Mã GD FB */}
                      <td className="px-2 py-2 align-middle">
                        <div className="text-[10px] text-gray-600 font-medium truncate" title={item.fbTransactionCode || "-"}>
                            {item.fbTransactionCode || "-"}
                        </div>
                      </td>

                      {/* FB Account ID */}
                      <td className="px-2 py-2 align-middle">
                        <div className="text-[10px] text-gray-600 truncate" title={item.fbAccountId || "-"}>
                             {item.fbAccountId || "-"}
                        </div>
                      </td>

                      {/* STK Ngân hàng */}
                      <td className="px-2 py-2 text-[11px] text-gray-700 font-semibold align-middle">
                        {item.accountBankNumber}
                      </td>

                      {/* Bank Account ID */}
                      {/* <td className="px-2 py-2 text-[11px] text-center text-gray-600 align-middle">
                        {item.bankAccountId}
                      </td> */}

                      {/* Đuôi thẻ */}
                      <td className="px-2 py-2 text-[11px] text-center text-gray-600 align-middle">
                        {item.cardLastDigits || "-"}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-2 py-2 text-center align-middle">
                        <div className="flex flex-col gap-1 items-center justify-center">
                            {item.isFbTransaction && (
                                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold" title="Giao dịch Facebook">
                                    F
                                </span>
                            )}
                            {item.isAmountMismatched === true && (
                                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold" title="Lệch số tiền">
                                    !
                                </span>
                            )}
                            {!item.isFbTransaction && item.isAmountMismatched !== true && (
                                <span className="text-gray-300 text-[10px]">-</span>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                !isLoading && (
                    <tr>
                        <td colSpan="16" className="px-4 py-8 text-center text-gray-500 text-sm">
                            Không tìm thấy giao dịch nào.
                        </td>
                    </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        
        {/* Loading & Messages */}
        {isLoading && transactions.length > 0 && (
            <div className="flex justify-center items-center py-2 bg-gray-50 border-t">
                <span className="text-xs text-gray-500">Đang tải thêm...</span>
            </div>
        )}
      </div>

      {/* Modals */}
      {scanModalOpen && <ScanTransactionModal />}
      {facebookModalOpen && <FacebookBillModal />}
    </div>
  );
};

export default TransactionHistoryList;