"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert } from "@/components/ui/alert";
import { X, ShoppingBag, Eye, Clock, Users, TrendingUp } from "lucide-react";

interface ScarcityNotification {
  id: string;
  type: "purchase" | "viewing" | "stock" | "trending";
  title: string;
  message: string;
  timestamp: Date;
  duration: number;
  urgent?: boolean;
}

interface ScarcityNotificationsProps {
  enabled?: boolean;
  interval?: number; // seconds between notifications
  maxVisible?: number;
  className?: string;
}

// Fake data for scarcity notifications
const FAKE_CUSTOMERS = [
  "Alexandra M.", "Mihai C.", "Ioana P.", "Adrian S.", "Elena R.",
  "Cristian B.", "Maria D.", "Andrei T.", "Raluca N.", "Vlad F.",
  "Andreea L.", "Daniel V.", "Simona G.", "Gabriel M.", "Claudia A.",
  "Florin R.", "Diana S.", "Bogdan P.", "Roxana I.", "Catalin E."
];

const FAKE_PRODUCTS = [
  "Elegant Evening Dress", "Casual Summer Top", "Designer Jeans",
  "Luxury Handbag", "Stylish Sneakers", "Vintage Jacket",
  "Silk Scarf", "Leather Wallet", "Statement Necklace",
  "Classic Blazer", "Bohemian Skirt", "Modern Hoodie",
  "Designer Watch", "Cozy Sweater", "Trendy Sunglasses"
];

const FAKE_LOCATIONS = [
  "Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța",
  "Brașov", "Galați", "Craiova", "Ploiești", "Oradea"
];

