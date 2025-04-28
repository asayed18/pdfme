import React, { useEffect, useRef } from 'react';

/**
 * AdContainer component for AdSense ads
 * @param {Object} props - Component props
 * @param {string} props.position - Position of the ad (sidebar, content-top, content-bottom)
 * @param {string} props.adClient - AdSense client ID
 * @param {string} props.adSlot - AdSense ad slot ID
 * @param {string} props.className - Additional CSS class names
 */
const AdContainer = ({ 
  position = 'content-top', 
  adClient = 'ca-pub-xxxxxxxxxxxxxxxx', 
  adSlot = '1234567890',
  className = '' 
}) => {
  const adRef = useRef(null);

  useEffect(() => {
    // Load AdSense script if not already loaded
    if (window.adsbygoogle === undefined) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Initialize the ad
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  const getSizeClasses = () => {
    switch (position) {
      case 'sidebar':
        return 'ad-container-sidebar';
      case 'content-top':
        return 'ad-container-content-top';
      case 'content-bottom':
        return 'ad-container-content-bottom';
      case 'welcome-bottom':
        return 'ad-container-welcome-bottom';
      default:
        return 'ad-container-default';
    }
  };

  return (
    <div className={`ad-container ${getSizeClasses()} ${className}`} ref={adRef}>
      <div className="ad-label">Advertisement</div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdContainer;