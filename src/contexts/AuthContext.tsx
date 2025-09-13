import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  rollNumber?: string; // Only for students
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface LoginCredentials {
  role: UserRole;
  rollNumber?: string;
  username?: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem('cafe_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (credentials.role === 'admin') {
        // Fixed admin credentials
        if (credentials.username === 'admin' && credentials.password === 'CBIT23') {
          const adminUser: User = {
            id: 'admin',
            name: 'Admin',
            role: 'admin'
          };
          setUser(adminUser);
          localStorage.setItem('cafe_user', JSON.stringify(adminUser));
          return true;
        }
      } else if (credentials.role === 'student') {
        // Simple student validation (roll number + password)
        if (credentials.rollNumber && credentials.password) {
          const studentUser: User = {
            id: credentials.rollNumber,
            name: `Student ${credentials.rollNumber}`,
            role: 'student',
            rollNumber: credentials.rollNumber
          };
          setUser(studentUser);
          localStorage.setItem('cafe_user', JSON.stringify(studentUser));
          return true;
        }
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cafe_user');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};