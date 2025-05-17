/**
 * Generates a reliable hash ID for a file that works even with filenames containing spaces
 * @param {File} file - The file object to generate a hash for
 * @returns {string} A unique hash ID for the file
 */
export const generateFileHash = (file: File): string => {
  // Extract useful properties that won't change regardless of spaces in name
  const { name, size, type, lastModified } = file;
  
  // Generate a hash that includes both file name and timestamp to ensure uniqueness
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(7);
  const fileNameHash = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .substring(0, 8); // Take first 8 chars
    
  // Create a base string that ensures uniqueness
  return `file-${fileNameHash}-${timestamp}-${rand}`;
};