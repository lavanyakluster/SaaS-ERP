/**
 * Auto Organization Switch Hook
 * 
 * Automatically switches to the first organization after login
 */

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useOrganizations } from './useOrganizations';
import { useSwitchOrganization } from './useSwitchOrganization';
import { useQueryClient } from '@tanstack/react-query';

export const useAutoOrganizationSwitch = () => {
  const shouldShowOrgSwitcher = useAuthStore(state => state.shouldShowOrgSwitcher);
  const setShouldShowOrgSwitcher = useAuthStore(state => state.setShouldShowOrgSwitcher);
  const selectedOrganization = useAuthStore(state => state.selectedOrganization);
  const hasSwitched = useRef(false);
  const queryClient = useQueryClient();

  // Fetch organizations list
  const { data: organizations, isSuccess: orgsLoaded } = useOrganizations();

  // Switch organization mutation (with silent mode - no toast)
  const { mutate: switchOrg, isPending: isSwitching } = useSwitchOrganization({
    silent: true, // ✅ Suppress toast for auto-switch
    onSuccess: () => {
      console.log('✅ Auto organization switch completed');
      
      // Clear the flag
      setShouldShowOrgSwitcher(false);
      hasSwitched.current = false;
      
      // ⚡ OPTIMIZED: Don't invalidate years here - components will fetch it when needed
      console.log('✅ Organization switched, components will fetch years automatically');
    },
    onError: (error) => {
      console.error('❌ Auto organization switch failed:', error);
      setShouldShowOrgSwitcher(false);
      hasSwitched.current = false;
    },
  });

  useEffect(() => {
    // Only proceed if:
    // 1. Flag is set to show org switcher
    // 2. Organizations have loaded
    // 3. We haven't already triggered a switch
    // 4. Not currently switching
    // 5. No organization is selected (meaning user just logged in)
    if (
      shouldShowOrgSwitcher &&
      orgsLoaded &&
      organizations &&
      organizations.length > 0 &&
      !hasSwitched.current &&
      !isSwitching &&
      !selectedOrganization
    ) {
      console.log('🔄 Auto-switching to first organization after login...');
      console.log('📋 Available organizations:', organizations.map(o => o.organizationName));
      
      hasSwitched.current = true;
      
      // Switch to the first organization
      const firstOrg = organizations[0];
      console.log('🎯 Switching to:', firstOrg.organizationName);
      
      switchOrg(firstOrg.id); // Just pass the ID
    }
  }, [
    shouldShowOrgSwitcher,
    orgsLoaded,
    organizations,
    isSwitching,
    selectedOrganization,
    switchOrg,
  ]);

  return {
    isAutoSwitching: isSwitching && shouldShowOrgSwitcher,
  };
};
