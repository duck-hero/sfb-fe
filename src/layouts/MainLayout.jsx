import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";

const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const sidebarWidth = isSidebarCollapsed ? "5rem" : "16rem"; // 80px : 256px

  return (
    <div className="flex">
      <Sidebar onToggle={handleSidebarToggle} isCollapsed={isSidebarCollapsed} />

      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <Navbar
          hasSidebar={true}
          sidebarWidth={sidebarWidth}
        />
        <div className="pt-14 p-6 bg-gray-100 min-h-screen">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
