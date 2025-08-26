// src/components/PortfolioPreview.js
import React from 'react';
import { Link } from 'react-router-dom';
import { galleryImages } from '../Constants/Constant';
import './Portfolio.css';

function PortfolioPreview({ title = "Gallery Preview", isSmall = true }) {
  const galleryTypes = ['birthday', 'wedding', 'corperate','other','stage'];

  return (
    <div className="my-5">
      <h2 className="text-center my-4 fw-bold text-dark">{title}</h2>
      <div className="d-flex justify-content-center flex-wrap gap-4">
        {galleryTypes.map((type, index) => (
          <Link to={`/Gallery/${type}`} key={index}>
            <img
              src={galleryImages[type][0]}
              className={isSmall ? "smallPoster" : "poster"}
              alt={type}
              style={{ borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PortfolioPreview;
