/**
 * Branch API
 */

import { apiClient } from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface Branch {
  bR_COD: string; // Branch code (e.g., "S01", "005")
  bR_NM: string; // Branch name (e.g., "AL BADAR DRUGS STORE L.L.C")
  bR_BUNIT: number; // Business unit ID (e.g., 1, 2, 3)
}

export interface BranchResponse extends Array<Branch> {}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all branches for the selected year
 * @param year - Year to fetch branches for (e.g., "2026")
 * @returns Array of branches
 */
export const getAllBranches = async (year?: string): Promise<Branch[]> => {
  const params = year ? { year } : {};
  const response = await apiClient.get<Branch[]>('/branchAll', { params });
  return Array.from(
    new Map(response.data.map((branch) => [branch.bR_COD, branch])).values()
  );
};