export function ScarcityNotifications({
  enabled = true,
  interval = 120, // Show notification every 2 minutes (much rarer)
  maxVisible = 2,
  className
}: ScarcityNotificationsProps) {
  const [notifications, setNotifications] = useState<ScarcityNotification[]>([]);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null);

  // Generate fake notification data
  const generateNotification = (): ScarcityNotification => {
    const types: ScarcityNotification["type"][] = ["purchase", "viewing", "stock", "trending"];
    const type = types[Math.floor(Math.random() * types.length)];
    const customer = FAKE_CUSTOMERS[Math.floor(Math.random() * FAKE_CUSTOMERS.length)];
    const product = FAKE_PRODUCTS[Math.floor(Math.random() * FAKE_PRODUCTS.length)];
    const location = FAKE_LOCATIONS[Math.floor(Math.random() * FAKE_LOCATIONS.length)];
    const viewCount = Math.floor(Math.random() * 28) + 3; // 3-30 viewers
    const stockCount = Math.floor(Math.random() * 8) + 1; // 1-8 items left
    const timeAgo = Math.floor(Math.random() * 10) + 1; // 1-10 minutes ago

    let title = "";
    let message = "";
    let urgent = false;
    let duration = 8000; // Default 8 seconds

    switch (type) {
      case "purchase":
        title = "Recent Purchase";
        message = `${customer} from ${location} just bought "${product}"`;
        duration = 6000;
        break;
      
      case "viewing":
        title = "High Interest";
        message = `${viewCount} people are currently viewing "${product}"`;
        urgent = viewCount > 20;
        duration = 7000;
        break;
      
      case "stock":
        title = "Low Stock Alert";
        message = `Only ${stockCount} left of "${product}" - hurry!`;
        urgent = stockCount <= 3;
        duration = 10000; // Longer for urgency
        break;
      
      case "trending":
        title = "Trending Now";
        message = `"${product}" is popular - ${Math.floor(Math.random() * 15) + 5} sold today`;
        duration = 8000;
        break;
    }

    return {
      id: `notification-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      timestamp: new Date(),
      duration,
      urgent
    };
  };

  // Check localStorage for snooze state on mount
  useEffect(() => {
    const storedSnooze = localStorage.getItem('baguri_notifications_snooze');
    if (storedSnooze) {
      const snoozeTime = parseInt(storedSnooze);
      if (Date.now() < snoozeTime) {
        // Still in snooze period
        setSnoozeUntil(snoozeTime);
        setIsEnabled(false);
      } else {
        // Snooze period expired, clean up
        localStorage.removeItem('baguri_notifications_snooze');
        setSnoozeUntil(null);
      }
    }
  }, []);

  // Check snooze expiration every second
  useEffect(() => {
    if (!snoozeUntil) return;

    const checkExpiration = () => {
      const now = Date.now();
      if (now >= snoozeUntil) {
        // Snooze expired
        setSnoozeUntil(null);
        localStorage.removeItem('baguri_notifications_snooze');
        setIsEnabled(true);
      }
    };

    checkExpiration(); // Initial call
    const intervalId = setInterval(checkExpiration, 1000);

    return () => clearInterval(intervalId);
  }, [snoozeUntil]);

  // Check if notifications are snoozed
  const isNotificationsSnoozed = () => {
    if (!snoozeUntil) return false;
    
    const now = Date.now();
    if (now >= snoozeUntil) {
      // Snooze period expired
      setSnoozeUntil(null);
      localStorage.removeItem('baguri_notifications_snooze');
      setIsEnabled(true);
      return false;
    }
    return true;
  };

  // Show notifications at intervals
  useEffect(() => {
    if (!isEnabled || isNotificationsSnoozed()) return;

    const showNotification = () => {
      // Double-check snooze status before showing
      if (isNotificationsSnoozed()) return;
      
      const notification = generateNotification();
      
      setNotifications(prev => {
        const updated = [notification, ...prev];
        // Keep only maxVisible notifications
        return updated.slice(0, maxVisible);
      });

      // Remove notification after its duration
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, notification.duration);
    };

    // Show first notification after a longer delay (30 seconds)
    const initialDelay = setTimeout(showNotification, 30000);
    
    // Then show notifications at regular intervals
    const intervalId = setInterval(showNotification, interval * 1000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(intervalId);
    };
  }, [isEnabled, interval, maxVisible, snoozeUntil]);

  const snoozeNotifications = () => {
    const snoozeTime = Date.now() + (51 * 1000); // 51 seconds from now
    setSnoozeUntil(snoozeTime);
    setNotifications([]); // Clear all current notifications
    
    // Store in localStorage to persist across page reloads
    localStorage.setItem('baguri_notifications_snooze', snoozeTime.toString());
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Snooze for 51 seconds when dismissing individual notifications
    snoozeNotifications();
  };



  const getIcon = (type: ScarcityNotification["type"]) => {
    switch (type) {
      case "purchase":
        return <ShoppingBag className="text-green-500" size={16} />;
      case "viewing":
        return <Eye className="text-blue-500" size={16} />;
      case "stock":
        return <Clock className="text-amber-500" size={16} />;
      case "trending":
        return <TrendingUp className="text-purple-500" size={16} />;
      default:
        return <Users className="text-gray-500" size={16} />;
    }
  };

  const getVariant = (type: ScarcityNotification["type"], urgent?: boolean) => {
    if (urgent) return "warning";
    
    switch (type) {
      case "purchase":
        return "success";
      case "viewing":
        return "info";
      case "stock":
        return "warning";
      case "trending":
        return "default";
      default:
        return "default";
    }
  };

  // Only show notifications if enabled and not snoozed
  const shouldShowNotifications = isEnabled && !isNotificationsSnoozed();
  
  if (!shouldShowNotifications) return null;

  return (
    <div 
      className={`fixed bottom-6 left-6 z-[200] space-y-3 pointer-events-none ${className}`}
      style={{ maxWidth: "400px" }}
    >
      <AnimatePresence mode="popLayout">
        {shouldShowNotifications && notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30,
              mass: 0.8 
            }}
            className="pointer-events-auto"
          >
            <Alert
              variant={getVariant(notification.type, notification.urgent) as any}
              isNotification
              layout="row"
              icon={getIcon(notification.type)}
              action={
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(notification.id);
                  }}
                  className="group -my-1.5 -me-2 size-8 p-1 hover:bg-zinc-800/50 flex items-center justify-center rounded-full transition-all duration-200"
                  aria-label="Close notification"
                  title="Dismiss notification"
                >
                  <X
                    size={14}
                    strokeWidth={2.5}
                    className="text-zinc-400 transition-all duration-200 group-hover:text-white group-hover:scale-110"
                  />
                </button>
              }
              className={`
                border-2 bg-zinc-900/95 backdrop-blur-sm 
                ${notification.urgent ? 'border-amber-500/50 animate-pulse' : 'border-zinc-700/50'}
                hover:scale-105 transition-transform cursor-pointer
              `}
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">
                  {notification.title}
                </p>
                <p className="text-xs text-zinc-300">
                  {notification.message}
                </p>
                <p className="text-xs text-zinc-500">
                  {Math.floor((Date.now() - notification.timestamp.getTime()) / 1000 / 60) || 1} min ago
                </p>
              </div>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>


    </div>
  );
}

// Hook for controlling scarcity notifications
export function useScarcityNotifications() {
  const [enabled, setEnabled] = useState(true);
  
  const triggerCustomNotification = (notification: Partial<ScarcityNotification>) => {
    // This can be used to trigger specific notifications
    // For example, when a real purchase happens
    console.log("Custom notification triggered:", notification);
  };

  return {
    enabled,
    setEnabled,
    triggerCustomNotification
  };
} 