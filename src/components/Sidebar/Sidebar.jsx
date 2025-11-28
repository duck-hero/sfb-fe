import { Link, useLocation } from "react-router-dom";
import { FiHome, FiFileText } from "react-icons/fi";

const Sidebar = () => {
  const { pathname } = useLocation();

  const active = "bg-blue-100 font-semibold";

  return (
    <div className="w-64 h-screen bg-white shadow-md fixed left-0 top-0 p-5">
      <h1 className="text-2xl font-bold mb-10">Modernize</h1>

      <nav className="space-y-2">
        <Link
          to="/"
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 ${
            pathname === "/" && active
          }`}
        >
          <FiHome /> Dashboard
        </Link>

        <Link
          to="/sample"
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 ${
            pathname === "/sample" && active
          }`}
        >
          <FiFileText /> Sample Page
        </Link>

        <Link
          to="/login"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
        >
          Login
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
