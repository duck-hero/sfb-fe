import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login/Login';

import MainLayout from '../layouts/MainLayout';
import UserInfo from '../pages/UserSettings/UserInfo';
import Verify2FA from '../pages/Login/Verify2FA';
import BankList from '../pages/BankManage/BankList';
import BankAccountList from '../pages/BankAccountManage/BankAccountList';

export default function AppRoutes() {
  return (
     <BrowserRouter>
      <Routes>
         <Route path="/" element={<MainLayout />}>
        {/* <Route index element={<Dashboard />} />
        <Route path="sample" element={<SamplePage />} /> */}
          <Route path="bank-management" element={<BankList />} />
             <Route path="bank-account-management" element={<BankAccountList />} />
      </Route>
        <Route path="/login" element={<Login />} />
            <Route path="/verify-2fa" element={<Verify2FA />} />
          <Route path="/settings" element={<UserInfo />} />
      </Routes>
    </BrowserRouter>
  );
}