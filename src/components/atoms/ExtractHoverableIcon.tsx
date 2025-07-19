import React from 'react';
import styled from 'styled-components';

interface IconContainerProps {
  size?: string;
}

const IconContainer = styled.div<IconContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.size || '3rem'};
  height: ${props => props.size || '3rem'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ExtractIcon = styled.svg`
  width: 100%;
  height: 100%;
  color: var(--text-secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    color: #2196F3;
    transform: scale(1.1);
  }
`;

interface ExtractHoverableIconProps {
  size?: string;
}

const ExtractHoverableIcon: React.FC<ExtractHoverableIconProps> = ({ size = "3rem" }) => {
  return (
    <IconContainer size={size}>
      <ExtractIcon 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* PDF Document */}
        <rect 
          x="4" 
          y="2" 
          width="12" 
          height="16" 
          rx="1" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          fill="none"
        />
        
        {/* Document lines */}
        <line x1="6" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="6" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="6" y1="10" x2="12" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        
        {/* Selected pages highlight */}
        <rect 
          x="6" 
          y="12" 
          width="8" 
          height="4" 
          rx="0.5" 
          fill="rgba(33, 150, 243, 0.2)" 
          stroke="#2196F3" 
          strokeWidth="1"
        />
        
        {/* Extract arrow pointing out */}
        <path 
          d="M18 12L22 12M22 12L20 10M22 12L20 14" 
          stroke="#4CAF50" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* New document indication */}
        <rect 
          x="19" 
          y="16" 
          width="4" 
          height="6" 
          rx="0.5" 
          stroke="#4CAF50" 
          strokeWidth="1.5" 
          fill="rgba(76, 175, 80, 0.1)"
        />
        
        {/* Small lines in new document */}
        <line x1="20" y1="18" x2="22" y2="18" stroke="#4CAF50" strokeWidth="1" strokeLinecap="round"/>
        <line x1="20" y1="19.5" x2="22" y2="19.5" stroke="#4CAF50" strokeWidth="1" strokeLinecap="round"/>
      </ExtractIcon>
    </IconContainer>
  );
};

export default ExtractHoverableIcon;
