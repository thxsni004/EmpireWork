import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import RequireRole from './RequireRole';
import StaffLayout from './StaffLayout';
import Login from './Login';
import ComingSoon from './ComingSoon';
import AdminDashboard from './admin/AdminDashboard';
import AccountantDashboard from './accountant/AccountantDashboard';
import { adminLinks, accountantLinks } from './staffMenus';

// All /staff/... pages. This file (and everything it imports) is only
// downloaded when someone opens a /staff page, not by normal visitors.
function StaffRoutes() {
  // Ask search engines not to list staff pages
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <AuthProvider>
      <Routes>
        <Route index element={<Navigate to='login' replace />} />
        <Route path='login' element={<Login />} />

        {/* Admin area */}
        <Route element={<RequireRole role='admin' />}>
          <Route path='admin' element={<StaffLayout title='Admin' links={adminLinks} />}>
            <Route index element={<AdminDashboard />} />
            <Route path='enquiries' element={<ComingSoon title='Enquiries' phase={3} />} />
            <Route path='events' element={<ComingSoon title='Events' phase={3} />} />
            <Route path='gallery' element={<ComingSoon title='Gallery' phase={3} />} />
            <Route path='staff' element={<ComingSoon title='Staff' phase={3} />} />
          </Route>
        </Route>

        {/* Accountant area */}
        <Route element={<RequireRole role='accountant' />}>
          <Route path='accountant' element={<StaffLayout title='Accounts' links={accountantLinks} />}>
            <Route index element={<AccountantDashboard />} />
            <Route path='payments' element={<ComingSoon title='Payments' phase={4} />} />
            <Route path='expenses' element={<ComingSoon title='Expenses' phase={4} />} />
            <Route path='reports' element={<ComingSoon title='Reports' phase={4} />} />
          </Route>
        </Route>

        {/* Any other /staff/... address goes to login */}
        <Route path='*' element={<Navigate to='/staff/login' replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default StaffRoutes;
