/**
 * Validation Utilities
 * Common validation functions for forms and user input
 */

import { VALIDATION } from '@/lib/constants/app';

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

/**
 * Validate email address
 * @param email - Email to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION.email.pattern.test(email.trim());
}

// ============================================================================
// PHONE VALIDATION
// ============================================================================

/**
 * Validate phone number
 * @param phone - Phone number to validate
 * @returns True if valid
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  return VALIDATION.phone.pattern.test(phone.trim());
}

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result with errors
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password || password.length < VALIDATION.password.minLength) {
    errors.push(`Password must be at least ${VALIDATION.password.minLength} characters long`);
  }

  if (password.length > VALIDATION.password.maxLength) {
    errors.push(`Password must not exceed ${VALIDATION.password.maxLength} characters`);
  }

  if (VALIDATION.password.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (VALIDATION.password.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (VALIDATION.password.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (VALIDATION.password.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if password is strong
 * @param password - Password to check
 * @returns True if strong
 */
export function isStrongPassword(password: string): boolean {
  return validatePassword(password).isValid;
}

/**
 * Get password strength level
 * @param password - Password to check
 * @returns Strength level (0-4)
 */
export function getPasswordStrength(password: string): number {
  if (!password) return 0;

  let strength = 0;

  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  return Math.min(strength, 4);
}

// ============================================================================
// USERNAME VALIDATION
// ============================================================================

/**
 * Validate username
 * @param username - Username to validate
 * @returns True if valid
 */
export function isValidUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false;
  
  const { minLength, maxLength, pattern } = VALIDATION.username;
  
  if (username.length < minLength || username.length > maxLength) {
    return false;
  }

  return pattern.test(username);
}

// ============================================================================
// URL VALIDATION
// ============================================================================

/**
 * Validate URL
 * @param url - URL to validate
 * @returns True if valid
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// NUMBER VALIDATION
// ============================================================================

/**
 * Validate if value is a number
 * @param value - Value to validate
 * @returns True if number
 */
export function isNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Validate if value is a positive number
 * @param value - Value to validate
 * @returns True if positive number
 */
export function isPositiveNumber(value: any): boolean {
  return isNumber(value) && parseFloat(value) > 0;
}

/**
 * Validate if value is within range
 * @param value - Value to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if in range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// ============================================================================
// STRING VALIDATION
// ============================================================================

/**
 * Check if string is empty or whitespace
 * @param str - String to check
 * @returns True if empty
 */
export function isEmptyString(str: string): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Validate string length
 * @param str - String to validate
 * @param min - Minimum length
 * @param max - Maximum length
 * @returns True if valid length
 */
export function isValidLength(str: string, min: number, max: number): boolean {
  if (!str) return false;
  const length = str.trim().length;
  return length >= min && length <= max;
}

// ============================================================================
// DATE VALIDATION
// ============================================================================

/**
 * Validate if value is a valid date
 * @param value - Value to validate
 * @returns True if valid date
 */
export function isValidDate(value: any): boolean {
  if (!value) return false;
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Check if date is in the future
 * @param date - Date to check
 * @returns True if future date
 */
export function isFutureDate(date: Date | string): boolean {
  if (!isValidDate(date)) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() > Date.now();
}

/**
 * Check if date is in the past
 * @param date - Date to check
 * @returns True if past date
 */
export function isPastDate(date: Date | string): boolean {
  if (!isValidDate(date)) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() < Date.now();
}

// ============================================================================
// FORM VALIDATION
// ============================================================================

/**
 * Validate required field
 * @param value - Value to validate
 * @returns Validation result
 */
export function validateRequired(value: any): {
  isValid: boolean;
  error?: string;
} {
  const isEmpty = value === null || 
                  value === undefined || 
                  (typeof value === 'string' && value.trim() === '') ||
                  (Array.isArray(value) && value.length === 0);

  return {
    isValid: !isEmpty,
    error: isEmpty ? 'This field is required' : undefined,
  };
}

/**
 * Validate email field
 * @param email - Email to validate
 * @returns Validation result
 */
export function validateEmailField(email: string): {
  isValid: boolean;
  error?: string;
} {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: VALIDATION.email.message };
  }

  return { isValid: true };
}

/**
 * Validate password field
 * @param password - Password to validate
 * @returns Validation result
 */
export function validatePasswordField(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  const validation = validatePassword(password);
  
  return {
    isValid: validation.isValid,
    error: validation.errors[0],
  };
}

/**
 * Validate password confirmation
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Validation result
 */
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): {
  isValid: boolean;
  error?: string;
} {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
}

// ============================================================================
// FILE VALIDATION
// ============================================================================

/**
 * Validate file size
 * @param file - File to validate
 * @param maxSizeInMB - Maximum size in MB
 * @returns Validation result
 */
export function validateFileSize(
  file: File,
  maxSizeInMB: number
): {
  isValid: boolean;
  error?: string;
} {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size must not exceed ${maxSizeInMB}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Validate file type
 * @param file - File to validate
 * @param allowedTypes - Allowed MIME types
 * @returns Validation result
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): {
  isValid: boolean;
  error?: string;
} {
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type must be one of: ${allowedTypes.join(', ')}`,
    };
  }

  return { isValid: true };
}
