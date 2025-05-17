import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading = false, 
  disabled = false,
  onClick,
  ...props 
}) => {
  // Generate appropriate class names based on variant
  const getButtonClass = () => {
    let classes = '';
    
    switch (variant) {
      case 'primary':
        classes = 'merge-button';
        break;
      case 'secondary':
        classes = 'secondary-button';
        break;
      case 'danger':
        classes = 'danger-button';
        break;
      case 'text':
        classes = 'text-button';
        break;
      default:
        classes = 'merge-button';
    }
    
    if (isLoading) {
      classes += ' loading';
    }
    
    if (className) {
      classes += ` ${className}`;
    }
    
    return classes;
  };
  
  return (
    <button
      className={getButtonClass()}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;