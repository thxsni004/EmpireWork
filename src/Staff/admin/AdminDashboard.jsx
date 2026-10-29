import React from 'react';
import { useAuth } from '../useAuth';

function AdminDashboard() {
  const { profile } = useAuth();

  return (
    <>
      <h1 className='staff-page-title'>Welcome, {profile?.full_name || 'Admin'}</h1>
      <p className='text-muted'>Admin dashboard</p>
      <div className='staff-panel text-muted'>
        Summary cards for enquiries, upcoming events, payments, balances and expenses
        will be added in Phase 3.
      </div>
    </>
  );
}

export default AdminDashboard;
