"use client";

import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Calendar, User, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  designer_earnings: number;
  commission_tier: string;
  commission_percentage: number;
}

export interface Order {
  id: string;
  stripe_session_id: string;
  stripe_payment_intent_id: string;
  customer_email: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

interface OrderTrackerProps {
  sessionId?: string;
  className?: string;
}

type OrderStatus = 'confirmed' | 'processing' | 'shipped' | 'delivered';

const ORDER_STEPS = [
  {
    key: 'confirmed' as OrderStatus,
    label: 'Order Confirmed',
    description: 'Your order has been received and confirmed',
    icon: CheckCircle,
    color: 'text-green-400'
  },
  {
    key: 'processing' as OrderStatus,
    label: 'Processing',
    description: 'Your order is being prepared by our designers',
    icon: Package,
    color: 'text-blue-400'
  },
  {
    key: 'shipped' as OrderStatus,
    label: 'Shipped',
    description: 'Your order is on its way to you',
    icon: Truck,
    color: 'text-purple-400'
  },
  {
    key: 'delivered' as OrderStatus,
    label: 'Delivered',
    description: 'Your order has been delivered',
    icon: CheckCircle,
    color: 'text-green-400'
  }
];

export function OrderTracker({ sessionId, className }: OrderTrackerProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('confirmed');
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading order data
    const loadOrderData = async () => {
      try {
        // In a real app, you'd fetch this from your API
        // For now, we'll simulate with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock order data
        const mockOrder: Order = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          stripe_session_id: sessionId || 'cs_test_example',
          stripe_payment_intent_id: 'pi_example',
          customer_email: 'customer@example.com',
          total_amount: 299.99,
          currency: 'ron',
          status: 'completed',
          created_at: new Date().toISOString(),
          order_items: [
            {
              id: '1',
              product_name: 'Handcrafted Romanian Blouse',
              quantity: 1,
              unit_price: 199.99,
              total_price: 199.99,
              designer_earnings: 119.99,
              commission_tier: 'Silver',
              commission_percentage: 60
            },
            {
              id: '2',
              product_name: 'Traditional Embroidered Scarf',
              quantity: 1,
              unit_price: 99.99,
              total_price: 99.99,
              designer_earnings: 59.99,
              commission_tier: 'Bronze',
              commission_percentage: 50
            }
          ]
        };

        setOrder(mockOrder);
        
        // Calculate estimated delivery (7-14 business days from now)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 10);
        setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading order:', error);
        setIsLoading(false);
      }
    };

    loadOrderData();
  }, [sessionId]);

  const getCurrentStepIndex = () => {
    return ORDER_STEPS.findIndex(step => step.key === currentStatus);
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-zinc-800 rounded-lg p-6 space-y-4">
          <div className="h-6 bg-zinc-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-zinc-700 rounded"></div>
            <div className="h-4 bg-zinc-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={`text-center text-zinc-400 ${className}`}>
        <Package size={48} className="mx-auto mb-4 opacity-50" />
        <p>No order information available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Order Header */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Order Tracking</h2>
            <p className="text-zinc-400 text-sm">Order #{order.id.split('-')[0].toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{order.total_amount.toFixed(2)} {order.currency.toUpperCase()}</p>
            <p className="text-zinc-400 text-sm">{order.order_items.length} item{order.order_items.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-zinc-700"></div>
          <div className="space-y-6">
            {ORDER_STEPS.map((step, index) => {
              const currentIndex = getCurrentStepIndex();
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              const IconComponent = step.icon;

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start"
                >
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500'
                      : isCurrent
                      ? 'bg-blue-500 border-blue-500 animate-pulse'
                      : 'bg-zinc-800 border-zinc-600'
                  }`}>
                    <IconComponent 
                      size={20} 
                      className={isCompleted || isCurrent ? 'text-white' : 'text-zinc-400'} 
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className={`font-semibold ${
                      isCompleted || isCurrent ? 'text-white' : 'text-zinc-400'
                    }`}>
                      {step.label}
                    </h3>
                    <p className={`text-sm ${
                      isCompleted || isCurrent ? 'text-zinc-300' : 'text-zinc-500'
                    }`}>
                      {step.description}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-blue-400 mt-1">Current Status</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-blue-400" />
          Delivery Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-zinc-400" />
              <div>
                <p className="text-sm text-zinc-400">Shipping to</p>
                <p className="text-white">Romania (tracked delivery)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-zinc-400" />
              <div>
                <p className="text-sm text-zinc-400">Estimated delivery</p>
                <p className="text-white">{estimatedDelivery}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User size={16} className="text-zinc-400" />
              <div>
                <p className="text-sm text-zinc-400">Customer</p>
                <p className="text-white">{order.customer_email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard size={16} className="text-zinc-400" />
              <div>
                <p className="text-sm text-zinc-400">Payment method</p>
                <p className="text-white">Card ending in ••••</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Package size={20} className="text-green-400" />
          Order Items
        </h3>
        <div className="space-y-4">
          {order.order_items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-white">{item.product_name}</h4>
                <p className="text-sm text-zinc-400">Quantity: {item.quantity}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.commission_tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                    item.commission_tier === 'Silver' ? 'bg-zinc-500/20 text-zinc-300' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {item.commission_tier} Tier
                  </span>
                  <span className="text-xs text-zinc-500">
                    {item.commission_percentage}% to designer
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">{item.total_price.toFixed(2)} {order.currency.toUpperCase()}</p>
                <p className="text-sm text-zinc-400">{item.unit_price.toFixed(2)} each</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Support Information */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="font-medium text-blue-400 mb-2">Need Help?</h4>
        <p className="text-sm text-blue-300 mb-3">
          Have questions about your order? We're here to help!
        </p>
        <div className="flex flex-wrap gap-2">
          <a 
            href="mailto:hello@baguri.ro" 
            className="text-xs px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full hover:bg-blue-500/30 transition"
          >
            Email Support
          </a>
          <a 
            href="https://instagram.com/baguri.ro" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full hover:bg-blue-500/30 transition"
          >
            Instagram
          </a>
        </div>
      </div>
    </div>
  );
} 