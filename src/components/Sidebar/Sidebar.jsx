import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import sfbLogo from "../../assets/sfb-logo.png";
import { LayoutDashboard, Mountain, Landmark, History, ChevronLeft, ChevronRight, UsersRound, Shield, ChevronDown, PieChart, Receipt, Database, LayoutList, TrendingUp, Users, FileUser, CreditCard, BadgeCent, FileSpreadsheet, FileBox, HandCoins } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ onToggle, isCollapsed }) => {
  const { pathname } = useLocation();
  const { hasRole } = useAuth();
  
  const isTotalHeadPath = pathname.startsWith("/statistics/source-debt") || 
                         pathname === "/bm-source-management";
  
  const isRevenuePath = pathname === "/statistics/fee-profit-matrix" || pathname === "/statistics/threshold";
  const isEmployeePath = pathname === "/user-management" || pathname === "/statistics/employee-debt" || pathname === "/statistics/employee-sales";
  const isBankPath = pathname === "/transaction-history" || pathname.startsWith("/bank-management");
  const isCustomerPath = pathname.startsWith("/customer-management");
                         
  const [isTotalExpanded, setIsTotalExpanded] = useState(isTotalHeadPath);
  const [isRevenueExpanded, setIsRevenueExpanded] = useState(isRevenuePath);
  const [isEmployeeExpanded, setIsEmployeeExpanded] = useState(isEmployeePath);
  const [isBankExpanded, setIsBankExpanded] = useState(isBankPath);
  const [isCustomerExpanded, setIsCustomerExpanded] = useState(isCustomerPath);

  // Open submenu automatically if pathname matches sub-items
  useEffect(() => {
    if (isTotalHeadPath && !isCollapsed) {
      setIsTotalExpanded(true);
    }
    if (isRevenuePath && !isCollapsed) {
      setIsRevenueExpanded(true);
    }
    if (isEmployeePath && !isCollapsed) {
      setIsEmployeeExpanded(true);
    }
    if (isBankPath && !isCollapsed) {
      setIsBankExpanded(true);
    }
    if (isCustomerPath && !isCollapsed) {
      setIsCustomerExpanded(true);
    }
  }, [pathname, isCollapsed]);

  const active = "bg-blue-100 font-semibold";

  return (
    <div className={`h-screen bg-white shadow-md fixed left-0 top-0 transition-all duration-300 ease-in-out z-[40] ${isCollapsed ? 'w-20 p-3' : 'w-64 p-5'
      }`}>
      {/* Toggle Button - căn giữa chiều cao sidebar */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors z-10"
        title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className={`flex items-center gap-3 mb-10 ${isCollapsed ? 'justify-center' : ''}`}>
        <img src={sfbLogo} alt="Logo" className="h-10 w-auto" />
        {!isCollapsed && <h1 className="text-2xl font-bold text-primary-darkest">sFacebook</h1>}
      </div>

      <nav className="space-y-2">
        <Link
          to="/"
          className={`flex items-center ${isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-3'} rounded-lg hover:bg-gray-100 transition-all duration-300 min-h-[48px] ${pathname === "/" && active
            }`}
          title={isCollapsed ? "Dashboard" : ""}
        >
          <LayoutDashboard size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Dashboard</span>}
        </Link>

        {/* Ngân hàng - Submenu */}
        <div>
          <button
            onClick={() => !isCollapsed && setIsBankExpanded(!isBankExpanded)}
            className={`w-full flex items-center justify-between rounded-lg hover:bg-gray-100 transition-all duration-300 min-h-[48px] ${isBankPath && !isBankExpanded && active} ${isCollapsed ? 'justify-center px-3 py-3' : 'px-3 py-3'}`}
            title={isCollapsed ? "Ngân hàng" : ""}
          >
            <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
              <Landmark size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="truncate">Ngân hàng</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${isBankExpanded ? 'rotate-180' : ''}`}
              />
            )}
          </button>

          {!isCollapsed && isBankExpanded && (
            <div className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1 animate-in slide-in-from-top-2 duration-200">
              <Link
                to="/bank-management/banks"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/bank-management/banks" && active}`}
              >
                <Landmark size={14} />
                <span>Danh sách ngân hàng</span>
              </Link>
              <Link
                to="/bank-management/accounts"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/bank-management/accounts" && active}`}
              >
                <FileUser size={14} />
                <span>Tài khoản ngân hàng</span>
              </Link>
              <Link
                to="/bank-management/cards"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/bank-management/cards" && active}`}
              >
                <CreditCard size={14} />
                <span>Thẻ ngân hàng</span>
              </Link>
              <Link
                to="/bank-management/statistics"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/bank-management/statistics" && active}`}
              >
                <BadgeCent size={14} />
                <span>Thống kê thẻ</span>
              </Link>
              <Link
                to="/transaction-history"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/transaction-history" && active}`}
              >
                <History size={14} />
                <span>Lịch sử giao dịch</span>
              </Link>
            </div>
          )}
        </div>

        {/* Đầu tổng - Submenu */}
        <div>
          <button
            onClick={() => !isCollapsed && setIsTotalExpanded(!isTotalExpanded)}
            className={`w-full flex items-center justify-between rounded-lg hover:bg-gray-100 transition-all duration-300 min-h-[48px] ${isTotalHeadPath && !isTotalExpanded && active} ${isCollapsed ? 'justify-center px-3 py-3' : 'px-3 py-3'}`}
            title={isCollapsed ? "Đầu tổng" : ""}
          >
            <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
              <Database size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="truncate">Đầu tổng</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${isTotalExpanded ? 'rotate-180' : ''}`}
              />
            )}
          </button>

          {!isCollapsed && isTotalExpanded && (
            <div className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1 animate-in slide-in-from-top-2 duration-200">
              <Link
                to="/bm-source-management"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/bm-source-management" && active}`}
              >
                <LayoutList size={14} />
                <span>Nguồn (Đầu tổng)</span>
              </Link>
              <Link
                to="/statistics/source-debt"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/statistics/source-debt" && active}`}
              >
                <Receipt size={14} />
                <span>Công nợ Đầu tổng</span>
              </Link>
            </div>
          )}
        </div>

        {/* Doanh thu & lợi nhuận - Submenu */}
        <div>
          <button
            onClick={() => !isCollapsed && setIsRevenueExpanded(!isRevenueExpanded)}
            className={`w-full flex items-center justify-between rounded-lg hover:bg-gray-100 transition-all duration-300 min-h-[48px] ${isRevenuePath && !isRevenueExpanded && active} ${isCollapsed ? 'justify-center px-3 py-3' : 'px-3 py-3'}`}
            title={isCollapsed ? "Doanh thu & lợi nhuận" : ""}
          >
            <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
              <PieChart size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="truncate">Lợi nhuận & Chi phí</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${isRevenueExpanded ? 'rotate-180' : ''}`}
              />
            )}
          </button>

          {!isCollapsed && isRevenueExpanded && (
            <div className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1 animate-in slide-in-from-top-2 duration-200">
              <Link
                to="/statistics/fee-profit-matrix"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/statistics/fee-profit-matrix" && active}`}
              >
                <PieChart size={14} className="text-green-500" />
                <span>Lợi nhuận phí</span>
              </Link>
              <Link
                to="/statistics/threshold"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/statistics/threshold" && active}`}
              >
                <PieChart size={14} className="text-orange-500" />
                <span>Thống kê ngưỡng</span>
              </Link>
              <Link
                to="/statistics/expense-accounting"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/statistics/expense-accounting" && active}`}
              >
                <HandCoins size={14} className="text-red-500" />
                <span>Thống kê chi phí</span>
              </Link>
            </div>
          )}
        </div>
        
        <Link
          to="/bm-management"
          className={`flex items-center ${isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-3'} rounded-lg hover:bg-gray-100 transition-all duration-300 min-h-[48px] ${pathname === "/bm-management" && active
            }`}
          title={isCollapsed ? "Quản lý FB" : ""}
        >
          <Mountain size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Quản lý FB</span>}
        </Link>

        {/* Khách hàng - Submenu */}
        <div>
          <button
            onClick={() => !isCollapsed && setIsCustomerExpanded(!isCustomerExpanded)}
            className={`w-full flex items-center justify-between rounded-lg hover:bg-gray-100 transition-all duration-300 min-h-[48px] ${isCustomerPath && !isCustomerExpanded && active} ${isCollapsed ? 'justify-center px-3 py-3' : 'px-3 py-3'}`}
            title={isCollapsed ? "Khách hàng" : ""}
          >
            <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
              <UsersRound size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="truncate">Khách hàng</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${isCustomerExpanded ? 'rotate-180' : ''}`}
              />
            )}
          </button>

          {!isCollapsed && isCustomerExpanded && (
            <div className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1 animate-in slide-in-from-top-2 duration-200">
              <Link
                to="/customer-management/list"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/customer-management/list" && active}`}
              >
                <UsersRound size={14} />
                <span>Khách hàng</span>
              </Link>
              <Link
                to="/customer-management/groups"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/customer-management/groups" && active}`}
              >
                <Users size={14} className="text-blue-500" />
                <span>Nhóm khách hàng</span>
              </Link>
              <Link
                to="/customer-management/collaborators"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/customer-management/collaborators" && active}`}
              >
                <Users size={14} className="text-green-500" />
                <span>CTV</span>
              </Link>
              <Link
                to="/customer-management/reconciliation"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/customer-management/reconciliation" && active}`}
              >
                <FileSpreadsheet size={14} />
                <span>Tổng hợp công nợ</span>
              </Link>
              <Link
                to="/customer-management/ctv-stats"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/customer-management/ctv-stats" && active}`}
              >
                <TrendingUp size={14} className="text-purple-500" />
                <span>Thống kê CTV</span>
              </Link>
              <Link
                to="/customer-management/audit"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/customer-management/audit" && active}`}
              >
                <FileBox size={14} />
                <span>BC đối soát</span>
              </Link>
            </div>
          )}
        </div>
        
        {/* Nhân viên - Submenu */}
        <div>
          <button
            onClick={() => !isCollapsed && setIsEmployeeExpanded(!isEmployeeExpanded)}
            className={`w-full flex items-center justify-between rounded-lg hover:bg-gray-100 transition-all duration-300 min-h-[48px] ${isEmployeePath && !isEmployeeExpanded && active} ${isCollapsed ? 'justify-center px-3 py-3' : 'px-3 py-3'}`}
            title={isCollapsed ? "Nhân viên" : ""}
          >
            <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
              <Users size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="truncate">Nhân viên</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${isEmployeeExpanded ? 'rotate-180' : ''}`}
              />
            )}
          </button>

          {!isCollapsed && isEmployeeExpanded && (
            <div className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1 animate-in slide-in-from-top-2 duration-200">
              <Link
                to="/statistics/employee-debt"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/statistics/employee-debt" && active}`}
              >
                <Receipt size={14} className="text-orange-500" />
                <span>Công nợ nhân viên</span>
              </Link>
              
              <Link
                to="/statistics/employee-sales"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/statistics/employee-sales" && active}`}
              >
                <TrendingUp size={14} className="text-blue-500" />
                <span>BC doanh số</span>
              </Link>
              
              {(hasRole('Admin')) && (
                <Link
                  to="/user-management"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/user-management" && active}`}
                >
                  <Shield size={14} className="text-red-500" />
                  <span>Phân quyền</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
