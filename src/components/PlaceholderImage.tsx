import React from 'react';
import styled from 'styled-components';

const ImageContainer = styled.div`
  width: 100%;
  aspect-ratio: 4/3;
  background: var(--bg-main);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  @media (max-width: 768px) {
    aspect-ratio: 16/9;
  }
`;

const PlaceholderText = styled.div`
  font-size: 1.2rem;
  color: var(--text-secondary);
  text-align: center;
  padding: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 1rem;
  }
`;

const PlaceholderImage = () => {
  return (
    <ImageContainer>
      <PlaceholderText>
        Illustration Coming Soon
      </PlaceholderText>
    </ImageContainer>
  );
};

export default PlaceholderImage;
