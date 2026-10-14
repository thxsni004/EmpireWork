import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Portfolio.css'
import { galleryImages, galleryLabels } from '../Constants/Constant';
import { Link } from 'react-router-dom';


function Portfolio(props) {
  const galleryTypes = ['birthday', 'wedding','corperate','other','stage']; // or anything you want

  return (
    <section id='portfolio' className='section portfolio-section'>
      <Container>
        <div className='text-center mb-5'>
          <div className="animated-badge mb-3">
            <i className="bi bi-images"></i>
            <span>Portfolio</span>
          </div>
          {props.title && <h2 className='section-title'>{props.title}</h2>}
          <p className="portfolio-lead">
            ✨ Check out a few of our <strong>featured events</strong> that made unforgettable memories!
          </p>
        </div>

        <Row className='g-4 justify-content-center'>
          {galleryTypes.map((type) => (
            <Col key={type} xs={12} sm={6} lg={4}>
              <Link to={`/Gallery/${type}`} className='gallery-card'>
                <img
                  src={galleryImages[type][0]} // First image of each category
                  alt={`${galleryLabels[type]} events`}
                  loading='lazy'
                />
                <div className='gallery-card-overlay'>
                  <h3>{galleryLabels[type]}</h3>
                  <span>View Gallery <i className='bi bi-arrow-right'></i></span>
                </div>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

export default Portfolio
