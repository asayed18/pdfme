import React from 'react';
import AdContainer from './atoms/AdContainer';

const CompressPDF = () => {
  return (
    <>
      <div className="hero">
        <div className="hero-content">
          <h1>PDF Compressor</h1>
          <p>Reduce the file size of your PDF documents without losing quality.</p>
        </div>
      </div>

      <div className="container">
        {/* Top ad container */}
        <AdContainer 
          position="content-top"
          adClient="ca-pub-xxxxxxxxxxxxxxxx"
          adSlot="4567890123"
        />
        
        <div className="tool-layout">
          {/* Tool interface (coming soon placeholder) */}
          <div className="tool-interface full-width">
            <div className="app-container">
              <h2>PDF Compressor</h2>
              <p>This feature is coming soon. Check back later for updates.</p>
            </div>
          </div>
        </div>
        
        {/* Bottom ad container */}
        <AdContainer 
          position="content-bottom"
          adClient="ca-pub-xxxxxxxxxxxxxxxx"
          adSlot="5678901234"
        />
      </div>
    </>
  );
};

export default CompressPDF;