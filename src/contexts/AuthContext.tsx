import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, User } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (identifier: string, password: string, role: 'admin' | 'employee') => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const signIn = async (identifier: string, password: string, role: 'admin' | 'employee') => {
    try {
      // First, find the user by username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', identifier)
        .maybeSingle();

      if (userError) {
        return { success: false, error: 'An error occurred during sign in' };
      }

      if (!userData) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Check if the password matches
      if (userData.password_hash !== password) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Verify the user's actual role matches the selected role
      if (userData.role !== role) {
        if (role === 'admin' && userData.role === 'employee') {
          return { success: false, error: 'Invalid credentials. Employees cannot sign in as admin.' };
        }
        return { success: false, error: 'Invalid role selected for this account' };
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      };

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true };
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
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
