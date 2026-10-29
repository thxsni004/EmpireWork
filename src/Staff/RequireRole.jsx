import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from './useAuth';
import { roleHome } from './staffMenus';

// Wraps private pages. Sends people who are not logged in to the login page,
// and people with a different role to their own dashboard.
// This is for a smooth experience only - the database rules are the real lock.
function RequireRole({ role }) {
  const { session, role: userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className='staff-center'>
        <Spinner animation='border' role='status' className='text-secondary' />
      </div>
    );
  }

  if (!session || !userRole) {
    return <Navigate to='/staff/login' replace state={{ from: location.pathname }} />;
  }

  if (userRole !== role) {
    return <Navigate to={roleHome[userRole]} replace />;
  }

  return <Outlet />;
}

export default RequireRole;
