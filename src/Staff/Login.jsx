import React, { useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { businessInfo } from '../Constants/BusinessInfo';
import { useAuth } from './useAuth';
import { roleHome } from './staffMenus';

function Login() {
  const { session, role, loading, signIn, signOut } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setSubmitting(true);
    setError('');
    const loginError = await signIn(email.trim(), password);
    setSubmitting(false);
    if (loginError) {
      // Same message for wrong email or wrong password, so we don't reveal which accounts exist
      setError(
        loginError.message?.includes('Invalid login')
          ? 'Invalid email or password.'
          : 'Login failed. Please check your connection and try again.'
      );
    }
  };

  // Already logged in with a role: go to the right dashboard
  if (session && role) {
    const from = location.state?.from;
    const target = from && from.startsWith(roleHome[role]) ? from : roleHome[role];
    return <Navigate to={target} replace />;
  }

  let content;

  if (!isSupabaseConfigured) {
    content = (
      <div className='alert alert-warning mb-0'>
        The staff portal is not set up yet. Add the Supabase values to the <code>.env</code> file
        (see <code>.env.example</code>) and restart the site.
      </div>
    );
  } else if (loading) {
    content = (
      <div className='text-center py-4'>
        <Spinner animation='border' className='text-secondary' />
      </div>
    );
  } else if (session && !role) {
    // Logged in, but the account has no role or was switched off
    content = (
      <>
        <div className='alert alert-warning'>
          Your account does not have access to the staff portal. Please contact an administrator.
        </div>
        <button type='button' className='btn btn-outline-secondary w-100' onClick={signOut}>
          Sign out
        </button>
      </>
    );
  } else {
    content = (
      <form onSubmit={handleSubmit} noValidate>
        {error && <div className='alert alert-danger py-2' role='alert'>{error}</div>}
        <div className='mb-3'>
          <label htmlFor='staff-email' className='form-label'>Email</label>
          <input
            id='staff-email'
            type='email'
            className='form-control'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete='username'
            autoFocus
          />
        </div>
        <div className='mb-4'>
          <label htmlFor='staff-password' className='form-label'>Password</label>
          <input
            id='staff-password'
            type='password'
            className='form-control'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete='current-password'
          />
        </div>
        <button type='submit' className='btn-brand w-100' disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    );
  }

  return (
    <div className='staff-login-page'>
      <div className='staff-login-card'>
        <img src={businessInfo.logo} alt={businessInfo.name} className='staff-login-logo' />
        <h1>Staff Portal</h1>
        <p className='text-muted small mb-4'>Authorised Empire Events staff only</p>
        {content}
        <Link to='/' className='staff-back-link'>← Back to website</Link>
      </div>
    </div>
  );
}

export default Login;
