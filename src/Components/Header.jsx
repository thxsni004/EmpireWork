import React from 'react'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import './Header.css'

function Header() {
  return (
    <div className='header'>
        <Navbar  expand="lg" className="navbar-container">
        <Container className='navbar-container justify-content-center' >
          <Navbar.Brand className='nav-brand' href="/">
            <div className='logo-wrapper'> 
            <img
              alt=""
              src="/Images/empire - Edited.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />
            </div>
          
          </Navbar.Brand>
          
        </Container>
      </Navbar>

    </div>
  )
}

export default Header
