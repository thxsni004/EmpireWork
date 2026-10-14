import React from 'react'
import { Container, Row, Col } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import { Link } from 'react-router-dom';
import Contact from './Function/Contact';
import Portfolio from './Function/Portfolio';
import './index.css'

// Event categories shown in the "Our Event Categories" section.
// "gallery" is the gallery URL type; categories without photos yet link to the contact form.
const eventCategories = [
  { name: 'Wedding', icon: 'bi-heart', gallery: 'wedding' },
  { name: 'Birthday', icon: 'bi-balloon', gallery: 'birthday' },
  { name: 'Corporate Event', icon: 'bi-briefcase', gallery: 'corperate' },
  { name: 'Engagement', icon: 'bi-gem', gallery: null },
  { name: 'Cultural Event', icon: 'bi-stars', gallery: null },
  { name: 'Other', icon: 'bi-calendar-event', gallery: 'other' },
];

function First() {
  return (
    <div className='homepage'>

      {/* ===== Hero ===== */}
      <section className='hero'>
        <Container>
          <div className='hero-content'>
            <span className='hero-tag'>Empire Events</span>
            <h1>Plan Your Perfect Events</h1>
            <p>Make your special moments truly unforgettable with our expert planning services.</p>
            <div className='cta-buttons'>
              <Link to="/contact" className='btn-brand'>
                <i className='bi bi-chat-heart me-2'></i>Send an Enquiry
              </Link>
              <Link to="/#portfolio" className='btn-outline-brand'>
                View Our Portfolio
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ===== About / Introduction ===== */}
      <section id='about' className='section'>
        <Container>
          <Row className="align-items-center g-4 g-lg-5">
            <Col xs={12} md={6}>
              <span className='section-tag'>About Us</span>
              <h2 className="section-title">Welcome to Our Event Management</h2>
              <p className="paragraph">
                We specialize in creating unforgettable events tailored to your needs. Whether it's a wedding, corporate event, or private party, our expert team ensures every detail is perfect.
              </p>
              <p className="paragraph">
                From intimate gatherings to grand celebrations, we focus on crafting meaningful moments and unforgettable experiences. Known especially for our delicious, flavor-rich cuisine, our catering services are a highlight at every event. Whether you're planning a wedding, cultural program, or private function, let Empire help you turn your vision into a cherished memory.
              </p>
            </Col>

            <Col xs={12} md={6}>
              <div className='about-image'>
                <Image src="/Images/flower.jpg" alt="Event decoration by Empire Events" fluid />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ===== Portfolio preview ===== */}
      <Portfolio title='Our Event Galleries' />

      {/* ===== Services / Event categories ===== */}
      <section id='services' className='section section-tinted'>
        <Container>
          <div className='text-center mb-5'>
            <span className='section-tag'>Services</span>
            <h2 className='section-title'>Our Event Categories</h2>
          </div>

          <Row className='g-4'>
            {eventCategories.map((item) => (
              <Col key={item.name} xs={12} sm={6} lg={4}>
                <div className='event-card'>
                  <div className='event-icon'>
                    <i className={`bi ${item.icon}`}></i>
                  </div>
                  <h3>{item.name}</h3>
                  <p>Explore stage setup, food, seating, and more for {item.name.toLowerCase()} events</p>
                  {item.gallery ? (
                    <Link to={`/Gallery/${item.gallery}`} className='card-link'>
                      View Gallery <i className='bi bi-arrow-right'></i>
                    </Link>
                  ) : (
                    <Link to='/contact' className='card-link'>
                      Enquire Now <i className='bi bi-arrow-right'></i>
                    </Link>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ===== Contact form ===== */}
      <Contact />
    </div>
  )
}

export default First
