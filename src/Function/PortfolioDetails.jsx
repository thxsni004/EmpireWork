import React from 'react';
import { useParams } from 'react-router-dom';
import { BirthdayImages } from '../Constants/BirthDay';
import {WeddingImages,WeddingVideos } from '../Constants/Wedding'
import { corperateImages ,corporateVideos} from '../Constants/Corperate';
import { OtherEventImages } from '../Constants/OtherEvents';
import { StageImages,StageVideos } from '../Constants/Stages';

import './Portfolio.css'


function PortfolioDetail() {
  const { type } = useParams();
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

 return (
    <div className="text-center py-5">
      <h2 className="mb-4 fw-bold text-dark text-capitalize">{type} Gallery</h2>

      <div className="row justify-content-center">
        {images.map((img, index) => (
          <div key={index} className="col-6 col-md-3 mb-4">
            <img 
              src={img} 
              alt={`Event ${index}`} 
              className="img-fluid rounded shadow"
            />
          </div>
        ))}
      </div>

      {videos.length > 0 && (
        <>
          <h4 className="mb-4 fw-bold text-dark text-capitalize">Event videos</h4>
          <div className="row justify-content-center">
            {videos.map((video, index) => (
              <div key={index} className="col-6 col-md-3 mb-4">
                <video 
                  controls 
                  className="w-100 rounded shadow"
                >
                  <source src={video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
export default PortfolioDetail;
