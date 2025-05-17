import { useState, useEffect, JSX } from 'react';
import styled from 'styled-components';
import Logo from './components/Logo';
import HomePage from './components/HomePage';
import MergePDF from './components/MergePDF';
import CompressPDF from './components/CompressPDF';
import RemovePagesFromPDF from './components/RemovePagesFromPDF';
import PlaceholderImage from './components/PlaceholderImage';
import TwoColumnLayout from './components/layout/TwoColumnLayout';
import { initGA, pageView } from './utils/analytics';

const AppContainer = styled.div`
  margin: 0;
  padding: 0; 
  width: 100vw; 
  height: 100vh;
  overflow: hidden;
  position: relative;
  
  @media (max-width: 768px) {
    height: auto;
    min-height: 100vh;
    overflow: auto;
  }
`;

const ThemeToggleContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
`;

// Google Analytics Measurement ID - replace with your actual ID
const GA_MEASUREMENT_ID = 'GTM-KDSHQ3S2';

// Define types for the page navigation
type PageType = 'merge' | 'compress' | 'remove' | '';
type ThemeType = 'light' | 'dark';

function App(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<PageType>('');
  const [theme, setTheme] = useState<ThemeType>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  // Initialize Google Analytics
  useEffect(() => {
    initGA(GA_MEASUREMENT_ID);
  }, []);

  useEffect(() => {
    // Handle hash changes for navigation
    const handleHashChange = (): void => {
      const hash = window.location.hash.substring(1) as PageType;
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

  const goToHomepage = (): void => {
    setCurrentPage('');
    // Clear the hash from the URL
    history.pushState("", document.title, window.location.pathname);
  };

  const navigateToPage = (pageId: PageType): void => {
    setCurrentPage(pageId);
    window.location.hash = pageId;
  };

  const toggleTheme = (): void => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Apply theme to document body
  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  // Render the appropriate content based on the current page
  const renderPageContent = (): JSX.Element => {
    switch (currentPage) {
      case 'merge':
        return <MergePDF />;
      case 'compress':
        return <CompressPDF />;
      case 'remove':
        return <RemovePagesFromPDF />;
      default:
        return <PlaceholderImage />;
    }
  };

  return (
    <AppContainer>
      <ThemeToggleContainer>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? '☼' : '☽'}
        </button>
      </ThemeToggleContainer>
      <TwoColumnLayout
        leftContent={<HomePage onToolSelect={navigateToPage} />}
        rightContent={renderPageContent()}
      />
    </AppContainer>
  );
}

export default App;
