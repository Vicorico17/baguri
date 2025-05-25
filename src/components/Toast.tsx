"use client";

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, Info, AlertTriangle, ShoppingCart } from 'lucide-react';
import { useToast, type Toast } from '@/contexts/ToastContext';

const TOAST_ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const TOAST_STYLES = {
  success: {
    bg: 'bg-green-500/10 border-green-500/20',
    icon: 'text-green-400',
    title: 'text-green-300',
    message: 'text-green-200',
  },
  error: {
    bg: 'bg-red-500/10 border-red-500/20',
    icon: 'text-red-400',
    title: 'text-red-300',
    message: 'text-red-200',
  },
  info: {
    bg: 'bg-blue-500/10 border-blue-500/20',
    icon: 'text-blue-400',
    title: 'text-blue-300',
    message: 'text-blue-200',
  },
  warning: {
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    icon: 'text-yellow-400',
    title: 'text-yellow-300',
    message: 'text-yellow-200',
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const IconComponent = TOAST_ICONS[toast.type];
  const styles = TOAST_STYLES[toast.type];

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 200);
  };

  return (
    <div
      className={`
        transform transition-all duration-200 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isExiting ? 'scale-95' : ''}
      `}
    >
      <div className={`
        ${styles.bg} 
        border rounded-lg p-4 shadow-lg backdrop-blur-sm
        max-w-sm w-full
      `}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${styles.icon}`}>
            <IconComponent size={20} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-sm ${styles.title}`}>
              {toast.title}
            </h3>
            {toast.message && (
              <p className={`text-xs mt-1 ${styles.message}`}>
                {toast.message}
              </p>
            )}
            
            {/* Actions */}
            {toast.actions && toast.actions.length > 0 && (
              <div className="flex gap-2 mt-3">
                {toast.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick();
                      handleClose();
                    }}
                    className={`
                      text-xs px-3 py-1.5 rounded-md font-medium transition-colors
                      ${action.variant === 'primary' 
                        ? 'bg-white text-zinc-900 hover:bg-zinc-200' 
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

// Special cart success toast with custom styling
export function CartSuccessToast({ 
  productName, 
  size, 
  color, 
  onViewCart, 
  onClose 
}: {
  productName: string;
  size: string;
  color: string;
  onViewCart: () => void;
  onClose: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}
    >
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 shadow-xl backdrop-blur-sm max-w-sm w-full">
        <div className="flex items-start gap-3">
          {/* Cart Icon with Animation */}
          <div className="flex-shrink-0 text-green-400">
            <div className="relative">
              <ShoppingCart size={20} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-green-300">
              Added to cart! 🎉
            </h3>
            <p className="text-xs mt-1 text-green-200">
              {productName}
            </p>
            <p className="text-xs text-green-300/80">
              Size: {size} • Color: {color}
            </p>
            
            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  onViewCart();
                  onClose();
                }}
                className="text-xs px-3 py-1.5 bg-white text-zinc-900 rounded-md font-medium hover:bg-zinc-200 transition-colors"
              >
                View Cart
              </button>
              <button
                onClick={onClose}
                className="text-xs px-3 py-1.5 bg-zinc-700 text-zinc-300 rounded-md font-medium hover:bg-zinc-600 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
} 