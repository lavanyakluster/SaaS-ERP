/**
 * Organization API
 * 
 * Handles organization creation and management
 * Following enterprise multi-tenant architecture patterns
 */

import { apiClient } from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateOrganizationRequest {
  CompanyName: string;
  Industry: string;
  Country: string;
  Currency: string;
  FiscalYearStart: string; // e.g., "April", "January"
  CompanyPhone: string;
  CompanyEmail: string;
  Timezone: string; // e.g., "Asia/Kolkata"
}

// ✅ Update Organization Request (same fields as create)
export interface UpdateOrganizationRequest {
  CompanyName: string;
  Industry: string;
  Country: string;
  Currency: string;
  FiscalYearStart: string; // e.g., "April", "January"
  CompanyPhone: string;
  CompanyEmail: string;
  Timezone: string; // e.g., "Asia/Kolkata"
}

// ✅ Update Organization Response
export interface UpdateOrganizationResponse {
  status: string; // "success" | "error"
  message: string;
  data?: OrganizationDetails;
}

// ✅ Delete Organization Response
export interface DeleteOrganizationResponse {
  status: string; // "success" | "error"
  message: string;
}

export interface Organization {
  id: string;
  name: string;
  timezone: string;
  currency: string;
  status: string; // "ACTIVE", "INACTIVE"
  created_at: string;
  phone_number?: string; // ✅ Added optional fields from switch API
  email?: string;
  api_url?: string; // ✅ Organization-specific API URL
}

// ✅ NEW: Organization list item from GET /organizations
export interface OrganizationListItem {
  id: string;
  organizationName: string;
}

// ✅ NEW: Get Organizations response
export interface GetOrganizationsResponse {
  status: string; // "success" | "error"
  count: number;
  data: OrganizationListItem[];
  message?: string;
}

// ✅ NEW: Organization details from GET /organizations/:id
export interface OrganizationDetails {
  id: string;
  organizationName: string;
  status: 'ACTIVE' | 'INACTIVE';
  industry: string;
  country: string;
  currency: string;
  timezone: string;
  finacialYear: string; // Note: API has typo "finacialYear" instead of "fiscalYear"
  phoneNumber: string;
  email: string;
}

// ✅ NEW: Get Organization By ID response
export interface GetOrganizationByIdResponse {
  status: string; // "success" | "error"
  data: OrganizationDetails;
  message?: string;
}

export interface UserRole {
  id: string;
  name: string; // "OWNER", "ADMIN", "USER"
}

export interface UserContext {
  user_id: string;
  role: UserRole;
  permissions: string[];
  is_owner: boolean;
}

export interface OrganizationTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface CreateOrganizationResponse {
  success: boolean;
  message: string;
  data: {
    organization: Organization;
    user_context: UserContext;
    tokens: OrganizationTokens;
  };
}

