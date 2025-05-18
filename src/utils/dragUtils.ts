/**
 * This utility helps manage drag animations for react-beautiful-dnd
 * It provides helpers to prevent animation glitches during drag operations
 */

// Pause all animations on a given element and its children
export const pauseAnimations = (element: Element): void => {
  try {
    // Get all animations on this element and its children if browser supports it
    if ('getAnimations' in element) {
      const animations = (element as any).getAnimations({ subtree: true });
      animations.forEach((animation: Animation) => {
        animation.pause();
      });
    }
  } catch (e) {
    // Silent fail if browser doesn't support this API
    console.debug('Animation API not supported', e);
  }
};

// Resume all animations on a given element and its children
export const resumeAnimations = (element: Element): void => {
  try {
    if ('getAnimations' in element) {
      const animations = (element as any).getAnimations({ subtree: true });
      animations.forEach((animation: Animation) => {
        animation.play();
      });
    }
  } catch (e) {
    // Silent fail
    console.debug('Animation API not supported', e);
  }
};

// Apply transform overrides to fix z-index issues during drag
export const fixDragTransforms = (): void => {
  // Find all draggable elements
  const draggables = document.querySelectorAll('[data-rbd-draggable-id]');
  
  draggables.forEach((draggable) => {
    const htmlElement = draggable as HTMLElement;
    // Find if this element has the dragging class
    const isDragging = htmlElement.classList.contains('dragging');
    
    if (isDragging) {
      // Make sure the dragged element is on top by setting a very high z-index
      htmlElement.style.zIndex = '9999';
    } else {
      // Reset any inline z-index
      htmlElement.style.zIndex = '';
    }
  });
};
