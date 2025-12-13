import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Forbidden from '../pages/Forbidden';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, hasRole } = useAuth(); // Lấy trạng thái người dùng từ AuthContext

  // Kiểm tra xem người dùng đã đăng nhập chưa
  if (!user) {
    // Nếu chưa đăng nhập, chuyển hướng về trang /login
    // replace={true} thay thế entry hiện tại trong history stack.
    return <Navigate to="/login" replace />;
  }

  // Nếu có yêu cầu role, kiểm tra xem user có quyền không
  if (allowedRoles && allowedRoles.length > 0) {
    // Nếu không có role nào khớp, hiển thị trang 403
    const hasPermission = allowedRoles.some((role) => hasRole(role));
    if (!hasPermission) {
      return <Forbidden />;
    }
  }

  // Nếu đã đăng nhập và đủ quyền, hiển thị các tuyến đường con (sử dụng Outlet)
  // Trong trường hợp này là MainLayout và các Route con bên trong nó.
  return <Outlet />;
}