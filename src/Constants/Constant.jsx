import { BirthdayImages } from './BirthDay';
import { WeddingImages } from './Wedding';
import { corperateImages } from './Corperate';
import { OtherEventImages } from './OtherEvents';
import { StageImages } from './Stages';


export const galleryImages = {
  birthday: BirthdayImages,
  wedding: WeddingImages,
  corperate: corperateImages,
  other : OtherEventImages,
  stage:StageImages,


};

// Friendly names shown on screen for each gallery type.
// The keys must stay the same because they are part of the gallery URLs (e.g. /Gallery/corperate).
export const galleryLabels = {
  birthday: 'Birthday',
  wedding: 'Wedding',
  corperate: 'Corporate',
  other: 'Other Events',
  stage: 'Stage Decor',
};


// export const galleryImages=[

//     "/Images/img7.jpg",
//    "/Images/img7.jpg",
//     "/Images/img7.jpg",
//     "/Images/img7.jpg",
//     "/Images/img7.jpg",
//     "/Images/img7.jpg",
//     "/Images/img7.jpg",
// ]
