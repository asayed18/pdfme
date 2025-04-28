import React from 'react';
import Button from './atoms/Button';

const WelcomeScreen = ({ onGetStarted }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        <div className="welcome-content">
          <h1>The <span className="highlight">#1</span> most secure and fast app for editing your pdf</h1>
          <h2 className="free-text">it's completely free</h2>
          <p>Select a tool from the sidebar to get started</p>
          <div className="welcome-actions">
            <Button 
              variant="primary" 
              className="welcome-button"
              onClick={onGetStarted}
            >
              Let's jump in
            </Button>
          </div>
          
          {/* AdSense ad space at bottom of welcome screen */}
          <div className="ad-space ad-space-welcome">
            {/* AdSense will automatically fill this space */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;