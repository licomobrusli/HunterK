// src/config/sanitizer.ts

/**
 * Sanitizes a string to be safe for use as a file name.
 * Removes invalid characters and trims whitespace.
 *
 * @param name The string to sanitize.
 * @returns The sanitized string.
 */
export const sanitizeFileName = (name: string): string => {
    // Remove invalid characters: / ? < > \ : * | "
    // Also remove any leading or trailing whitespace
    return name
      .trim()
      .replace(/[/\\?%*:|"<>]/g, '')
      .replace(/\s+/g, '_'); // Optionally replace spaces with underscores
  };
