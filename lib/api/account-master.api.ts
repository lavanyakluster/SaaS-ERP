/**
 * Account Master API
 * 
 * ✅ Enterprise Features:
 * - Multi-tenant architecture
 * - TypeScript strict mode
 * - Dynamic request parameters
 * - Proper error handling
 * - Token-based authentication
 */

import { apiClient } from './client';

// ============================================================================
// TYPES - Account Master
// ============================================================================

/**
 * Account Master Create/Update Request
 */
export interface CreateAccountMasterRequest {
  acCode: string;           // Account code (e.g., "QR116")
  acNm: string;             // Account name (e.g., "51 MINIMART RAYYAN")
  acPl: string;             // Account place
  acTyp: string;            // Account type (e.g., "2")
  adAd1?: string;           // Address line 1
  adAd2?: string;           // Address line 2
  adAd3?: string;           // Address line 3
  adBank?: string;          // Bank details
  adBranch: string;         // Branch code (e.g., "001")
  adPh?: string;            // Phone number
  acGc: string;             // Account group code (e.g., "301")
  acSeq: number;            // Sequence number
  adRc: string;             // Record code - REQUIRED (mapped from Reg No)
  adState?: string;         // State
  adStno?: string;          // State number
  adDeatyp?: number;        // Deal type
  adFtyp?: number;          // Field type
  adDis?: number;           // Discount
  adCrp?: number;           // Credit period
  adcrLimit?: number;       // Credit limit
  adMail?: string;          // Email
  acUntyp?: string;         // Unit type - Hardcoded as "h"
  acGrid?: number;          // Grid ID
  adCstno?: string;         // Customer number - Hardcoded as "h"
  editData?: number;        // Edit flag (0 or 1)
  acMaingc?: string;        // Main group code - Hardcoded as "j"
  year: string;             // ✅ Year parameter (e.g., "2026")
}

/**
 * Account Master Create/Update Response
 */
export interface CreateAccountMasterResponse {
  success: boolean;
  message: string;
}

/**
 * Account Autocomplete Item
 */
export interface AccountAutocompleteItem {
  aC_NAME: string;          // Account name
  aC_CODE: string;          // Account code
  aC_ID: number;            // Account ID
}

/**
 * Account Master Details
 */
export interface AccountMasterDetails {
  aC_ID: number;
  aC_COD: string;           // Account code
  aC_NM: string;            // Account name
  aC_PL: string;            // Place
  aC_TYP: string;           // Type
  aC_GC: string;            // Group code
  aC_SEQ: number;           // Sequence
  aC_UNTYP: string;         // Unit type
  aC_INV: string;           // Invoice
  aC_SF: string;            // SF
  aC_SGSTAC: string;        // SGST account
  aC_CGSTAC: string;        // CGST account
  aC_IGSTAC: string;        // IGST account
  aC_VAT: string;           // VAT
  aC_GSTPER: Record<string, any>;  // GST percentage
  aD_COD: string;           // Address code
  aD_AD1: string;           // Address 1
  aD_AD2: string;           // Address 2
  aD_AD3: string;           // Address 3
  aD_BRANCH: string;        // Branch
  aD_BANK: string;          // Bank
  aD_PH: string;            // Phone
  aD_MAIL: string;          // Email
  aD_PIN: string;           // PIN
  aD_DIST: string;          // District
  aD_STATE: string;         // State
  aD_STATENAME: string;     // State name
  aD_COUNTRYCODE: string;   // Country code
  aD_CRLIMIT: number;       // Credit limit
  aD_CRP: number;           // Credit period
  aD_NOB: Record<string, any>;  // Number of branches
  aC_GRID: string;          // Grid
  aC_LLNM: string;          // Legal name
  aD_LLADD: string;         // Legal address
}

/**
 * Group Master Details
 */
export interface GroupMasterDetails {
  gR_ID: number;            // Group ID
  gR_COD: string;           // Group code (e.g., "A1")
  gR_NM: string;            // Group name (e.g., "FIXED ASSET")
  gR_UND: string;           // Under group
  gR_SN: number;            // Serial number
  gR_TYP: string;           // Type
  gR_SF: string;            // SF
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Create or update account master
 * 
 * @param data - Account master data
 * @returns Promise with success response
 * 
 * @example
 * ```ts
 * const response = await createAccountMaster({
 *   acCode: "QR116",
 *   acNm: "51 MINIMART RAYYAN",
 *   acPl: "place",
 *   acTyp: "2",
 *   adBranch: "001",
 *   acGc: "301",
 *   acSeq: 12,
 * });
 * ```
 */
export const createAccountMaster = async (
  data: CreateAccountMasterRequest
): Promise<CreateAccountMasterResponse> => {
  console.log('📡 createAccountMaster API called');
  console.log('Request data:', JSON.stringify(data, null, 2));
  
  const response = await apiClient.post<CreateAccountMasterResponse>(
    '/acmas',
    data
  );
  
  console.log('📡 createAccountMaster API response:', response.data);
  return response.data;
};

/**
 * Search accounts using autocomplete
 * 
 * @param text - Search text
 * @returns Promise with array of matching accounts
 * 
 * @example
 * ```ts
 * const accounts = await searchAccounts('z');
 * ```
 */
export const searchAccounts = async (
  text: string
): Promise<AccountAutocompleteItem[]> => {
  const response = await apiClient.get<AccountAutocompleteItem[]>(
    '/acmas-autoComplete',
    {
      params: { text },
    }
  );
  return response.data;
};

/**
 * Get account master by account code
 * 
 * @param accode - Account code
 * @returns Promise with account details
 * 
 * @example
 * ```ts
 * const account = await getAccountByCode('QR116');
 * ```
 */
export const getAccountByCode = async (
  accode: string
): Promise<AccountMasterDetails> => {
  const response = await apiClient.get<AccountMasterDetails>(
    '/acmas',
    {
      params: { accode },
    }
  );
  return response.data;
};

/**
 * Get group master by group code
 * 
 * @param grCode - Group code
 * @returns Promise with group details
 * 
 * @example
 * ```ts
 * const group = await getGroupByCode('A1');
 * ```
 */
export const getGroupByCode = async (
  grCode: string
): Promise<GroupMasterDetails> => {
  const response = await apiClient.get<GroupMasterDetails>(
    '/groupMas',
    {
      params: { grCode },
    }
  );
  return response.data;
};