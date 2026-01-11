import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import dashboardApi from "../../api/dashboardApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Helper functions
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat('vi-VN', { style: 'decimal', maximumFractionDigits: 0 }).format(amount);
};

const Dashboard = () => {
  // Separate state for each section
  const [topDebtCustomers, setTopDebtCustomers] = useState([]);
  const [topCreditCustomers, setTopCreditCustomers] = useState([]);
  const [reconciliation, setReconciliation] = useState(null);
  const [ctvSummary, setCtvSummary] = useState(null);
  const [employeeSummary, setEmployeeSummary] = useState(null);
  const [expenseSummary, setExpenseSummary] = useState(null);

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    topDebt: false,
    topCredit: false,
    reconciliation: false,
  });

  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: dayjs().year(),
    month: dayjs().month() + 1,
  });

  // Fetch all dashboard data asynchronously
  const fetchDashboardData = async () => {
    setError(null);

    // Set all loading states to true
    setLoadingStates(prev => ({
      ...prev,
      topDebt: true,
      topCredit: true,
      reconciliation: true,
    }));

    try {
      // Fetch all APIs in parallel for better performance
      const [topDebtRes, topCreditRes, reconciliationRes, ctvRes, employeeRes, expenseRes] = await Promise.allSettled([
        dashboardApi.getTopDebtCustomers(filters.year, filters.month, 5),
        dashboardApi.getTopCreditCustomers(filters.year, filters.month, 5),
        dashboardApi.getMonthlySummary(filters.year, filters.month),
        dashboardApi.getCTVDebtSummary(filters.year, filters.month),
        dashboardApi.getEmployeeDebtSummary(filters.year, filters.month),
        dashboardApi.getExpenseAccountingSummary(filters.year, filters.month),
      ]);

      // Handle Top Debt
      if (topDebtRes.status === 'fulfilled' && topDebtRes.value?.success) {
        setTopDebtCustomers(topDebtRes.value.data || []);
      }
      setLoadingStates(prev => ({ ...prev, topDebt: false }));

      // Handle Top Credit
      if (topCreditRes.status === 'fulfilled' && topCreditRes.value?.success) {
        setTopCreditCustomers(topCreditRes.value.data || []);
      }
      setLoadingStates(prev => ({ ...prev, topCredit: false }));

      // Handle Reconciliation
      if (reconciliationRes.status === 'fulfilled' && reconciliationRes.value?.success) {
        setReconciliation(reconciliationRes.value.data);
      }
      setLoadingStates(prev => ({ ...prev, reconciliation: false }));

      // Handle CTV Summary
      if (ctvRes.status === 'fulfilled' && ctvRes.value?.success) {
        setCtvSummary(ctvRes.value.data);
      }

      // Handle Employee Summary
      if (employeeRes.status === 'fulfilled' && employeeRes.value?.success) {
        setEmployeeSummary(employeeRes.value.data);
      }

      // Handle Expense Summary
      if (expenseRes.status === 'fulfilled' && expenseRes.value?.success) {
        setExpenseSummary(expenseRes.value.data);
      }

    } catch (err) {
      console.error("Dashboard API error:", err);
      setError("Không thể tải dữ liệu dashboard");
      // Reset all loading states on error
      setLoadingStates(prev => ({
        ...prev,
        topDebt: false,
        topCredit: false,
        reconciliation: false,
      }));
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrevMonth = () => {
    setFilters(prev => {
      let newMonth = prev.month - 1;
      let newYear = prev.year;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
      return { year: newYear, month: newMonth };
    });
  };

  const handleNextMonth = () => {
    setFilters(prev => {
      let newMonth = prev.month + 1;
      let newYear = prev.year;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
      return { year: newYear, month: newMonth };
    });
  };

  // Customer Ranking Component (compact version)
  const CustomerRankingCard = ({ customers, title, type = "debt", isLoading = false }) => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm h-full">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm h-full flex flex-col">
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-lg">{type === 'debt' ? '👥' : '💰'}</span>
          {title}
        </h3>
        {customers && customers.length > 0 ? (
          <div className="space-y-2 flex-1 overflow-y-auto">
            {customers.map((customer, index) => (
              <div key={customer.customerId || index} className="flex items-center justify-between p-2.5 bg-gray-50 rounded border border-gray-100 hover:border-gray-300 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs text-gray-800 truncate mb-0.5">
                    {customer.fullCustomerCode || `${customer.customerCode} - ${customer.customerName}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    Khách đã thanh toán: <span className="font-medium text-green-600">{formatCurrency(customer.paidInMonth || 0)}</span>
                  </div>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <div className={`font-bold text-sm ${type === 'debt' ? 'text-red-600' : 'text-green-600'}`}>
                    {type === 'debt' ? formatCurrency(customer.debt || 0) : formatCurrency(customer.credit || 0)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(customer.closingBalance || 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-xs">Không có dữ liệu</p>
          </div>
        )}
      </div>
    );
  };

  // Chart Component for Reconciliation Data using Chart.js (React 19 compatible)
  const ReconciliationChart = ({ data, isLoading = false }) => {
    // Prepare chart data - Top 10 accounts by variance
    const chartData = useMemo(() => {
      if (!data || !data.rows || data.rows.length === 0) return null;

      const top10 = data.rows.slice(0, 10);

      return {
        labels: top10.map(row => {
          const name = row.adAccountName;
          return name.length > 20 ? name.substring(0, 20) + '...' : name;
        }),
        datasets: [
          {
            label: 'Chi tiêu thực tế',
            data: top10.map(row => row.bankDebit || 0),
            backgroundColor: 'rgba(107, 114, 128, 0.8)',
            borderColor: 'rgba(107, 114, 128, 1)',
            borderWidth: 1,
          },
          {
            label: 'Chi tiêu ghi nhận',
            data: top10.map(row => row.allocatedSpend || 0),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
          },
          {
            label: 'Chênh lệch',
            data: top10.map(row => Math.abs(row.variance || 0)),
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1,
          },
        ],
      };
    }, [data]);

    const chartOptions = useMemo(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              size: 11,
            },
            padding: 10,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            font: {
              size: 10,
            },
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          ticks: {
            font: {
              size: 10,
            },
            callback: function (value) {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
              return value;
            },
          },
        },
      },
    }), []);

    if (isLoading) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-gray-200 rounded w-40 mb-3"></div>
            <div className="h-48 bg-gray-100 rounded"></div>
          </div>
        </div>
      );
    }

    if (!data || !data.rows || data.rows.length === 0 || !chartData) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">📈</span>
            Top 10 TK có chênh lệch cao
          </h3>
          <div className="text-center py-8">
            <p className="text-gray-400 text-xs">Không có dữ liệu</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-lg">📈</span>
          Top 10 TK có chênh lệch cao
        </h3>

        {/* Chart */}
        <div className="mb-4" style={{ height: '300px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>

        {/* Data List */}
        <div className="border-t border-gray-200 pt-3">
          <div className="text-xs font-semibold text-gray-700 mb-2">Danh sách Top 10:</div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {data.rows.slice(0, 10).map((row, index) => (
              <div key={row.adAccountId || index} className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-xs">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate" title={row.adAccountName}>
                    {index + 1}. {row.adAccountName.length > 25 ? row.adAccountName.substring(0, 25) + '...' : row.adAccountName}
                  </div>
                  <div className="text-gray-500 text-[10px] font-mono">{row.adAccountIdNumber}</div>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <div className="font-bold text-red-600">{formatCurrency(Math.abs(row.variance || 0))}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Monthly Summary Table Component
  const MonthlySummaryTable = ({ data, ctvSummary, employeeSummary, expenseSummary, isLoading = false }) => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-40 mb-3"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">📊</span>
            Tổng hợp hàng tháng
          </h3>
          <div className="text-center py-6">
            <p className="text-gray-400 text-xs">Không có dữ liệu</p>
          </div>
        </div>
      );
    }

    const { head, customer, expense, revenue, totalCost } = data;

    const rows = [
      {
        label: "Đầu tổng (Head)",
        opening: head?.opening,
        arisen: head?.amountDue,
        paid: head?.paid,
        closing: head?.closing,
        isBold: true,
        bgColor: "bg-blue-50"
      },
      {
        label: "Khách hàng (Customer)",
        opening: customer?.opening,
        arisen: customer?.amountDue,
        paid: customer?.paid,
        closing: customer?.closing
      },
      {
        label: "Chi phí (Expense)",
        opening: expense?.inflow, // Use inflow/outflow logic if appropriate, but following user request for 4 columns
        arisen: expense?.outflow,
        paid: expense?.net,
        closing: (expense?.inflow || 0) + (expense?.outflow || 0) + (expense?.net || 0), // Placeholder if mapping not clear
        isExpense: true
      }
    ];

    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4">
        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span className="text-lg">📊</span>
            <div>
              <div>Tổng hợp hàng tháng</div>
              <div className="text-xs font-normal text-gray-600 mt-0.5">
                Tháng {filters.month}/{filters.year}
              </div>
            </div>
          </h3>
        </div>

        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Hạng mục</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Đầu kỳ</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Phát sinh</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Thanh toán</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Cuối kỳ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Head Row */}
            <tr>
              <td className="px-3 py-3 whitespace-nowrap text-gray-700">Đầu tổng (Head)</td>
              <td className="px-3 py-3 whitespace-nowrap text-right text-gray-800 font-medium">{formatCurrency(head?.opening)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-right text-red-600 font-bold">{formatCurrency(head?.amountDue)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-right text-green-600 font-bold">{formatCurrency(head?.paid)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-right text-indigo-700 font-bold">{formatCurrency(head?.closing)}</td>
            </tr>
            {/* Customer Row */}
            <tr>
              <td className="px-3 py-3 whitespace-nowrap text-gray-700">Khách hàng (Customer)</td>
              <td className="px-3 py-3 whitespace-nowrap text-right text-gray-800">{formatCurrency(customer?.opening)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-right text-red-600">{formatCurrency(customer?.amountDue)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-right text-green-600">{formatCurrency(customer?.paid)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-right text-gray-800">{formatCurrency(customer?.closing)}</td>
            </tr>
            {/* CTV Row */}
            <tr>
              <td className="px-3 py-3 whitespace-nowrap text-gray-700">Cộng tác viên (CTV)</td>
              <td className="px-3 py-3 whitespace-nowrap text-right text-gray-800">{formatCurrency(ctvSummary?.total?.openingBalance)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-right text-red-600">{formatCurrency(ctvSummary?.total?.commissionAmount)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-right text-green-600">{formatCurrency(ctvSummary?.total?.paidAmount)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-right text-gray-800">{formatCurrency(ctvSummary?.total?.closingBalance)}</td>
            </tr>
            {/* Employee Row */}
            <tr>
              <td className="px-3 py-3 whitespace-nowrap text-gray-700">Nhân viên (Employee)</td>
              <td className="px-3 py-3 whitespace-nowrap text-right text-gray-800">{formatCurrency(employeeSummary?.total?.openingBalance)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-right text-red-600">{formatCurrency(employeeSummary?.total?.debitAmount)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-right text-green-600">{formatCurrency(employeeSummary?.total?.creditAmount)}</td>
              <td className="px-3 py-3 whitespace-nowrap text-right text-gray-800">{formatCurrency(employeeSummary?.total?.closingBalance)}</td>
            </tr>
            {/* Expense Row */}
            {(() => {
              const totalDebit = expenseSummary?.rows?.reduce((sum, item) => sum + (item.debitAmount || 0), 0) || 0;
              const totalCredit = expenseSummary?.rows?.reduce((sum, item) => sum + (item.creditAmount || 0), 0) || 0;
              const totalClosing = totalDebit - totalCredit;
              return (
                <tr>
                  <td className="px-3 py-3 whitespace-nowrap text-gray-700">Chi phí (Expense)</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-gray-800">{formatCurrency(0)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-red-600">{formatCurrency(totalDebit)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-green-600">{formatCurrency(totalCredit)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-gray-800">{formatCurrency(0)}</td>
                </tr>
              );
            })()}
          </tbody>
        </table>

        {/* Footer Metrics */}
        <div className="px-3 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Doanh thu:</span>
            <span className="text-sm font-bold text-green-600">{formatCurrency(revenue)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Tổng giá vốn:</span>
            <span className="text-sm font-bold text-red-600">{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-gray-500 font-medium">Lợi nhuận gộp:</span>
            <span className="text-sm font-bold text-indigo-600">{formatCurrency((revenue || 0) - (totalCost || 0))}</span>
          </div>
        </div>
      </div>
    );
  };

  // Summary Chart Component
  const SummaryChart = ({ head, customer, ctv, employee, expense, isLoading = false }) => {
    // Calculate Expense Totals
    const expenseDebit = expense?.rows?.reduce((sum, item) => sum + (item.debitAmount || 0), 0) || 0;
    const expenseCredit = expense?.rows?.reduce((sum, item) => sum + (item.creditAmount || 0), 0) || 0;
    const expenseClosing = expenseDebit - expenseCredit;

    const chartData = useMemo(() => {
      if (!head && !customer && !ctv && !employee && !expense) return null;

      const labels = ['Head', 'Customer', 'CTV', 'Employee', 'Expense'];

      const openingData = [
        head?.opening || 0,
        customer?.opening || 0,
        ctv?.total?.openingBalance || 0,
        employee?.total?.openingBalance || 0,
        0 // Expense Opening default
      ];

      const arisenData = [
        head?.amountDue || 0,
        customer?.amountDue || 0,
        ctv?.total?.commissionAmount || 0,
        employee?.total?.debitAmount || 0,
        expenseDebit
      ];

      const paidData = [
        head?.paid || 0,
        customer?.paid || 0,
        ctv?.total?.paidAmount || 0,
        employee?.total?.creditAmount || 0,
        expenseCredit
      ];

      const closingData = [
        head?.closing || 0,
        customer?.closing || 0,
        ctv?.total?.closingBalance || 0,
        employee?.total?.closingBalance || 0,
        0 // Expense Closing default as requested
      ];

      return {
        labels,
        datasets: [
          {
            label: 'Đầu kỳ',
            data: openingData,
            backgroundColor: 'rgba(107, 114, 128, 0.7)',
            borderColor: 'rgba(107, 114, 128, 1)',
            borderWidth: 1,
            hidden: true, // Hide by default to reduce clutter
          },
          {
            label: 'Phát sinh',
            data: arisenData,
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1,
          },
          {
            label: 'Thanh toán',
            data: paidData,
            backgroundColor: 'rgba(34, 197, 94, 0.7)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1,
          },
          {
            label: 'Cuối kỳ',
            data: closingData,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
          },
        ],
      };
    }, [head, customer, ctv, employee, expense, expenseDebit, expenseCredit, expenseClosing]);

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 10 }, boxWidth: 10 },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            },
          },
        },
      },
      scales: {
        x: { ticks: { font: { size: 10 } } },
        y: {
          ticks: {
            font: { size: 10 },
            callback: function (value) {
              if (Math.abs(value) >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
              if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K`;
              return value;
            },
          },
        },
      },
    };

    if (isLoading) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm h-80">
          <div className="animate-pulse flex items-end h-full space-x-4 pb-4 px-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-full bg-gray-100 rounded-t-lg" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
            ))}
          </div>
        </div>
      );
    }

    if (!chartData) return null;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-lg">📊</span>
          Biểu đồ tổng hợp
        </h3>
        <div style={{ height: '300px' }}>
          <Bar data={chartData} options={options} />
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header - Compact */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Thống Kê</h1>
            <p className="text-sm text-gray-600">Tháng {filters.month}/{filters.year}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={Object.values(loadingStates).some(v => v)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
        </div>

        {/* Filters - Compact */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 inline-block">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white rounded-md transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2 px-3">
              <Calendar size={16} className="text-gray-500" />
              <span className="font-semibold text-sm">
                Tháng {filters.month}/{filters.year}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white rounded-md transition-all shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Content - 2 Column Layout */}
      <div className="grid grid-cols-10 gap-4">
        {/* Left Column - 60% (6 columns) */}
        <div className="col-span-10 lg:col-span-6 space-y-4">
          {/* Monthly Summary Table */}
          <MonthlySummaryTable
            data={reconciliation}
            ctvSummary={ctvSummary}
            employeeSummary={employeeSummary}
            expenseSummary={expenseSummary}
            isLoading={loadingStates.reconciliation}
          />

          {/* Top Credit & Debt - Side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Credit */}
            <CustomerRankingCard
              customers={topCreditCustomers}
              title="Top khách có dư"
              type="credit"
              isLoading={loadingStates.topCredit}
            />

            {/* Top Debt */}
            <CustomerRankingCard
              customers={topDebtCustomers}
              title="Top khách có nợ"
              type="debt"
              isLoading={loadingStates.topDebt}
            />
          </div>
        </div>

        {/* Right Column - 40% (4 columns) */}
        <div className="col-span-10 lg:col-span-4 space-y-4">
          <SummaryChart
            head={reconciliation?.head}
            customer={reconciliation?.customer}
            ctv={ctvSummary}
            employee={employeeSummary}
            expense={expenseSummary}
            isLoading={loadingStates.reconciliation}
          />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;