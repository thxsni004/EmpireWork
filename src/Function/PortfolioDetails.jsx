import React from 'react';
import { useParams } from 'react-router-dom';
import { galleryImages } from '../Constants/Constant';

function PortfolioDetail() {
  const { id } = useParams();
  const image = galleryImages[id];

  return (
    <div className="text-center py-5">
      <h2 className="mb-4 fw-bold text-dark">Portfolio Image Detail</h2>
      <img 
        src={image} 
        alt={`Detail ${id}`} 
        className="img-fluid rounded shadow" 
        style={{ maxWidth: '90%', height: 'auto' }}
      />
    </div>
  );
}

export default PortfolioDetail;
