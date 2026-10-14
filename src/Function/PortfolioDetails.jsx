import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Modal } from 'react-bootstrap';
import { BirthdayImages } from '../Constants/BirthDay';
import {WeddingImages,WeddingVideos } from '../Constants/Wedding'
import { corperateImages ,corporateVideos} from '../Constants/Corperate';
import { OtherEventImages } from '../Constants/OtherEvents';
import { StageImages,StageVideos } from '../Constants/Stages';
import { galleryLabels } from '../Constants/Constant';

import './Portfolio.css'


function PortfolioDetail() {
  const { type } = useParams();
  // The image currently opened in the large preview (null = preview closed)
  const [selectedImage, setSelectedImage] = useState(null);

  let images = [];
  let videos=[];

 if (type === 'birthday') {
    images = BirthdayImages;
  } else if (type === 'wedding') {
    images = WeddingImages;
    videos = WeddingVideos;
  } else if (type === 'corperate') {
    images = corperateImages;
     videos = corporateVideos;
  } else if (type === 'other') {
    images = OtherEventImages;
  }
  else if (type === 'stage') {
    images = StageImages;
     videos = StageVideos;
  }

  const label = galleryLabels[type];

  // Unknown gallery name in the URL, e.g. /Gallery/xyz
  if (!label) {
    return (
      <Container className='section text-center'>
        <h2 className='section-title'>Gallery not found</h2>
        <p className='paragraph'>Sorry, we couldn't find that gallery.</p>
        <Link to='/portfolio' className='btn-brand'>See all galleries</Link>
      </Container>
    );
  }

  return (
    <div className='gallery-page'>
      <div className='gallery-banner'>
        <Container>
          <Link to='/portfolio' className='back-link'>
            <i className='bi bi-arrow-left me-1'></i> All Galleries
          </Link>
          <h1>{label} Gallery</h1>
        </Container>
      </div>

      <Container className='py-5'>
        <Row className='g-3'>
          {images.map((img, index) => (
            <Col key={index} xs={6} md={4} lg={3}>
              <button
                type='button'
                className='gallery-thumb'
                onClick={() => setSelectedImage(img)}
                aria-label={`Open ${label} photo ${index + 1}`}
              >
                <img src={img} alt={`${label} event ${index + 1}`} loading='lazy' />
              </button>
            </Col>
          ))}
        </Row>

        {videos.length > 0 && (
          <>
            <h2 className='section-title text-center mt-5 mb-4'>Event Videos</h2>
            <Row className='g-4 justify-content-center'>
              {videos.map((video, index) => (
                <Col key={index} xs={12} sm={6} lg={4}>
                  <video controls preload='metadata' className='gallery-video'>
                    <source src={video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </Col>
              ))}
            </Row>
          </>
        )}

        <div className='text-center mt-5'>
          <Link to='/contact' className='btn-brand'>Plan Your Event With Us</Link>
        </div>
      </Container>

      {/* Large image preview */}
      <Modal show={selectedImage !== null} onHide={() => setSelectedImage(null)} centered size='lg'>
        <Modal.Header closeButton />
        <Modal.Body className='p-2'>
          {selectedImage && <img src={selectedImage} alt={`${label} event`} className='w-100 rounded' />}
        </Modal.Body>
      </Modal>
    </div>
  );
}
export default PortfolioDetail;
