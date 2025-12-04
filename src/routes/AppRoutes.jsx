// import React from 'react'
// import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import Login from '../pages/Login/Login';

// import MainLayout from '../layouts/MainLayout';
// import UserInfo from '../pages/UserSettings/UserInfo';
// import Verify2FA from '../pages/Login/Verify2FA';
// import BankList from '../pages/BankManage/BankList';
// import BankAccountList from '../pages/BankAccountManage/BankAccountList';
// import BankCardList from '../pages/BankCardManage/bankCardList';

// export default function AppRoutes() {
//   return (
//      <BrowserRouter>
//       <Routes>
//          <Route path="/" element={<MainLayout />}>
//         {/* <Route index element={<Dashboard />} />
//         <Route path="sample" element={<SamplePage />} /> */}
//           <Route path="bank-management" element={<BankList />} />
//              <Route path="bank-account-management" element={<BankAccountList />} />
//                <Route path="bank-card-management" element={<BankCardList />} />
//       </Route>
//         <Route path="/login" element={<Login />} />
//             <Route path="/verify-2fa" element={<Verify2FA />} />
//           <Route path="/settings" element={<UserInfo />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../pages/Login/Login";

import MainLayout from "../layouts/MainLayout";
import UserInfo from "../pages/UserSettings/UserInfo";
import Verify2FA from "../pages/Login/Verify2FA";
import BankList from "../pages/BankManage/BankList";
import BankAccountList from "../pages/BankAccountManage/BankAccountList";
import BankCardList from "../pages/BankCardManage/bankCardList";
import ProtectedRoute from "../context/ProtectedRoute";
import BmSourceList from "../pages/BmSourceManage/BmSourceList";
import BmAccountList from "../pages/BmAccountManage/BmAccountList";

// 1. Import ProtectedRoute

export default function AppRoutes() {
  return (
    <BrowserRouter>
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
            {/* <Route index element={<Dashboard />} /> */}
            <Route path="bank-management" element={<BankList />} />
            <Route
              path="bank-account-management"
              element={<BankAccountList />}
            />
            <Route path="bank-card-management" element={<BankCardList />} />
            <Route path="/bm-source-management" element={<BmSourceList />} />
            <Route path="/bm-account-management" element={<BmAccountList />} />
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
