/**
 * Year Types
 * Type definitions for fiscal year management
 */

/**
 * Year response from API
 * Returns array of year strings like ["2023", "2024", "2025", "2026"]
 */
export type YearsList = string[];

/**
 * Year selection state
 */
export interface YearSelection {
  selectedYear: string | null;
  availableYears: string[];
}
