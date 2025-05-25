"use client";

import { useState, useEffect } from 'react';

export interface Designer {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  joinedDate: string;
  avatar?: string;
  bio?: string;
  socialLinks?: {
    instagram?: string;
    website?: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  designer: Designer | null;
  isLoading: boolean;
}

// Mock authenticated designer data
const mockDesigners: Designer[] = [
  {
    id: 'designer_123',
    name: 'Elena Popescu',
    email: 'elena@example.com',
    verified: true,
    joinedDate: '2024-01-15',
    bio: 'Contemporary fashion designer specializing in sustainable luxury wear',
    socialLinks: {
      instagram: '@elena.designs',
      website: 'elenafashion.ro'
    }
  },
  {
    id: 'designer_456',
    name: 'Andrei Munteanu',
    email: 'andrei@example.com',
    verified: true,
    joinedDate: '2024-02-20',
    bio: 'Avant-garde designer focused on experimental textiles and forms'
  },
  {
    id: 'designer_789',
    name: 'Maria Ionescu',
    email: 'maria@example.com',
    verified: false,
    joinedDate: '2024-03-10',
    bio: 'Emerging designer with a passion for traditional Romanian craftsmanship'
  }
];

export function useAuth(): AuthState & {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchDesigner: (designerId: string) => void;
} {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    designer: null,
    isLoading: true
  });

  useEffect(() => {
    // Simulate checking for existing session
    const checkAuth = async () => {
      // In real app, this would check for valid JWT token, session cookie, etc.
      const storedDesignerId = localStorage.getItem('currentDesignerId');
      
      if (storedDesignerId) {
        const designer = mockDesigners.find(d => d.id === storedDesignerId);
        if (designer) {
          setAuthState({
            isAuthenticated: true,
            designer,
            isLoading: false
          });
          return;
        }
      }

      // Default to first designer for demo purposes
      setAuthState({
        isAuthenticated: true,
        designer: mockDesigners[0],
        isLoading: false
      });
      localStorage.setItem('currentDesignerId', mockDesigners[0].id);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in real app this would call your auth API
    const designer = mockDesigners.find(d => d.email === email);
    
    if (designer) {
      setAuthState({
        isAuthenticated: true,
        designer,
        isLoading: false
      });
      localStorage.setItem('currentDesignerId', designer.id);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      designer: null,
      isLoading: false
    });
    localStorage.removeItem('currentDesignerId');
  };

  const switchDesigner = (designerId: string) => {
    const designer = mockDesigners.find(d => d.id === designerId);
    if (designer) {
      setAuthState(prev => ({
        ...prev,
        designer
      }));
      localStorage.setItem('currentDesignerId', designerId);
    }
  };

  return {
    ...authState,
    login,
    logout,
    switchDesigner
  };
}

// Helper hook for demo - allows switching between designers
export function useDesignerSwitcher() {
  const { switchDesigner } = useAuth();
  
  return {
    availableDesigners: mockDesigners,
    switchToDesigner: switchDesigner
  };
} 