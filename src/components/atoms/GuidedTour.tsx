import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const TourContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  pointer-events: ${props => props.isVisible ? 'auto' : 'none'};
  opacity: ${props => props.isVisible ? 1 : 0};
  transition: opacity 0.3s;
`;

const Backdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
`;

const TourStep = styled.div<{ top: number; left: number }>`
  position: absolute;
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  transform: translate(-50%, -100%);
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 300px;
  z-index: 1001;
  margin-top: -15px;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid white;
  }
`;

const StepContent = styled.div`
  margin-bottom: 1rem;
  
  h4 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: var(--accent-color);
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-primary);
  }
`;

const TourActions = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TourButton = styled.button<{ isPrimary?: boolean }>`
  background-color: ${props => props.isPrimary ? 'var(--accent-color)' : 'var(--bg-secondary)'};
  color: ${props => props.isPrimary ? 'white' : 'var(--text-primary)'};
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isPrimary ? 'var(--accent-color-dark, #0056b3)' : '#e0e0e0'};
  }
`;

const DontShowAgain = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.8rem;
  
  input {
    margin-right: 0.5rem;
  }
  
  label {
    color: var(--text-secondary);
  }
`;

const DismissButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--text-secondary);
  
  &:hover {
    color: var(--text-primary);
  }
`;

export type TourStep = {
  title: string;
  content: string;
  elementSelector: string;
};

interface GuidedTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
  tourId: string; // Unique ID for storing preferences
}

const GuidedTour: React.FC<GuidedTourProps> = ({ steps, isOpen, onClose, onFinish, tourId }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const updatePosition = () => {
    const element = document.querySelector(steps[currentStep].elementSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem(`tour-${tourId}-completed`, 'true');
    }
    onFinish();
  };

  const handleDismiss = () => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <TourContainer isVisible={isOpen}>
      <Backdrop onClick={handleDismiss} />
      <TourStep top={position.top} left={position.left}>
        <DismissButton onClick={handleDismiss}>×</DismissButton>
        <StepContent>
          <h4>{steps[currentStep].title}</h4>
          <p>{steps[currentStep].content}</p>
        </StepContent>
        <TourActions>
          <TourButton 
            onClick={handlePrevious} 
            disabled={currentStep === 0}
            style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
          >
            Previous
          </TourButton>
          <TourButton 
            onClick={handleNext} 
            isPrimary
          >
            {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
          </TourButton>
        </TourActions>
        {currentStep === steps.length - 1 && (
          <DontShowAgain>
            <input 
              type="checkbox" 
              id="dontShowAgain" 
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <label htmlFor="dontShowAgain">Don't show again</label>
          </DontShowAgain>
        )}
      </TourStep>
    </TourContainer>
  );
};

export default GuidedTour;
