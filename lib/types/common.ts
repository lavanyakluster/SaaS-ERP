/**
 * Common Type Definitions
 * Shared types used across the application
 */

export type Theme = 'light' | 'dark';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  field: string;
  order: SortOrder;
}

export type Status = 'draft' | 'posted' | 'cancelled' | 'pending' | 'completed' | 'failed' | 'Draft' | 'Posted' | 'Cancelled' | 'Pending' | 'Completed' | 'Failed';
