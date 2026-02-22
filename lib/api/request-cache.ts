const SELECTED_ORG_KEY = 'sb_selected_organization';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const getOrganizationScope = (): string => {
  if (typeof window === 'undefined') {
    return 'server';
  }

  const raw = sessionStorage.getItem(SELECTED_ORG_KEY);
  if (!raw) {
    return 'default';
  }

  try {
    const parsed = JSON.parse(raw) as { id?: unknown };
    if (typeof parsed.id === 'string' && parsed.id.trim()) {
      return parsed.id.trim();
    }
  } catch {
    return 'default';
  }

  return 'default';
};

export const buildScopedCacheKey = (resource: string, id?: string): string => {
  const scope = getOrganizationScope();
  return id ? `${resource}:${scope}:${id}` : `${resource}:${scope}`;
};

export const getCachedValue = <T>(
  cache: Map<string, CacheEntry<T>>,
  key: string
): T | null => {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value;
};

export const setCachedValue = <T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  value: T,
  ttlMs: number
): void => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

export const clearCache = <T>(cache: Map<string, CacheEntry<T>>): void => {
  cache.clear();
};
