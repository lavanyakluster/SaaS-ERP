import { useQuery } from '@tanstack/react-query';
import { getAllBranches, Branch } from '@/lib/api/branch.api';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Hook to fetch all branches
 * 
 * @example
 * ```tsx
 * const { data: branches, isLoading, error } = useBranches();
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * 
 * return (
 *   <select>
 *     {branches?.map(branch => (
 *       <option key={branch.bR_COD} value={branch.bR_COD}>
 *         {branch.bR_NM}
 *       </option>
 *     ))}
 *   </select>
 * );
 * ```
 */
export const useBranches = () => {
  // ✅ CRITICAL: Don't fetch if user is not authenticated OR if logging out OR if switching organizations
  const status = useAuthStore(state => state.status);
  const isLoggingOut = useAuthStore(state => state.isLoggingOut);
  const isSwitchingOrganization = useAuthStore(state => state.isSwitchingOrganization);
  const selectedYear = useAuthStore(state => state.selectedYear);
  const isAuthenticated = status === 'authenticated' && !isLoggingOut && !isSwitchingOrganization;

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 useBranches - Auth Check:', {
      status,
      isLoggingOut,
      isSwitchingOrganization,
      isAuthenticated,
      selectedYear,
    });
  }

  return useQuery<Branch[], Error>({
    queryKey: ['branches', selectedYear],
    queryFn: () => getAllBranches(selectedYear || undefined),
    staleTime: 30 * 60 * 1000, // ⚡ 30 minutes - branches rarely change
    gcTime: 60 * 60 * 1000, // ⚡ 60 minutes cache time
    retry: false, // ❌ DISABLED: No automatic retries on failure
    enabled: isAuthenticated && !!selectedYear, // ✅ Only fetch if authenticated AND year is selected
    refetchOnMount: false, // ⚡ Don't refetch on mount if cached
    refetchOnWindowFocus: false, // ⚡ Don't refetch on window focus
  });
};

/**
 * Hook to get a specific branch by code
 * 
 * @param branchCode - Branch code to find
 * @returns Branch object or undefined
 * 
 * @example
 * ```tsx
 * const branch = useBranchByCode('S01');
 * console.log(branch?.bR_NM); // "AL BADAR DRUGS STORE L.L.C"
 * ```
 */
export const useBranchByCode = (branchCode: string | null | undefined) => {
  const { data: branches } = useBranches();
  
  if (!branchCode || !branches) return undefined;
  
  return branches.find((branch) => branch.bR_COD === branchCode);
};

/**
 * Hook to get branches by business unit
 * 
 * @param businessUnit - Business unit ID to filter by
 * @returns Array of branches in that business unit
 * 
 * @example
 * ```tsx
 * const { data: branches } = useBranchesByBusinessUnit(1);
 * // Returns all branches with bR_BUNIT === 1
 * ```
 */
export const useBranchesByBusinessUnit = (businessUnit: number | null | undefined) => {
  const { data: branches, ...rest } = useBranches();
  
  const filteredBranches = branches?.filter((branch) => branch.bR_BUNIT === businessUnit) || [];
  
  return {
    data: filteredBranches,
    ...rest,
  };
};