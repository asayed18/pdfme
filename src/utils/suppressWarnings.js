// This utility helps suppress specific console warnings that we can't fix
// because they come from third-party libraries like react-beautiful-dnd

// Original console.error function
const originalConsoleError = console.error;

// List of warning messages to suppress
const suppressedWarnings = [
  "Support for defaultProps will be removed from memo components in a future major release",
  "Connect(Droppable): Support for defaultProps will be removed from memo components",
  "Connect(Draggable): Support for defaultProps will be removed from memo components"
];

// Override console.error to filter out specific warnings
console.error = function(message, ...args) {
  // Check if the message contains any of the suppressed warnings
  if (typeof message === 'string' && 
      suppressedWarnings.some(warning => message.includes(warning))) {
    // Skip logging this warning
    return;
  }
  
  // Call the original console.error for any other messages
  originalConsoleError.apply(console, [message, ...args]);
};

export default function setupWarningSuppressions() {
  // This function doesn't need to do anything - just importing this file
  // is enough to set up the warning suppressions
  return null;
}