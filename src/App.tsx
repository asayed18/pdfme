import { useState, useEffect, JSX } from 'react';
import styled from 'styled-components';
import Logo from './components/Logo';
import HomePage from './components/HomePage';
import MergePDF from './components/MergePDF';
import CompressPDF from './components/CompressPDF';
import RemovePagesFromPDF from './components/RemovePagesFromPDF';
import ExtractPDF from './components/ExtractPDF';
import LockPDF from './components/LockPDF';
import RocketFolderIcon from './components/RocketFolderIcon';
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

const MobileContainer = styled.div`
  @media (max-width: 768px) {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
`;

const MobileLeftPanel = styled.div<{ isVisible: boolean }>`
  @media (max-width: 768px) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--background-color);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(${props => props.isVisible ? '0' : '-100%'});
    z-index: 1;
    overflow: auto;
  }
`;

const MobileRightPanel = styled.div<{ isVisible: boolean }>`
  @media (max-width: 768px) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--background-color);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(${props => props.isVisible ? '0' : '100%'});
    z-index: 2;
    overflow: auto;
  }
`;

const MobileBackButton = styled.button`
  @media (max-width: 768px) {
    position: fixed;
    top: 1rem;
    left: 1rem;
    background: var(--accent, #2196F3);
    color: white;
    border: none;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transition: all 0.2s ease;
    font-weight: bold;
    
    &:hover {
      background: var(--accent-dark, #1976D2);
      transform: scale(1.05);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;


const ThemeToggleContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  
  @media (max-width: 768px) {
    top: 0.5rem;
    right: 0.5rem;
  }
`;

const PageContentWrapper = styled.div<{ isMobile: boolean; hasActiveTool: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, 
    rgba(33, 150, 243, 0.02) 0%, 
    rgba(76, 175, 80, 0.02) 100%
  );
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.06), 
              0 2px 4px -1px rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: auto;
  
  @media (max-width: 768px) {
    padding: ${props => props.hasActiveTool ? '4rem 1.5rem 1.5rem 1.5rem' : '1rem'};
    border-radius: ${props => props.hasActiveTool ? '0' : '8px'};
    border: ${props => props.hasActiveTool ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
    box-shadow: ${props => props.hasActiveTool ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.06)'};
    background: ${props => props.hasActiveTool ? 
      'var(--background-color)' :
      'linear-gradient(135deg, rgba(33, 150, 243, 0.02) 0%, rgba(76, 175, 80, 0.02) 100%)'
    };
    margin: ${props => props.hasActiveTool ? '0' : '1rem'};
  }
  
  @media (max-width: 480px) {
    padding: ${props => props.hasActiveTool ? '4rem 1rem 1rem 1rem' : '0.75rem'};
    margin: ${props => props.hasActiveTool ? '0' : '0.75rem'};
  }
`;

// Google Analytics Measurement ID - replace with your actual ID
const GA_MEASUREMENT_ID = 'GTM-KDSHQ3S2';

// Define types for the page navigation
type PageType = 'merge' | 'compress' | 'remove' | 'extract' | 'lock' | '';
type ThemeType = 'light' | 'dark';

function App(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<PageType>('');
  const [theme, setTheme] = useState<ThemeType>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize Google Analytics
  useEffect(() => {
    initGA(GA_MEASUREMENT_ID);
  }, []);

  useEffect(() => {
    // Handle hash changes for navigation
    const handleHashChange = (): void => {
      const hash = window.location.hash.substring(1) as PageType;
      if (hash && ['merge', 'compress', 'remove', 'extract', 'lock'].includes(hash)) {
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
    const content = (() => {
      switch (currentPage) {
        case 'merge':
          return <MergePDF />;
        case 'compress':
          return <CompressPDF />;
        case 'remove':
          return <RemovePagesFromPDF />;
        case 'extract':
          return <ExtractPDF />;
        case 'lock':
          return <LockPDF />;
        default:
          return <RocketFolderIcon />;
      }
    })();
    
    return (
      <PageContentWrapper 
        isMobile={isMobile} 
        hasActiveTool={!!currentPage}
      >
        {content}
      </PageContentWrapper>
    );
  };

  return (
    <AppContainer>
      <ThemeToggleContainer>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? '☼' : '☽'}
        </button>
      </ThemeToggleContainer>
      
      {isMobile ? (
        <MobileContainer>
          <MobileLeftPanel isVisible={!currentPage}>
            <HomePage onToolSelect={navigateToPage} />
          </MobileLeftPanel>
          
          <MobileRightPanel isVisible={!!currentPage}>
            {currentPage && (
              <MobileBackButton onClick={goToHomepage}>
                ←
              </MobileBackButton>
            )}
            {renderPageContent()}
          </MobileRightPanel>
        </MobileContainer>
      ) : (
        <TwoColumnLayout
          leftContent={<HomePage onToolSelect={navigateToPage} />}
          rightContent={renderPageContent()}
        />
      )}
    </AppContainer>
  );
}

export default App;