export interface SwitchOrganizationResponse {
  data: {
    organization: Organization;
    user_context: UserContext;
    tokens: OrganizationTokens;
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all organizations for the authenticated user
 * 
 * Organization context is derived from the JWT token in the Authorization header.
 * The backend automatically filters organizations based on the user's access.
 * 
 * @returns List of organizations the user has access to
 * 
 * @example
 * ```ts
 * const response = await getOrganizations();
 * console.log(response.data); // Array of organizations
 * ```
 */
export const getOrganizations = async (): Promise<GetOrganizationsResponse> => {
  const response = await apiClient.get<GetOrganizationsResponse>('/organizations');
  return response.data;
};

/**
 * Create a new organization
 * 
 * @param data - Organization creation data
 * @returns Organization details, user context, and new tokens with org context
 * 
 * @example
 * ```ts
 * const response = await createOrganization({
 *   CompanyName: 'Acme Corp',
 *   Industry: 'Technology',
 *   Country: 'India',
 *   Currency: 'INR',
 *   FiscalYearStart: 'April',
 *   CompanyPhone: '+91-9876543210',
 *   CompanyEmail: 'info@acme.com',
 *   Timezone: 'Asia/Kolkata',
 * });
 * ```
 */
export const createOrganization = async (
  data: CreateOrganizationRequest
): Promise<CreateOrganizationResponse> => {
  const response = await apiClient.post<CreateOrganizationResponse>(
    '/organizations',
    data
  );
  return response.data;
};

/**
 * Switch to a different organization
 * 
 * Changes the active organization context for the current user.
 * Returns new tokens with the switched organization context embedded.
 * 
 * @param organizationId - ID of the organization to switch to
 * @returns Organization details, user context, and new tokens
 * 
 * @example
 * ```ts
 * const response = await switchOrganization('074be0f8-ad02-4518-a154-487db67af2b2');
 * console.log(response.data.organization.name); // "SREE333"
 * console.log(response.data.tokens.access_token); // New JWT with org context
 * ```
 */
export const switchOrganization = async (
  organizationId: string
): Promise<SwitchOrganizationResponse> => {
  const response = await apiClient.get<SwitchOrganizationResponse>(
    `/switch-org/${organizationId}`
  );
  return response.data;
};

/**
 * Get organization details by ID
 * 
 * Fetches detailed information about a specific organization.
 * The organization ID must belong to the authenticated user's accessible organizations.
 * Backend validates access rights from the JWT token.
 * 
 * @param organizationId - ID of the organization to fetch
 * @returns Organization details including name, status, industry, country, etc.
 * 
 * @example
 * ```ts
 * const response = await getOrganizationById('ed326080-e8b1-42be-8bd3-32e0d2f6d4ba');
 * console.log(response.data.organizationName); // "Ruman Pharmacy Group"
 * console.log(response.data.status); // "ACTIVE"
 * console.log(response.data.industry); // "Healthcare"
 * ```
 */
export const getOrganizationById = async (
  organizationId: string
): Promise<GetOrganizationByIdResponse> => {
  const response = await apiClient.get<GetOrganizationByIdResponse>(
    `/organizations/${organizationId}`
  );
  return response.data;
};

/**
 * Update organization details by ID
 * 
 * Updates detailed information about a specific organization.
 * The organization ID must belong to the authenticated user's accessible organizations.
 * Backend validates access rights from the JWT token.
 * 
 * @param organizationId - ID of the organization to update
 * @param data - Organization update data
 * @returns Updated organization details including name, status, industry, country, etc.
 * 
 * @example
 * ```ts
 * const response = await updateOrganization('ed326080-e8b1-42be-8bd3-32e0d2f6d4ba', {
 *   CompanyName: 'Ruman Pharmacy Group',
 *   Industry: 'Healthcare',
 *   Country: 'India',
 *   Currency: 'INR',
 *   FiscalYearStart: 'April',
 *   CompanyPhone: '+91-9876543210',
 *   CompanyEmail: 'info@ruman.com',
 *   Timezone: 'Asia/Kolkata',
 * });
 * console.log(response.data.organizationName); // "Ruman Pharmacy Group"
 * console.log(response.data.status); // "ACTIVE"
 * console.log(response.data.industry); // "Healthcare"
 * ```
 */
export const updateOrganization = async (
  organizationId: string,
  data: UpdateOrganizationRequest
): Promise<UpdateOrganizationResponse> => {
  const response = await apiClient.put<UpdateOrganizationResponse>(
    `/organizations/${organizationId}`,
    data
  );
  return response.data;
};

/**
 * Delete organization by ID
 * 
 * Deletes a specific organization.
 * The organization ID must belong to the authenticated user's accessible organizations.
 * Backend validates access rights from the JWT token.
 * 
 * @param organizationId - ID of the organization to delete
 * @returns Delete organization response
 * 
 * @example
 * ```ts
 * const response = await deleteOrganization('ed326080-e8b1-42be-8bd3-32e0d2f6d4ba');
 * console.log(response.message); // "Organization deleted successfully"
 * ```
 */
export const deleteOrganization = async (
  organizationId: string
): Promise<DeleteOrganizationResponse> => {
  const response = await apiClient.delete<DeleteOrganizationResponse>(
    `/organizations/${organizationId}`
  );
  return response.data;
};