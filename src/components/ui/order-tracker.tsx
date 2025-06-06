"use client";

import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Calendar, User, CreditCard, AlertCircle } from 'lucide-react';
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
  baguri_fee?: number;
  baguri_fee_percentage?: number;
}

export interface Order {
  id: string;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string;
  customer_email: string;
  customer_name?: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  order_items: OrderItem[];
  is_pending?: boolean; // Flag for orders not yet processed by webhook
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrderData = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching order for session:', sessionId);
        
        const response = await fetch(`/api/orders/${sessionId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch order');
        }

        const orderData: Order = await response.json();
        setOrder(orderData);
        
        // Set status based on order data
        if (orderData.is_pending) {
          setCurrentStatus('confirmed');
        } else if (orderData.status === 'completed') {
          setCurrentStatus('processing');
        }
        
        // Calculate estimated delivery (7-14 business days from order date)
        const deliveryDate = new Date(orderData.created_at);
        deliveryDate.setDate(deliveryDate.getDate() + 10);
        setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }));
        
      } catch (error) {
        console.error('Error loading order:', error);
        setError(error instanceof Error ? error.message : 'Failed to load order');
      } finally {
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

  if (error || !order) {
    return (
      <div className={`text-center ${className}`}>
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <p className="text-red-400 font-medium mb-2">Unable to Load Order</p>
          <p className="text-zinc-400 text-sm">
            {error || 'No order information available'}
          </p>
          {sessionId && (
            <p className="text-zinc-500 text-xs mt-2">
              Session ID: {sessionId}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Pending Order Warning */}
      {order.is_pending && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-400 flex-shrink-0" size={20} />
            <div>
              <p className="text-yellow-400 font-medium">Payment Received - Processing Order</p>
              <p className="text-yellow-300/80 text-sm mt-1">
                                 Your payment was successful! We&apos;re currently processing your order and will update the details shortly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Header */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Order Details</h2>
            <p className="text-zinc-400 text-sm">Order #{order.id === 'pending' ? sessionId?.slice(-8).toUpperCase() : order.id.split('-')[0].toUpperCase()}</p>
            <p className="text-zinc-500 text-xs mt-1">
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{order.total_amount.toFixed(2)} {order.currency.toUpperCase()}</p>
            <p className="text-zinc-400 text-sm">{order.order_items.length} item{order.order_items.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-zinc-800 rounded-lg">
          <div className="flex items-center gap-3">
            <User className="text-blue-400" size={20} />
            <div>
              <p className="text-white font-medium">{order.customer_name || 'Customer'}</p>
              <p className="text-zinc-400 text-sm">{order.customer_email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="text-green-400" size={20} />
            <div>
              <p className="text-white font-medium">Payment Confirmed</p>
              <p className="text-zinc-400 text-sm">via Stripe</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold text-white">Items Ordered</h3>
          {order.order_items.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
              <div className="flex-1">
                <h4 className="text-white font-medium">{item.product_name}</h4>
                <div className="flex items-center gap-4 text-sm text-zinc-400 mt-1">
                  <span>Qty: {item.quantity}</span>
                  <span>€{item.unit_price.toFixed(2)} each</span>
                  {!order.is_pending && item.commission_tier && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                      {item.commission_tier}
                    </span>
                  )}
                </div>
                {!order.is_pending && item.designer_earnings > 0 && (
                  <p className="text-green-400 text-xs mt-1">
                    Designer earnings: €{item.designer_earnings.toFixed(2)} ({item.commission_percentage}%)
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">€{item.total_price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Timeline - Only show if not pending */}
        {!order.is_pending && (
          <div className="relative">
            <h3 className="text-lg font-semibold text-white mb-4">Order Status</h3>
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
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-zinc-700 border-zinc-600'
                    }`}>
                      <IconComponent 
                        size={20} 
                        className={isCompleted ? 'text-white' : isCurrent ? 'text-white' : 'text-zinc-400'} 
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className={`font-medium ${isCompleted || isCurrent ? 'text-white' : 'text-zinc-400'}`}>
                        {step.label}
                      </h4>
                      <p className={`text-sm ${isCompleted || isCurrent ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {step.description}
                      </p>
                      {isCurrent && estimatedDelivery && index === ORDER_STEPS.length - 1 && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-blue-400">
                          <Calendar size={16} />
                          <span>Estimated delivery: {estimatedDelivery}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 