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

const LockIcon = styled.svg`
  width: 100%;
  height: 100%;
  color: var(--text-secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    color: #2196F3;
    transform: scale(1.1);
  }
`;

interface LockHoverableIconProps {
  size?: string;
}

const LockHoverableIcon: React.FC<LockHoverableIconProps> = ({ size = "3rem" }) => {
  return (
    <IconContainer size={size}>
      <LockIcon 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* PDF Document outline */}
        <rect 
          x="3" 
          y="2" 
          width="14" 
          height="18" 
          rx="1" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          fill="none"
        />
        
        {/* Document lines */}
        <line x1="6" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        <line x1="6" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        <line x1="6" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        
        {/* Lock body */}
        <rect 
          x="18" 
          y="12" 
          width="5" 
          height="6" 
          rx="1" 
          stroke="#f44336" 
          strokeWidth="2" 
          fill="rgba(244, 67, 54, 0.1)"
        />
        
        {/* Lock shackle */}
        <path 
          d="M19 12V10C19 8.89543 19.8954 8 21 8C22.1046 8 23 8.89543 23 10V12" 
          stroke="#f44336" 
          strokeWidth="2" 
          fill="none"
        />
        
        {/* Lock keyhole */}
        <circle cx="20.5" cy="15" r="0.8" fill="#f44336"/>
        <rect x="20.3" y="15" width="0.4" height="1.5" fill="#f44336"/>
        
        {/* Security shield overlay */}
        <path 
          d="M12 22L10 20C8 18 6 16 6 13C6 10 8 8 10 8C11 8 12 8.5 12 8.5S13 8 14 8C16 8 18 10 18 13C18 16 16 18 14 20L12 22Z" 
          stroke="#4CAF50" 
          strokeWidth="1.5" 
          fill="rgba(76, 175, 80, 0.1)"
          opacity="0.7"
        />
        
        {/* Shield check mark */}
        <path 
          d="M10 13L11.5 14.5L14 12" 
          stroke="#4CAF50" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          opacity="0.7"
        />
      </LockIcon>
    </IconContainer>
  );
};

export default LockHoverableIcon;
