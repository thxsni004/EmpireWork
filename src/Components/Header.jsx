import React, { useState } from 'react'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import { businessInfo, whatsappLink, emailLink } from '../Constants/BusinessInfo';
import './Header.css'

// Links shown in the menu. "/#about" means: go to the home page, then scroll to id="about".
const menuLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/#about' },
  { label: 'Services', to: '/#services' },
  { label: 'Portfolio', to: '/#portfolio' },
  { label: 'Gallery', to: '/portfolio' },
  { label: 'Contact', to: '/contact' },
];

function Header() {
  // Controls whether the mobile menu is open, so it can close after a link is clicked
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Thin top bar with social links */}
      <div className='top-bar'>
        <Container className='d-flex justify-content-between align-items-center'>
          <span className='top-bar-text d-none d-sm-inline'>
            <i className='bi bi-telephone me-1'></i> {businessInfo.phone}
          </span>
          <div className='d-flex gap-3 ms-auto'>
            <a href={businessInfo.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <i className="bi bi-instagram"></i>
            </a>
            <a href={whatsappLink} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <i className="bi bi-whatsapp"></i>
            </a>
            <a href={emailLink} aria-label="Email">
              <i className="bi bi-envelope"></i>
            </a>
          </div>
        </Container>
      </div>

      <Navbar expand="lg" sticky="top" className='main-navbar' expanded={menuOpen} onToggle={setMenuOpen}>
        <Container>
          <Navbar.Brand as={Link} to="/" className='nav-brand' onClick={closeMenu}>
            <img src={businessInfo.logo} alt={businessInfo.name} />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-menu" className='menu-toggle' />

          <Navbar.Collapse id="main-menu">
            <Nav className='ms-auto align-items-lg-center gap-lg-2'>
              {menuLinks.map((link) => (
                <Nav.Link key={link.label} as={Link} to={link.to} className='menu-link' onClick={closeMenu}>
                  {link.label}
                </Nav.Link>
              ))}
              <Link to="/contact" className='btn-brand ms-lg-3 mt-2 mt-lg-0 mb-3 mb-lg-0' onClick={closeMenu}>
                Book Now
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}

export default Header
