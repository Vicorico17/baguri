"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Calendar, User, Mail, MapPin, CreditCard, Eye, Search, Filter, Download, ChevronDown, CheckCircle, Clock, Truck, ArrowUpRight } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { useDesignerAuth } from '@/contexts/DesignerAuthContext';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  designer_earnings: number;
  baguri_fee: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  designer_earnings: number;
  baguri_fee: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  shipping_address?: string;
  order_items: OrderItem[];
  stripe_payment_intent_id?: string;
}

const ORDER_STATUSES = [
  { value: 'all', label: 'All Orders', color: 'text-zinc-400' },
  { value: 'pending', label: 'Pending', color: 'text-yellow-400' },
  { value: 'confirmed', label: 'Confirmed', color: 'text-blue-400' },
  { value: 'processing', label: 'Processing', color: 'text-purple-400' },
  { value: 'shipped', label: 'Shipped', color: 'text-green-400' },
  { value: 'delivered', label: 'Delivered', color: 'text-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-400' }
];

function OrderManagementContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  const { user, loading: authLoading } = useDesignerAuth();
  const router = useRouter();

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/designer-auth');
    }
  }, [user, authLoading, router]);

  // Load orders
  useEffect(() => {
    if (!user?.id) return;

    const loadOrders = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/designers/${user.id}/orders`);
        // const data = await response.json();
        
        // Mock data for now
        const mockOrders: Order[] = [
          {
            id: '1',
            order_number: 'ORD-2024-001',
            customer_name: 'Alexandra Popescu',
            customer_email: 'alexandra@example.com',
            total_amount: 299.99,
            designer_earnings: 239.99,
            baguri_fee: 60.00,
            status: 'delivered',
            created_at: '2024-01-15T10:30:00Z',
            shipping_address: 'Bucharest, Romania',
            stripe_payment_intent_id: 'pi_example_1',
            order_items: [
              {
                id: '1',
                product_name: 'Handcrafted Romanian Blouse',
                quantity: 1,
                unit_price: 299.99,
                total_price: 299.99,
                designer_earnings: 239.99,
                baguri_fee: 60.00
              }
            ]
          },
          {
            id: '2',
            order_number: 'ORD-2024-002',
            customer_name: 'Maria Ionescu',
            customer_email: 'maria@example.com',
            total_amount: 459.98,
            designer_earnings: 367.98,
            baguri_fee: 92.00,
            status: 'processing',
            created_at: '2024-01-20T14:15:00Z',
            shipping_address: 'Cluj-Napoca, Romania',
            stripe_payment_intent_id: 'pi_example_2',
            order_items: [
              {
                id: '2',
                product_name: 'Traditional Embroidered Scarf',
                quantity: 2,
                unit_price: 229.99,
                total_price: 459.98,
                designer_earnings: 367.98,
                baguri_fee: 92.00
              }
            ]
          }
        ];
        
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user?.id]);

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(order => new Date(order.created_at) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(order => new Date(order.created_at) >= filterDate);
          break;
        case 'month':
          filterDate.setDate(now.getDate() - 30);
          filtered = filtered.filter(order => new Date(order.created_at) >= filterDate);
          break;
      }
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-yellow-400" />;
      case 'confirmed': return <CheckCircle size={16} className="text-blue-400" />;
      case 'processing': return <Package size={16} className="text-purple-400" />;
      case 'shipped': return <Truck size={16} className="text-green-400" />;
      case 'delivered': return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelled': return <CheckCircle size={16} className="text-red-400" />;
      default: return <Package size={16} className="text-zinc-400" />;
    }
  };

  const getTotalEarnings = () => {
    return filteredOrders.reduce((sum, order) => sum + order.designer_earnings, 0);
  };

  const getTotalOrders = () => filteredOrders.length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto mb-4 text-red-400" />
          <p className="text-red-400 font-medium mb-2">Error Loading Orders</p>
          <p className="text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <BackgroundPaths />
      
      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/designer-dashboard" 
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-zinc-700"></div>
              <h1 className="text-xl font-bold">Order Management</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-zinc-400">Total Earnings</p>
                <p className="text-lg font-bold text-green-400">€{getTotalEarnings().toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold">{getTotalOrders()}</p>
              </div>
              <Package className="text-blue-400" size={24} />
            </div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <Clock className="text-yellow-400" size={24} />
            </div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Processing</p>
                <p className="text-2xl font-bold text-purple-400">
                  {orders.filter(o => o.status === 'processing').length}
                </p>
              </div>
              <Package className="text-purple-400" size={24} />
            </div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Delivered</p>
                <p className="text-2xl font-bold text-green-400">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              {ORDER_STATUSES.map(status => (
                <option key={status.value} value={status.value} className="bg-zinc-800">
                  {status.label}
                </option>
              ))}
            </select>
            
            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="all" className="bg-zinc-800">All Time</option>
              <option value="today" className="bg-zinc-800">Today</option>
              <option value="week" className="bg-zinc-800">Last 7 Days</option>
              <option value="month" className="bg-zinc-800">Last 30 Days</option>
            </select>
            
            {/* Export Button */}
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="text-left p-4 text-zinc-300 font-medium">Order</th>
                  <th className="text-left p-4 text-zinc-300 font-medium">Customer</th>
                  <th className="text-left p-4 text-zinc-300 font-medium">Status</th>
                  <th className="text-left p-4 text-zinc-300 font-medium">Date</th>
                  <th className="text-left p-4 text-zinc-300 font-medium">Total</th>
                  <th className="text-left p-4 text-zinc-300 font-medium">Your Earnings</th>
                  <th className="text-left p-4 text-zinc-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-zinc-400">
                      <Package size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No orders found</p>
                      <p className="text-sm mt-1">Orders will appear here when customers purchase your products</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-t border-zinc-800 hover:bg-zinc-800/50 transition">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-zinc-400">{order.order_items.length} item(s)</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-zinc-400">{order.customer_email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p>{new Date(order.created_at).toLocaleDateString()}</p>
                          <p className="text-sm text-zinc-400">{new Date(order.created_at).toLocaleTimeString()}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">€{order.total_amount.toFixed(2)}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-green-400">€{order.designer_earnings.toFixed(2)}</p>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 rounded transition"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Order Details</h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-zinc-400 hover:text-white transition"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-400">Order Number</p>
                  <p className="font-medium">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedOrder.status)}
                    <span className="capitalize">{selectedOrder.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Date</p>
                  <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Payment ID</p>
                  <p className="font-medium text-xs">{selectedOrder.stripe_payment_intent_id}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t border-zinc-800 pt-6">
                <h4 className="font-medium mb-4">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="text-blue-400" size={20} />
                    <div>
                      <p className="font-medium">{selectedOrder.customer_name}</p>
                      <p className="text-sm text-zinc-400">{selectedOrder.customer_email}</p>
                    </div>
                  </div>
                  {selectedOrder.shipping_address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="text-green-400" size={20} />
                      <div>
                        <p className="text-sm text-zinc-400">Shipping Address</p>
                        <p className="font-medium">{selectedOrder.shipping_address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-zinc-800 pt-6">
                <h4 className="font-medium mb-4">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-zinc-400">Qty: {item.quantity} × {item.unit_price.toFixed(2)} RON</p>
                      </div>
                                              <div className="text-right">
                          <p className="font-medium">{item.total_price.toFixed(2)} RON</p>
                          <p className="text-sm text-green-400">+{item.designer_earnings.toFixed(2)} RON</p>
                        </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="border-t border-zinc-800 pt-6">
                <h4 className="font-medium mb-4">Financial Summary</h4>
                <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Order Total</span>
                    <span>{selectedOrder.total_amount.toFixed(2)} RON</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Baguri Fee</span>
                    <span>-{selectedOrder.baguri_fee.toFixed(2)} RON</span>
                  </div>
                  <div className="flex justify-between font-medium text-green-400 border-t border-zinc-700 pt-2">
                    <span>Your Earnings</span>
                    <span>{selectedOrder.designer_earnings.toFixed(2)} RON</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderManagement() {
  return <OrderManagementContent />;
} 