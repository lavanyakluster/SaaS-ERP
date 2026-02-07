/**
 * Hook for getting branch code from branch name
 * Returns "0" for "All Branches" to fetch data for all branches
 */

import type { Branch } from '@/lib/api';

export const useBranchCode = (selectedBranch: string, branches: Branch[]): string => {
  // Handle "All Branches" case - return "0" for all branches
  if (selectedBranch === 'All Branches') {
    return '0';
  }

  // Find the selected branch in the branches array
  const branch = branches.find(b => b.bR_NM === selectedBranch);
  
  // Return the branch code if found
  if (branch) {
    return branch.bR_COD;
  }

  // Fallback: If no branch found and we have branches, use the first one
  if (branches.length > 0) {
    return branches[0].bR_COD;
  }

  // Final fallback - "0" means all branches
  return '0';
};