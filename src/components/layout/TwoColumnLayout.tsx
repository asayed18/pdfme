import React from 'react';
import styled from 'styled-components';

interface TwoColumnLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: row;
  max-height: 100vh;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--bg-main);
  overflow: hidden;
  
  @media (max-width: 768px) {
    flex-direction: column;
    overflow-y: auto;
    padding: 1rem;
  }
`;

const LeftColumn = styled.div`
  flex: 1;
  min-width: 0;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const RightColumn = styled.div`
  flex: 1;
  min-width: 0;
  padding: 2rem;
  # background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    width: 100%;
    min-height: 60vh;
  }
`;

const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({ leftContent, rightContent }) => {
  return (
    <LayoutContainer>
      <LeftColumn>
        {leftContent}
      </LeftColumn>
      <RightColumn>
        {rightContent}
      </RightColumn>
    </LayoutContainer>
  );
};

export default TwoColumnLayout;
