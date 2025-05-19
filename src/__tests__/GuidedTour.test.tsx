import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GuidedTour, { TourStep } from '../components/atoms/GuidedTour';

describe('GuidedTour Component', () => {
  const mockSteps: TourStep[] = [
    {
      title: 'Step 1',
      content: 'This is step 1',
      elementSelector: '.step-1',
    },
    {
      title: 'Step 2',
      content: 'This is step 2',
      elementSelector: '.step-2',
    },
  ];

  const mockOnClose = jest.fn();
  const mockOnFinish = jest.fn();

  beforeEach(() => {
    // Mock query selector
    document.querySelector = jest.fn().mockImplementation(() => ({
      getBoundingClientRect: () => ({
        top: 100,
        left: 100,
        width: 100,
        height: 100,
      }),
    }));
    
    // Reset localStorage mock
    localStorage.clear();
    
    // Reset mocks
    mockOnClose.mockReset();
    mockOnFinish.mockReset();
  });

  test('renders the first step when opened', () => {
    render(
      <GuidedTour 
        steps={mockSteps}
        isOpen={true}
        onClose={mockOnClose}
        onFinish={mockOnFinish}
        tourId="test-tour"
      />
    );
    
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('This is step 1')).toBeInTheDocument();
  });

  test('navigates to the next step', () => {
    render(
      <GuidedTour 
        steps={mockSteps}
        isOpen={true}
        onClose={mockOnClose}
        onFinish={mockOnFinish}
        tourId="test-tour"
      />
    );
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('This is step 2')).toBeInTheDocument();
  });

  test('calls onClose when dismissed', () => {
    render(
      <GuidedTour 
        steps={mockSteps}
        isOpen={true}
        onClose={mockOnClose}
        onFinish={mockOnFinish}
        tourId="test-tour"
      />
    );
    
    const dismissButton = screen.getByText('×');
    fireEvent.click(dismissButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onFinish and sets localStorage when finished with "don\'t show again"', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    
    render(
      <GuidedTour 
        steps={mockSteps}
        isOpen={true}
        onClose={mockOnClose}
        onFinish={mockOnFinish}
        tourId="test-tour"
      />
    );
    
    // Navigate to the last step
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Check the "don't show again" checkbox
    const checkbox = screen.getByLabelText("Don't show again");
    fireEvent.click(checkbox);
    
    // Click Finish
    const finishButton = screen.getByText('Finish');
    fireEvent.click(finishButton);
    
    expect(mockOnFinish).toHaveBeenCalledTimes(1);
    expect(setItemSpy).toHaveBeenCalledWith('tour-test-tour-completed', 'true');
  });

  test('does not render when isOpen is false', () => {
    render(
      <GuidedTour 
        steps={mockSteps}
        isOpen={false}
        onClose={mockOnClose}
        onFinish={mockOnFinish}
        tourId="test-tour"
      />
    );
    
    expect(screen.queryByText('Step 1')).not.toBeInTheDocument();
  });
});
