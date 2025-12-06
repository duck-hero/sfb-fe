import { Link, useNavigate } from "react-router-dom";

import { FaUserAlt } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { IoSettingsSharp, IoLogOut } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import sfbLogo from '../../assets/sfb-logo.png';

const Navbar = ({ hasSidebar = true, sidebarWidth = "16rem" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
<div
  className={`h-12 bg-white shadow-sm flex items-center px-6 fixed top-0 z-50 transition-all duration-300 ease-in-out
    ${hasSidebar ? "justify-end" : "justify-between"}`}
  style={{
    left: hasSidebar ? sidebarWidth : 0,
    width: hasSidebar ? `calc(100% - ${sidebarWidth})` : "100%",
  }}
>
  {/* Nếu không có sidebar → hiện logo bên trái */}
  {!hasSidebar && (
    <div
      className="flex items-center h-full cursor-pointer"
      onClick={() => navigate("/")}
    >
      <img src={sfbLogo} alt="Logo" className="h-10 w-auto" />
    </div>
  )}

  {/* USER MENU — luôn nằm bên phải */}
  {user ? (
    <div className="relative flex items-center gap-3" ref={dropdownRef}>
      <span
        className="flex items-center cursor-pointer gap-2 font-medium"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <FaUserAlt className="text-gray-600" />
        {user.userName || "User"}
      </span>

      <Transition
        show={dropdownOpen}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="absolute right-0 top-12 w-48 bg-white border shadow-md rounded-md py-2 z-50">
          <Link
            to="/settings"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setDropdownOpen(false)}
          >
            <IoSettingsSharp /> Cài đặt
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <IoLogOut /> Logout
          </button>
        </div>
      </Transition>
    </div>
  ) : (
    <Link to="/login">
      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
        Login
      </button>
    </Link>
  )}
</div>


  );
};

export default Navbar;
