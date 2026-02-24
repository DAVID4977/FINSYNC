import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: any; // You should replace 'any' with a proper User type
  isLoading: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('finsync_token');
      const storedUser = localStorage.getItem('finsync_user');
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        // If parsing fails, it's better to clear the broken state for security.
        localStorage.removeItem('finsync_token');
        localStorage.removeItem('finsync_user');
        setUser(null);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem('finsync_token', token);
    localStorage.setItem('finsync_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('finsync_token');
    localStorage.removeItem('finsync_user');
    setUser(null);
  };

  const value = { user, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};