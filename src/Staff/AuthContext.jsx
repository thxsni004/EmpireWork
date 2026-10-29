import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from './useAuth';

// Shares "who is logged in and what is their role" with every staff page.
// NOTE: this only decides what to SHOW. The database rules decide what is ALLOWED.
export function AuthProvider({ children }) {
  // undefined = still checking, null = logged out, object = logged in
  const [session, setSession] = useState(undefined);
  // { userId, data } so we know which user the loaded profile belongs to
  const [profileState, setProfileState] = useState(null);

  // 1. Find out if someone is already logged in, and listen for login/logout
  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // 2. When the logged-in user changes, load their profile (role, name, active)
  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('id, full_name, email, role, is_active')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!cancelled) setProfileState({ userId, data: error ? null : data });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const profile = userId && profileState?.userId === userId ? profileState.data : null;
  const loading = session === undefined || (Boolean(userId) && profileState?.userId !== userId);
  // Inactive staff, or staff without a role, get no access
  const role = profile?.is_active ? profile.role : null;

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, profile, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
