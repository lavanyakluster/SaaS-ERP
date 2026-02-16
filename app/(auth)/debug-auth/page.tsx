'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

export default function DebugAuthPage() {
  const [mounted, setMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const runDebug = () => {
    const state = useAuthStore.getState();
    const accessToken = state.getAccessToken();
    
    const info = {
      timestamp: new Date().toISOString(),
      store: {
        status: state.status,
        hasUser: !!state.user,
        hasTokensObject: !!state.tokens,
        tokensObject: state.tokens,
      },
      getAccessToken: {
        hasToken: !!accessToken,
        tokenType: typeof accessToken,
        tokenValue: accessToken ? `${accessToken.substring(0, 50)}...` : null,
        isString: typeof accessToken === 'string',
      },
      sessionStorage: {
        accessToken: sessionStorage.getItem('sb_access_token')?.substring(0, 50) + '...',
        refreshToken: sessionStorage.getItem('sb_refresh_token')?.substring(0, 50) + '...',
      },
    };
    
    setDebugInfo(info);
    console.log('🔍 Debug Info:', info);
  };

  const testTokenFlow = () => {
    console.log('🧪 Testing token flow...');
    
    // Simulate setting tokens like OAuth does
    const testAccess = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
    const testRefresh = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh';
    
    console.log('1. Setting tokens:', { testAccess, testRefresh });
    useAuthStore.getState().setTokens(testAccess, testRefresh, 3600);
    
    console.log('2. Getting token back...');
    const retrieved = useAuthStore.getState().getAccessToken();
    
    console.log('3. Result:', {
      original: testAccess,
      retrieved: retrieved,
      match: testAccess === retrieved,
      type: typeof retrieved,
    });
    
    runDebug();
  };

  const clearAll = () => {
    console.log('🧹 Clearing all auth data...');
    
    // Clear Zustand
    useAuthStore.getState().reset();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear localStorage auth keys
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('organizationName');
    localStorage.removeItem('isNewUser');
    localStorage.removeItem('needsTenantSetup');
    localStorage.removeItem('emailVerified');
    localStorage.removeItem('pendingUserEmail');
    localStorage.removeItem('pendingUserName');
    
    setDebugInfo(null);
    console.log('✅ All auth data cleared!');
    
    alert('✅ All auth data cleared! Please log in again.');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Auth Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={runDebug}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Run Debug
            </button>
            <button
              onClick={testTokenFlow}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Token Flow
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All
            </button>
          </div>
        </div>

        {debugInfo && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Results</h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold mb-2">📋 Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Open browser console (F12)</li>
            <li>Click "Run Debug" to see current auth state</li>
            <li>Click "Test Token Flow" to test setting/getting tokens</li>
            <li>Check console for detailed logs</li>
            <li>If token type is not "string", we found the bug!</li>
          </ol>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold mb-2">🔧 Quick Fix Test:</h3>
          <p className="text-sm mb-4">
            After OAuth login, run this in console:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto">
            {`// Check what's in store
const token = useAuthStore.getState().getAccessToken();
console.log('Token type:', typeof token);
console.log('Token value:', token);`}
          </pre>
        </div>
      </div>
    </div>
  );
}