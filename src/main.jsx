import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// Import the warning suppression utility
import './utils/suppressWarnings';

// Enhanced fix for react-beautiful-dnd in React 18
// This resolves issues with Strict Mode's double-rendering and improves drag-and-drop stability

// 1. Patch useLayoutEffect for SSR compatibility
const originalUseLayoutEffect = React.useLayoutEffect;
React.useLayoutEffect = typeof window !== 'undefined' 
  ? originalUseLayoutEffect 
  : React.useEffect;

// 2. Monkey patch useState to help with dnd state stability
const originalCreateElement = React.createElement;
React.createElement = function(type, props, ...children) {
  // Return original for non-Draggable components
  if (!props || !props.draggableId) {
    return originalCreateElement(type, props, ...children);
  }
  
  // For Draggable components, ensure key stability
  const enhancedProps = { 
    ...props,
    key: props.draggableId || props.key
  };
  
  return originalCreateElement(type, enhancedProps, ...children);
};

// Add page-loaded class to control animations only on initial load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.body.classList.add('page-loaded');
  }, 100);
});

// Custom event to pause animations during drag operations
window.addEventListener('dragstart', () => {
  document.body.classList.remove('page-loaded');
});

window.addEventListener('dragend', () => {
  // Small delay to ensure drag operations are complete
  setTimeout(() => {
    document.body.classList.add('page-loaded');
  }, 300);
});

// Create root and render
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
