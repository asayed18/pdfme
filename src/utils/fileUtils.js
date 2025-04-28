/**
 * Generates a reliable hash ID for a file that works even with filenames containing spaces
 * @param {File} file - The file object to generate a hash for
 * @returns {string} A unique hash ID for the file
 */
export const generateFileHash = (file) => {
  // Extract useful properties that won't change regardless of spaces in name
  const { name, size, type, lastModified } = file;
  
  // Create a base string from file metadata
  const baseString = `${name}-${size}-${type}-${lastModified}`;
  
  // Add a random component to ensure uniqueness even with identical files
  const randomComponent = Math.random().toString(36).substring(2, 10);
  
  // Create a simple hash function that works with any characters including spaces
  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  };
  
  return `file-${simpleHash(baseString)}-${randomComponent}`;
};