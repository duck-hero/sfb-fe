import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';


/**
 * Component bảo vệ tuyến đường (Route).
 * Nếu người dùng chưa đăng nhập, chuyển hướng về trang /login.
 * Nếu đã đăng nhập, hiển thị nội dung tuyến đường con.
 * @param {object} props - Các props truyền vào (hiện tại không dùng explicit props).
 */
export default function ProtectedRoute() {
  const { user } = useAuth(); // Lấy trạng thái người dùng từ AuthContext

  // Kiểm tra xem người dùng đã đăng nhập chưa
  if (!user) {
    // Nếu chưa đăng nhập, chuyển hướng về trang /login
    // replace={true} thay thế entry hiện tại trong history stack.
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, hiển thị các tuyến đường con (sử dụng Outlet)
  // Trong trường hợp này là MainLayout và các Route con bên trong nó.
  return <Outlet />;
}