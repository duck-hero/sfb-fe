import { Link, useLocation } from "react-router-dom";
import sfbLogo from "../../assets/sfb-logo.png";
import { Landmark, LayoutDashboard, IdCard, CreditCard, Facebook, UserCog, FolderCog    } from "lucide-react";

const Sidebar = () => {
  const { pathname } = useLocation();

  const active = "bg-blue-100 font-semibold";

  return (
    <div className="w-64 h-screen bg-white shadow-md fixed left-0 top-0 p-5">
      <div className="flex items-center gap-3 mb-10">
        <img src={sfbLogo} alt="Logo" className="h-10 w-auto" />
        <h1 className="text-2xl font-bold text-primary-darkest">sFacebook</h1>
      </div>

      <nav className="space-y-2">
        <Link
          to="/"
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 ${
            pathname === "/" && active
          }`}
        >
          <LayoutDashboard /> Dashboard
        </Link>

        <Link
          to="/bank-management"
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 ${
            pathname === "/sample" && active
          }`}
        >
          <FolderCog  /> Ngân hàng
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
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 ${
            pathname === "/sample" && active
          }`}
        >
          <Facebook  /> Quản lý FB 
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
