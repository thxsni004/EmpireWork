import React from 'react';
import { useAuth } from '../useAuth';

function AccountantDashboard() {
  const { profile } = useAuth();

  return (
    <>
      <h1 className='staff-page-title'>Welcome, {profile?.full_name || 'Accountant'}</h1>
      <p className='text-muted'>Accounts dashboard</p>
      <div className='staff-panel text-muted'>
        Totals for payments received, outstanding balances, expenses and net cash
        will be added in Phase 4.
      </div>
    </>
  );
}

export default AccountantDashboard;
