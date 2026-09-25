import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  clearTokens,
  getAccessToken,
  setSessionExpiredHandler,
  storeTokens,
} from '../services/authTokens';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAccessToken());

  // When a refresh fails, the request layer expires the session; reflect that in the UI
  // so the login screen appears instead of a wall of failed requests.
  useEffect(() => {
    setSessionExpiredHandler(() => setToken(null));
    return () => setSessionExpiredHandler(null);
  }, []);

  const login = (accessToken: string, refreshToken?: string) => {
    storeTokens(accessToken, refreshToken);
    setToken(accessToken);
  };

  const logout = () => {
    clearTokens();
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
