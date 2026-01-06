import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../pages/Login/Login";

import MainLayout from "../layouts/MainLayout";
import UserInfo from "../pages/UserSettings/UserInfo";
import Verify2FA from "../pages/Login/Verify2FA";
// import BankList from "../pages/BankManage/BankList";
// import BankAccountList from "../pages/BankAccountManage/BankAccountList";
// import BankCardList from "../pages/BankCardManage/BankCardList";
import ProtectedRoute from "../context/ProtectedRoute";
import BmSourceList from "../pages/BmSourceManage/BmSourceList";
// import BmAccountList from "../pages/BmAccountManage/BmAccountList";
import BMManage from "../pages/BmManager/BMManage";
import BankManagePage from "../pages/BankManagePage/BankManagePage";
import TransactionManage from "../pages/TransactionManage/TransactionManage";
import CustomerManagementPage from "../pages/CustomerManage/CustomerManagementPage";
import MonthlySourceStats from "../pages/BmSourceManage/MonthlySourceStats";
import UserList from "../pages/UserManage/UserList";
import Dashboard from "../pages/Dashboard/Dashboard";
import BankCardStatistics from "../pages/Statistics/components/BankCardStatistics";
import TransactionStatistics from "../pages/TransactionManage/TransactionStatistics";
import AdAccountAuditReport from "../pages/CustomerManage/AdAccountAuditReport";
import ThresholdStats from "../pages/AdsAccountManage/ThresholdStats";

// 1. Import ProtectedRoute

export default function AppRoutes() {
  return (
    <BrowserRouter>
      {/* ĐẶT TOAST CONTAINER Ở ĐÂY 
         Nó nằm ngoài <Routes>, nên khi chuyển trang nó vẫn đứng yên đó
         và không bị mất đi khi component con unmount/loading.
      */}
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Routes>
        {/*
          2. Tuyến đường cha dùng ProtectedRoute
          - Các tuyến đường con bên trong nó sẽ được bảo vệ.
          - Khi người dùng truy cập bất kỳ tuyến đường nào bên dưới, 
            ProtectedRoute sẽ chạy và kiểm tra user.
        */}
        <Route element={<ProtectedRoute />}>
          {/*
            3. Tuyến đường cha cho layout (MainLayout)
            - Tuyến đường này phải là con của ProtectedRoute.
            - Các Route con bên trong nó sẽ được hiển thị bên trong MainLayout 
              (vì MainLayout có dùng Outlet).
          */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="bank-management" element={<BankManagePage />} />
            {/* <Route
              path="bank-account-management"
              element={<BankAccountList />}
            />
            <Route path="bank-card-management" element={<BankCardList />} /> */}
            <Route path="bm-management" element={<BMManage />} />
            <Route path="bm-source-management" element={<BmSourceList />} />
            {/* Chỉ Admin và Kế Toán mới xem được lịch sử giao dịch */}
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Kế Toán', 'Kế Toán Tiền']} />}>
              <Route path="transaction-history" element={<TransactionManage />} />
            </Route>
            {/* Chỉ Admin và Kế Toán Công Nợ mới có quyền truy cập */}
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Kế Toán Công Nợ']} />}>
              <Route path="customer-management" element={<CustomerManagementPage />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="user-management" element={<UserList />} />
            </Route>
            <Route path="statistics">
              <Route path="threshold" element={<ThresholdStats />} />
              <Route path="source-debt" element={<MonthlySourceStats />} />
            </Route>
          </Route>

          {/* 4. Tuyến đường cài đặt /settings cũng cần được bảo vệ */}
          <Route path="/settings" element={<UserInfo />} />
        </Route>

        {/* 5. Tuyến đường Login và Verify2FA không cần bảo vệ (công khai) */}
        <Route path="/login" element={<Login />} />
        <Route path="/verify-2fa" element={<Verify2FA />} />
      </Routes>
    </BrowserRouter>
  );
}
