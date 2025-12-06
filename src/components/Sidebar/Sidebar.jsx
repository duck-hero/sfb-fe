import { Link, useLocation } from "react-router-dom";
import sfbLogo from "../../assets/sfb-logo.png";
import { LayoutDashboard, Users, FolderCog, History, ChevronLeft, ChevronRight } from "lucide-react";

const Sidebar = ({ onToggle, isCollapsed }) => {
  const { pathname } = useLocation();

  const active = "bg-blue-100 font-semibold";

  return (
    <div className={`h-screen bg-white shadow-md fixed left-0 top-0 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-20 p-3' : 'w-64 p-5'
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
          className={`flex items-center ${isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-3'} rounded-lg hover:bg-gray-100 transition-all duration-300 min-h-[48px] ${
            pathname === "/" && active
          }`}
          title={isCollapsed ? "Dashboard" : ""}
        >
          <LayoutDashboard size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Dashboard</span>}
        </Link>

        <Link
          to="/bank-management"
          className={`flex items-center ${isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-3'} rounded-lg hover:bg-gray-100 transition-all duration-300 min-h-[48px] ${
            pathname === "/bank-management" && active
          }`}
          title={isCollapsed ? "Ngân hàng" : ""}
        >
          <FolderCog size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Ngân hàng</span>}
        </Link>

        {/* <Link
          to="/bank-account-management"
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 ${
            pathname === "/sample" && active
          }`}
        >
          <IdCard /> Quản lý tài khoản ngân hàng
        </Link>
        <Link
          to="/bank-card-management"
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 ${
            pathname === "/sample" && active
          }`}
        >
          <CreditCard /> Quản lý thẻ ngân hàng
        </Link> */}
        <Link
          to="/bm-management"
          className={`flex items-center ${isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-3'} rounded-lg hover:bg-gray-100 transition-all duration-300 min-h-[48px] ${
            pathname === "/bm-management" && active
          }`}
          title={isCollapsed ? "Quản lý FB" : ""}
        >
          <Users size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Quản lý FB</span>}
        </Link>
        <Link
          to="/transaction-history"
          className={`flex items-center ${isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-3 py-3'} rounded-lg hover:bg-gray-100 transition-all duration-300 min-h-[48px] ${
            pathname === "/transaction-history" && active
          }`}
          title={isCollapsed ? "Lịch sử giao dịch" : ""}
        >
          <History size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="truncate">Lịch sử giao dịch</span>}
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
