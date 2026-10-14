import React from 'react'
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { businessInfo, whatsappLink, emailLink } from '../Constants/BusinessInfo';
import './Footer.css'

function Footer() {
  return (
    <footer className='site-footer'>
      <Container>
        <Row className='g-4'>
          <Col xs={12} md={5}>
            <img src={businessInfo.logo} alt={businessInfo.name} className='footer-logo mb-3' />
            <p className='footer-text'>
              Make your special moments truly unforgettable with our expert planning services.
            </p>
          </Col>

          <Col xs={6} md={3}>
            <h5 className='footer-heading'>Quick Links</h5>
            <ul className='footer-links'>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/#about">About</Link></li>
              <li><Link to="/#services">Services</Link></li>
              <li><Link to="/portfolio">Gallery</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </Col>

          <Col xs={6} md={4}>
            <h5 className='footer-heading'>Get in Touch</h5>
            <ul className='footer-links'>
              <li>
                <a href={`tel:${businessInfo.phone}`}><i className='bi bi-telephone me-2'></i>{businessInfo.phone}</a>
              </li>
              <li>
                <a href={emailLink} className='text-break'><i className='bi bi-envelope me-2'></i>{businessInfo.email}</a>
              </li>
            </ul>
            <div className='footer-social'>
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
          </Col>
        </Row>

        <div className='footer-bottom'>
          © {new Date().getFullYear()} {businessInfo.name}. All rights reserved.
        </div>
      </Container>
    </footer>
  )
}

export default Footer
