import { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import Logo from './components/Logo';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import MergePDF from './components/MergePDF';
import CompressPDF from './components/CompressPDF';
import RemovePagesFromPDF from './components/RemovePagesFromPDF';
import { initGA, pageView } from './utils/analytics';

// Google Analytics Measurement ID - replace with your actual ID
const GA_MEASUREMENT_ID = 'GTM-KDSHQ3S2';

function App() {
  const [currentPage, setCurrentPage] = useState('');
  const [theme, setTheme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  // Initialize Google Analytics
  useEffect(() => {
    initGA(GA_MEASUREMENT_ID);
  }, []);

  useEffect(() => {
    // Handle hash changes for navigation
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash && ['merge', 'compress', 'remove'].includes(hash)) {
        setCurrentPage(hash);
      } else {
        setCurrentPage('');
      }
    };

    // Initial page load handling
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Track page views when current page changes
  useEffect(() => {
    const pagePath = currentPage ? `/${currentPage}` : '/';
    pageView(pagePath);
  }, [currentPage]);

  const goToHomepage = () => {
    setCurrentPage('');
    // Clear the hash from the URL
    history.pushState("", document.title, window.location.pathname);
  };

  const navigateToPage = (pageId) => {
    setCurrentPage(pageId);
    window.location.hash = pageId;
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Apply theme to document body
  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  // Render the appropriate content based on the current page
  const renderContent = () => {
    switch (currentPage) {
      case 'merge':
        return <MergePDF />;
      case 'compress':
        return <CompressPDF />;
      case 'remove':
        return <RemovePagesFromPDF />;
      default:
        return <WelcomeScreen onGetStarted={() => navigateToPage('merge')} />;
    }
  };

  return (
    <>
      <nav className="menubar">
        <div className="menubar-brand" onClick={goToHomepage}>
          <Logo />
          <h2>PDF Merger</h2>
        </div>
        <div className="menubar-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☼' : '☽'}
          </button>
        </div>
      </nav>
      
      <Sidebar 
        currentPage={currentPage} 
        navigateToPage={navigateToPage}
      />

      {renderContent()}
    </>
  );
}

export default App;
