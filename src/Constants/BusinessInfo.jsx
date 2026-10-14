// All business contact details live here, so they only need to be changed in one place.

export const businessInfo = {
  name: 'Empire Events',
  phone: '9562420067',
  // WhatsApp needs the country code (91 = India) in front of the number
  whatsappNumber: '919562420067',
  email: 'empireeventskechery@gmail.com',
  instagram: 'https://instagram.com/empire_eventss',
  logo: '/Images/empire - Edited.png',
};

export const whatsappLink = `https://wa.me/${businessInfo.whatsappNumber}`;

export const emailLink =
  `mailto:${businessInfo.email}` +
  '?subject=Event%20Enquiry' +
  '&body=Hi%20Empire%20Events,%0AI%20would%20like%20to%20know%20more%20about%20your%20event%20services.';
