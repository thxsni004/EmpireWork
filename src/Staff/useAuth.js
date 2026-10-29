import { createContext, useContext } from 'react';

// The shared login information (filled in by AuthProvider in AuthContext.jsx)
export const AuthContext = createContext(null);

// Use this in any staff page: const { profile, role, signOut } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
