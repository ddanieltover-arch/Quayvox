import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type UserRole = 'admin' | 'viewer';

export type AuthUser = {
  email: string;
};

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAdmin: boolean;
  loading: boolean;
  configured: boolean;
  apiError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      let data: {
        configured?: boolean;
        user?: AuthUser | null;
        role?: UserRole | null;
      } = {};

      try {
        data = (await res.json()) as typeof data;
      } catch {
        data = {};
      }

      if (res.status >= 500) {
        setConfigured(false);
        setApiError('Admin API is unavailable. Check Vercel function logs and redeploy.');
        setUser(null);
        setRole(null);
        return;
      }

      if (res.status === 503) {
        setConfigured(false);
        setApiError(null);
        setUser(null);
        setRole(null);
        return;
      }

      setApiError(null);
      setConfigured(data.configured !== false);
      setUser(data.user ?? null);
      setRole(data.role ?? null);
    } catch {
      setConfigured(false);
      setApiError('Cannot reach admin API. Run vercel dev from the repo root (local) or check Vercel deploy.');
      setUser(null);
      setRole(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refreshProfile();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [refreshProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as {
        error?: string;
        configured?: boolean;
        user?: AuthUser;
        role?: UserRole;
      };

      if (res.status >= 500) {
        setConfigured(false);
        setApiError('Admin API is unavailable. Check Vercel function logs and redeploy.');
        return { error: 'Admin API is unavailable. Check Vercel function logs and redeploy.' };
      }

      if (res.status === 503) {
        setConfigured(false);
        setApiError(null);
        return { error: data.error || 'Auth is not configured on the server.' };
      }

      if (!res.ok) {
        return { error: data.error || 'Sign in failed' };
      }

      setApiError(null);
      setConfigured(true);
      setUser(data.user ?? { email });
      setRole(data.role ?? 'admin');
      return { error: null };
    } catch {
      setConfigured(false);
      setApiError('Cannot reach admin API.');
      return {
        error: 'Cannot reach auth API. Run `vercel dev` from the repo root (proxied via Vite).',
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore network errors on logout
    }
    setUser(null);
    setRole(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      isAdmin: role === 'admin',
      loading,
      configured,
      apiError,
      signIn,
      signOut,
      refreshProfile,
    }),
    [user, role, loading, configured, apiError, signIn, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
