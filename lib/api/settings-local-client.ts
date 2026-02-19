import axios, { AxiosHeaders, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const ACCESS_TOKEN_KEY = 'sb_access_token';
const SELECTED_ORG_KEY = 'sb_selected_organization';

const getOrganizationIdFromSession = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = sessionStorage.getItem(SELECTED_ORG_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { id?: unknown };
    if (typeof parsed.id === 'string' && parsed.id.trim()) {
      return parsed.id.trim();
    }
  } catch {
    return null;
  }

  return null;
};

export const settingsApiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

settingsApiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    const organizationId = getOrganizationIdFromSession();
    const headers = AxiosHeaders.from(config.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (organizationId) {
      headers.set('x-organization-id', organizationId);
    }

    config.headers = headers;
  }

  return config;
});
