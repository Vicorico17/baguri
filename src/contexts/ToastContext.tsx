"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  showSuccess: (title: string, message?: string, options?: Partial<Toast>) => void;
  showError: (title: string, message?: string, options?: Partial<Toast>) => void;
  showInfo: (title: string, message?: string, options?: Partial<Toast>) => void;
  showCartAddSuccess: (productName: string, size: string, color: string, onViewCart: () => void) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Clear any stale toasts on mount to prevent issues after page refresh
  useEffect(() => {
    const clearStaleToasts = () => {
      setToasts([]);
    };
    clearStaleToasts();
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 4000, // Default 4 seconds
      ...toast,
    };

    setToasts(prev => {
      // Prevent duplicate toasts with the same title and message
      const isDuplicate = prev.some(existingToast => 
        existingToast.title === newToast.title && 
        existingToast.message === newToast.message &&
        existingToast.type === newToast.type
      );
      
      if (isDuplicate) {
        console.warn('Prevented duplicate toast:', newToast.title);
        return prev;
      }
      
      return [...prev, newToast];
    });

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [addToast]);

  const showError = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({
      type: 'error',
      title,
      message,
      ...options,
    });
  }, [addToast]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [addToast]);

  const showCartAddSuccess = useCallback((productName: string, size: string, color: string, onViewCart: () => void) => {
    // Validate parameters to prevent undefined toasts
    if (!productName || !size || !color) {
      console.warn('showCartAddSuccess called with invalid parameters:', { productName, size, color });
      return;
    }
    
    addToast({
      type: 'success',
      title: 'Added to cart!',
      message: `${productName} (${size}, ${color})`,
      duration: 5000,
      actions: [
        {
          label: 'View Cart',
          onClick: onViewCart,
          variant: 'primary'
        }
      ]
    });
  }, [addToast]);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showInfo,
    showCartAddSuccess,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 