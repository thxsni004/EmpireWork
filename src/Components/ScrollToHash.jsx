import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Makes links like "/#services" scroll to the section with id="services".
// On normal page changes (no #), it scrolls back to the top of the page.
function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait a moment so the new page has rendered before scrolling
      const timer = setTimeout(() => {
        const section = document.getElementById(hash.slice(1));
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default ScrollToHash;
