import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Offcanvas } from 'react-bootstrap';
import { businessInfo } from '../Constants/BusinessInfo';
import { useAuth } from './useAuth';
import './StaffLayout.css';

// One layout for both dashboards. Each role passes in its own menu ("links").
function StaffLayout({ title, links }) {
  const { profile, role, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const menu = (
    <nav className='staff-menu'>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className='staff-menu-link'
          onClick={() => setMenuOpen(false)}
        >
          <i className={`bi ${link.icon}`}></i>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className='staff-app'>
      {/* Desktop sidebar */}
      <aside className='staff-sidebar d-none d-lg-flex'>
        <div className='staff-brand'>
          <img src={businessInfo.logo} alt='' />
          <span>{title}</span>
        </div>
        {menu}
      </aside>

      {/* Mobile sidebar (slides in) */}
      <Offcanvas show={menuOpen} onHide={() => setMenuOpen(false)} className='staff-offcanvas'>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className='staff-brand'>
            <img src={businessInfo.logo} alt='' />
            <span>{title}</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>{menu}</Offcanvas.Body>
      </Offcanvas>

      <div className='staff-main'>
        <header className='staff-topbar'>
          <button
            type='button'
            className='btn btn-light d-lg-none'
            onClick={() => setMenuOpen(true)}
            aria-label='Open menu'
          >
            <i className='bi bi-list fs-5'></i>
          </button>

          <div className='staff-user ms-auto'>
            <div className='text-end d-none d-sm-block'>
              <div className='fw-semibold'>{profile?.full_name || profile?.email}</div>
              <div className='staff-role-badge'>{role}</div>
            </div>
            <button type='button' className='btn btn-outline-secondary btn-sm' onClick={signOut}>
              <i className='bi bi-box-arrow-right me-1'></i>Sign out
            </button>
          </div>
        </header>

        <main className='staff-content'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StaffLayout;
