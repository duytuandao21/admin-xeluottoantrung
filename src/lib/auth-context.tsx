'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ApiError, api, authClient } from '@/lib/api/client';

export interface AdminIdentity {
  profile: { id: string; fullName: string; email?: string | null; phone?: string | null; status: string };
  roles: string[];
  permissions: string[];
}
interface AuthState { identity: AdminIdentity | null; loading: boolean; error: string | null; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; refresh: () => Promise<void> }
const Context = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<AdminIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => { setIdentity(await api<AdminIdentity>('/admin/me')); setError(null); }, []);
  useEffect(() => {
    let live = true;
    const client = (() => { try { return authClient(); } catch { return null; } })();
    if (!client) { queueMicrotask(() => setLoading(false)); return; }
    const sync = async (session: Session | null) => {
      if (!session) { if (live) { setIdentity(null); setError(null); setLoading(false); } return; }
      try { const admin = await api<AdminIdentity>('/admin/me'); if (live) { setIdentity(admin); setError(null); } }
      catch (failure) {
        if (failure instanceof ApiError && [401, 403].includes(failure.status)) { await client.auth.signOut(); if (live) setIdentity(null); }
        else if (live) setError(failure instanceof Error ? failure.message : 'Không thể xác minh phiên đăng nhập.');
      }
      finally { if (live) setLoading(false); }
    };
    void client.auth.getSession().then(({ data }) => sync(data.session));
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') { setIdentity(null); setError(null); setLoading(false); }
      else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') setTimeout(() => void sync(session), 0);
    });
    return () => { live = false; subscription.unsubscribe(); };
  }, []);
  const login = useCallback(async (email: string, password: string) => {
    const { error } = await authClient().auth.signInWithPassword({ email, password });
    if (error) throw new Error('Email hoặc mật khẩu không đúng.');
    try { await refresh(); }
    catch (failure) { if (failure instanceof ApiError && [401, 403].includes(failure.status)) await authClient().auth.signOut(); throw failure; }
  }, [refresh]);
  const logout = useCallback(async () => { await authClient().auth.signOut(); setIdentity(null); setError(null); }, []);
  const value = useMemo(() => ({ identity, loading, error, login, logout, refresh }), [identity, loading, error, login, logout, refresh]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAuth() { const value = useContext(Context); if (!value) throw new Error('AuthProvider is missing'); return value; }
