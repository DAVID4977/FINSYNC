import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  gstin?: string;
  panNumber?: string;
  phoneNumber?: string;
  avatar?: string;
  role?: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: any; user: any }>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  company: string;
  gstin?: string;
  panNumber?: string;
  phoneNumber?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Clear any existing session on fresh app start to force new login
    const initializeAuth = async () => {
      // Always clear stored authentication on fresh app start
      localStorage.removeItem("finsync_token");
      localStorage.removeItem("finsync_user");
      setUser(null);
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }
      
      // Store token and user data
      localStorage.setItem("finsync_token", data.token);
      localStorage.setItem("finsync_user", JSON.stringify(data.user));
      setUser(data.user);
      
      // Redirect to dashboard
      setLocation("/dashboard");
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Registration failed');
      }
      
      // IMPORTANT: Do NOT set user or token after registration
      // User must sign in separately as per your requirement
      
      // Return success data for UI to handle
      return {
        success: true,
        message: data.message,
        user: data.user
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("finsync_token");
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Profile update failed');
      }
      
      // Update user state with new data
      const updatedUser = data.user;
      setUser(updatedUser);
      
      // Update localStorage with new user data
      localStorage.setItem("finsync_user", JSON.stringify(updatedUser));
      
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("finsync_token");
      if (token) {
        // Call logout endpoint to invalidate session
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      setUser(null);
      localStorage.removeItem("finsync_token");
      localStorage.removeItem("finsync_user");
      localStorage.clear();
      setIsLoading(false);
      setLocation("/");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
