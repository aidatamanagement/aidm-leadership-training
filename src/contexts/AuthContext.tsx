
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type UserType = 'admin' | 'student' | null;

interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string, role?: UserType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing - will be removed in production
const demoUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    type: 'admin' as UserType,
  },
  {
    id: '2',
    name: 'John Student',
    email: 'student@example.com',
    password: 'student123',
    type: 'student' as UserType,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to convert Supabase user to our app User type
  const getUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        type: data.role as UserType,
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Check for active session on mount
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // Get session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userProfile = await getUserProfile(session.user);
          
          if (userProfile) {
            setUser(userProfile);
          }
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setIsLoading(true);
          const userProfile = await getUserProfile(session.user);
          if (userProfile) {
            setUser(userProfile);
          }
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // First try Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const userProfile = await getUserProfile(data.user);
        
        if (!userProfile) {
          throw new Error('User profile not found');
        }

        setUser(userProfile);

        toast({
          title: 'Login successful',
          description: `Welcome back, ${userProfile.name}!`,
        });

        // Redirect based on user type
        if (userProfile.type === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      // If Supabase auth fails, try demo users for development purposes
      // This will be removed in production
      const foundUser = demoUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));

        toast({
          title: 'Login successful (Demo)',
          description: `Welcome back, ${userWithoutPassword.name}!`,
        });

        // Redirect based on user type
        if (userWithoutPassword.type === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast({
          title: 'Login failed',
          description: error.message || 'Invalid email or password',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
      navigate('/');
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to log out',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserType = 'student') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: 'Registration successful',
          description: 'Your account has been created. Please log in.',
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup
      }}
    >
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

export const demoUserCredentials = demoUsers.map(user => ({
  email: user.email,
  password: user.password,
  type: user.type
}));
