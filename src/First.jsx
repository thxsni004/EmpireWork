import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Nav } from 'react-bootstrap';
import {Row,Col} from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import { useNavigate } from 'react-router-dom';
import './index.css'

function First() {

  const navigate=useNavigate();

  const handleContactClick =()=>{
    navigate("/contact")
  }
  return (
    <div>


      <Navbar className="navbar-container d-flex justify-content-between px-3" style={{ marginTop: '-10px' }}>
        <div className="d-flex justify-content-between align-items-center w-100">
        
          <Nav className="ms-3 d-flex gap-3 ">
            <Nav.Link href="#services">Services</Nav.Link>
            <Nav.Link href="/portfolio">Portfolio</Nav.Link>
            <Nav.Link href="#about">About</Nav.Link>
          </Nav>
        </div>
        <div className="d-flex align-items-center gap-3">
          <a href="https://instagram.com/empire_eventss" target="_blank" rel="noreferrer">
            <i className="bi bi-instagram fs-4 text-dark"></i>
          </a>
          <a href="https://wa.me/9562420067" target="_blank" rel="noreferrer">
            <i className="bi bi-whatsapp fs-4 text-dark "></i>
          </a>
<a href="mailto:Empireeventskechery@gmail.com?subject=Event%20Enquiry&body=Hi%20Empire%20Events,%0AI%20would%20like%20to%20know%20more%20about%20your%20event%20services." target="_blank" rel="noreferrer">
  <i className="bi bi-envelope fs-4 text-dark"></i>
</a>

         <button 
         onClick={handleContactClick} className='border border-gray-500 text-gray-800 px-3 py-1 rounded hover:bg-gray-100 transition duration-300"'> Contact</button>
        </div>
      </Navbar>


<div className='homepage'>

  <section className='hero'>
    <div className='hero-content'>

      <h1>Plan Your Perfect Events</h1>
      <p>Make your special moments truly unforgettable with our expert planning services.</p>
      <div className='cta-buttons'>
        <a href="#events" className='book-now'>Book Now</a>
        <a href="/contact" className='contact-us'> Contact Us</a>
      </div>
    </div>
  </section>

  {/* just introduction field */}

 <Container className="event-container py-5">
      <Row className="align-items-center">
        
        {/* Left Side - Text Content */}
        <Col xs={12} md={6} className="text-content">
          <h2 className="section-title fw-bold mb-3">Welcome to Our Event Management</h2>
          <p className="paragraph">
            We specialize in creating unforgettable events tailored to your needs. Whether it's a wedding, corporate event, or private party, our expert team ensures every detail is perfect.
          </p>
          <p className="paragraph">
           From intimate gatherings to grand celebrations, we focus on crafting meaningful moments and unforgettable experiences. Known especially for our delicious, flavor-rich cuisine, our catering services are a highlight at every event. Whether you're planning a wedding, cultural program, or private function, let Empire help you turn your vision into a cherished memory.
          </p>
      
        </Col>

        {/* Right Side - Single Image */}
        <Col xs={12} md={6} className="text-center">
          <Image 
            src="/Images/flower.jpg"  // 🔁 replace with your image
            alt="Event Highlight"
            fluid
            rounded
            className="shadow"
          />
        </Col>

      </Row>
    </Container>

  {/* event category section */}
  <section id='events' className='event-section'>
    <h2>Our Event Categories</h2>
    <div className="event-grid">
      {['Wedding','Birthday','Corporate Event','Engagement','Cultural Event','Other'].map((item,index)=>(
        <div key={index} className='event-card'>
          <h3>{item}</h3>
          <p>Explore stage setup, food, seating, and more for {item.toLowerCase()} events</p>
          <button>Explore</button>
          </div>
      ))}
    </div>
  </section>
</div>

   
   
    </div>
  )
}

export default First
