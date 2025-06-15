import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Portfolio.css'
import { galleryImages } from '../Constants/Constant';
import { Link } from 'react-router-dom';

function Portfolio(props) {

 
  return (
    <div>
      <Container fluid className="py-5 portfolio-section">
      <Row className="align-items-center">
        {/* Left Side - Image */}
        <Col xs={12} md={6} className="mb-4 mb-md-0 text-center">
          <img
            src="Images/flower2.jpg"
            alt="Event"
            className="img-fluid rounded shadow"
          />
        </Col>

        {/* Right Side - Badge and Content */}
<Col xs={12} md={6} className="text-md-start text-center">
  <div className="animated-badge mb-3 d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill">
    <i className="bi bi-images fs-5 "></i>
    <span className="fw-bold text-white">Portfolio</span>
  </div>
  <p className="lead text-muted" style={{fontFamily:"'times new roman',times,serif"}}>
    ✨ Check out a few of our <span className="text-dark fw-semibold">featured events</span> that made unforgettable memories!
  </p>
</Col>

      </Row>
    </Container>


<div className='row'> 
    <h2 className='text-center my-4 fw-bold text-dark'>{props.title}</h2>
    <div className='posters'> 
        {galleryImages.map((url,index)=>(

            <Link to={`/Gallery/${index}`}
            key={index}
            style={{ textDecoration:'none'}}>

        <img 
        key={index}
        src={url}
         className={props.isSmall ? "smallPoster" : "poster"} 
        alt={`Portfolio ${index + 1}`}
        
        />
         </Link>
        
       ) )}
         
       

    </div>
</div>

    </div>
  )
}

export default Portfolio
