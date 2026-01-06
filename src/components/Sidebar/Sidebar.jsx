import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import sfbLogo from "../../assets/sfb-logo.png";
import { LayoutDashboard, Mountain, Landmark, History, ChevronLeft, ChevronRight, UsersRound, Shield, ChevronDown, PieChart, Receipt, Database, LayoutList } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ onToggle, isCollapsed }) => {
  const { pathname } = useLocation();
  const { hasRole } = useAuth();
  
  const isTotalHeadPath = pathname.startsWith("/statistics/source-debt") || 
                         pathname.startsWith("/statistics/threshold") || 
                         pathname === "/bm-source-management";
                         
  const [isTotalExpanded, setIsTotalExpanded] = useState(isTotalHeadPath);

  // Open submenu automatically if pathname matches sub-items
  useEffect(() => {
    if (isTotalHeadPath && !isCollapsed) {
      setIsTotalExpanded(true);
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

        <Link
          to="/bank-management"
          className={`flex items-center ${isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-3'} rounded-lg hover:bg-gray-100 transition-all duration-300 min-h-[48px] ${pathname === "/bank-management" && active
            }`}
          title={isCollapsed ? "Ngân hàng" : ""}
        >
          <Landmark size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Ngân hàng</span>}
        </Link>

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
              <Link
                to="/statistics/threshold"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs hover:bg-gray-100 transition-all ${pathname === "/statistics/threshold" && active}`}
              >
                <PieChart size={14} />
                <span>Thống kê ngưỡng</span>
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
        <Link
          to="/transaction-history"
          className={`flex items-center ${isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-3'} rounded-lg hover:bg-gray-100 transition-all duration-300 min-h-[48px] ${pathname === "/transaction-history" && active
            }`}
          title={isCollapsed ? "Giao dịch" : ""}
        >
          <History size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Giao dịch</span>}
        </Link>

        <Link
          to="/customer-management"
          className={`flex items-center ${isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-3'} rounded-lg hover:bg-gray-100 transition-all duration-300 min-h-[48px] ${pathname === "/customer-management" && active
            }`}
          title={isCollapsed ? "Khách hàng" : ""}
        >
          <UsersRound size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Khách hàng</span>}
        </Link>

        {/* Chỉ hiển thị cho Admin */}
        {(hasRole('Admin')) && (
          <Link
            to="/user-management"
            className={`flex items-center ${isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-3'} rounded-lg hover:bg-gray-100 transition-all duration-300 min-h-[48px] ${pathname === "/user-management" && active
              }`}
            title={isCollapsed ? "Phân quyền" : ""}
          >
            <Shield size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="truncate">Phân quyền</span>}
          </Link>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
