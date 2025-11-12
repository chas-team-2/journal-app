/**
 * Sanitizes a filename by replacing invalid characters with underscores.
 * 
 * Valid characters are: letters (a-z, A-Z), numbers (0-9), underscores (_), 
 * hyphens (-), and dots (.).
 * 
 * Windows reserved names and characters are also handled.
 * 
 * @param filename - The filename to sanitize
 * @returns Object with sanitized filename and validity status
 */

// Windows reserved filenames (case-insensitive)
const WINDOWS_RESERVED_NAMES = [
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
]

// Maximum filename length (Windows has 255 char limit, we use 255 for safety)
const MAX_FILENAME_LENGTH = 255

export interface SanitizeResult {
  /** The sanitized filename */
  filename: string
  /** Whether the filename is valid */
  isValid: boolean
  /** Error message if invalid */
  error?: string
  /** Whether the filename was modified during sanitization */
  wasModified: boolean
}

/**
 * Sanitizes a filename to be safe for Windows and Unix systems
 */
export function sanitizeFilename(filename: string): SanitizeResult {
  // Check for empty or whitespace-only filename
  if (!filename || filename.trim().length === 0) {
    return {
      filename: '',
      isValid: false,
      error: 'Filename cannot be empty',
      wasModified: false
    }
  }

  const originalFilename = filename

  // Remove leading/trailing whitespace and dots (Windows doesn't allow these)
  let sanitized = filename.trim().replace(/^\.+|\.+$/g, '')

  // Replace invalid characters with underscores
  // Valid: a-z, A-Z, 0-9, underscore, hyphen, dot
  sanitized = sanitized.replace(/[^a-zA-Z0-9_\-.]/g, '_')

  // Remove multiple consecutive dots (potential directory traversal)
  sanitized = sanitized.replace(/\.{2,}/g, '.')

  // Remove multiple consecutive underscores for cleaner output
  sanitized = sanitized.replace(/_{2,}/g, '_')

  // Check if filename is now empty after sanitization
  if (sanitized.length === 0) {
    return {
      filename: '',
      isValid: false,
      error: 'Filename contains only invalid characters',
      wasModified: true
    }
  }

  // Check for Windows reserved names
  const nameWithoutExtension = sanitized.split('.')[0].toUpperCase()
  if (WINDOWS_RESERVED_NAMES.includes(nameWithoutExtension)) {
    return {
      filename: sanitized,
      isValid: false,
      error: `Filename "${nameWithoutExtension}" is reserved by Windows`,
      wasModified: originalFilename !== sanitized
    }
  }

  // Check filename length
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    return {
      filename: sanitized,
      isValid: false,
      error: `Filename exceeds maximum length of ${MAX_FILENAME_LENGTH} characters`,
      wasModified: originalFilename !== sanitized
    }
  }

  // Final validation: ensure only valid characters remain
  const validPattern = /^[a-zA-Z0-9_\-.]+$/
  if (!validPattern.test(sanitized)) {
    return {
      filename: sanitized,
      isValid: false,
      error: 'Sanitized filename still contains invalid characters',
      wasModified: true
    }
  }

  // Check if filename has at least one character before the extension
  if (sanitized.startsWith('.')) {
    return {
      filename: sanitized,
      isValid: false,
      error: 'Filename must have characters before the extension',
      wasModified: originalFilename !== sanitized
    }
  }

  return {
    filename: sanitized,
    isValid: true,
    wasModified: originalFilename !== sanitized
  }
}

/**
 * Helper function to extract file extension
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  return lastDot > 0 ? filename.substring(lastDot) : ''
}

/**
 * Helper function to get filename without extension
 */
export function getFilenameWithoutExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  return lastDot > 0 ? filename.substring(0, lastDot) : filename
}
