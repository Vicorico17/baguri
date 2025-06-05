"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Crown, Calendar, ArrowLeft, Sparkles, Users, TrendingUp, ShoppingBag } from 'lucide-react';
import { useDesignerAuth } from '@/contexts/DesignerAuthContext';
import { supabase } from '@/lib/supabase';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'week' | 'year' | 'trial';
  description: string;
  features: string[];
  popular?: boolean;
  savings?: string;
  paymentUrl?: string;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: 0,
    currency: 'RON',
    interval: 'trial',
    description: '1 month free trial - Perfect to get started',
    features: [
      'Full platform access for 30 days',
      'Upload unlimited products',
      'Access to all designer tools',
      'Customer analytics dashboard',
      'Direct customer communication',
      'Standard commission rates'
    ],
    paymentUrl: 'https://buy.stripe.com/test_7sYbJ3fel4Yc4CXeQ38og0j'
  },
  {
    id: 'weekly',
    name: 'Weekly Plan',
    price: 49,
    currency: 'RON',
    interval: 'week',
    description: 'Flexible weekly subscription',
    features: [
      'Full platform access',
      'Unlimited product uploads',
      'Priority customer support',
      'Advanced analytics',
      'Marketing tools & promotion',
      'Lower commission rates',
      'Featured designer status'
    ],
    paymentUrl: 'https://buy.stripe.com/test_bJefZjaY54Yc7P9fU78og0k'
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 499,
    currency: 'RON',
    interval: 'year',
    description: 'Best value - Save over 80%!',
    popular: true,
    savings: 'Save 1,549 RON per year',
    features: [
      'Everything in Weekly Plan',
      'Massive savings (80%+ off)',
      'Priority listing in search',
      'Exclusive yearly designer badge',
      'Advanced marketing campaigns',
      'Lowest commission rates',
      'Dedicated account manager',
      'Early access to new features'
    ],
    paymentUrl: 'https://buy.stripe.com/test_cNi14p5DLaiw5H1fU78og0l'
  }
];

export default function DesignerSubscriptionPage() {
  const { designerProfile: designer, loading: isLoading } = useDesignerAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !designer) {
      router.push('/designer-auth');
    }
  }, [designer, isLoading, router]);

  useEffect(() => {
    if (designer) {
      fetchCurrentSubscription();
    }
  }, [designer]);

  const fetchCurrentSubscription = async () => {
    if (!designer) return;

    const { data, error } = await supabase
      .from('designer_subscriptions')
      .select('*')
      .eq('designer_id', designer.id)
      .eq('status', 'active')
      .single();

    if (data) {
      setCurrentSubscription(data);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!designer) return;

    setIsProcessing(true);
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      if (plan.paymentUrl) {
        // Redirect to Stripe payment link
        window.location.href = plan.paymentUrl;
      } else {
        // For trial plan, handle locally
        alert('Free trial activated! You now have 30 days of full access.');
      }
      
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to process subscription. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  if (!designer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link 
            href="/designer-dashboard"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="text-yellow-400" size={32} />
            <h1 className="text-3xl md:text-4xl font-bold">Designer Subscription Plans</h1>
          </div>
          
          <p className="text-xl text-zinc-400 mb-2">
            Choose the perfect plan to grow your design business
          </p>
          <p className="text-zinc-500">
            Start with a free trial, then choose weekly or yearly billing
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <Check className="text-green-400" size={20} />
              <div>
                <p className="text-green-400 font-medium">Active Subscription</p>
                <p className="text-zinc-300 text-sm">
                  You&apos;re currently on the {currentSubscription.plan_name} plan
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-zinc-900 rounded-xl p-6 border transition-all duration-300 hover:scale-105 ${
                plan.popular 
                  ? 'border-yellow-500 shadow-xl shadow-yellow-500/20' 
                  : selectedPlan === plan.id
                  ? 'border-white'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Sparkles size={14} />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-zinc-400 ml-1">{plan.currency}</span>
                  {plan.interval !== 'trial' && (
                    <span className="text-zinc-400">/{plan.interval}</span>
                  )}
                </div>
                {plan.savings && (
                  <p className="text-green-400 text-sm font-medium">{plan.savings}</p>
                )}
                <p className="text-zinc-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-zinc-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  setSelectedPlan(plan.id);
                  handleSubscribe(plan.id);
                }}
                disabled={isProcessing}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  plan.popular
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                    : plan.id === 'trial'
                    ? 'bg-green-500 text-white hover:bg-green-400'
                    : 'bg-white text-black hover:bg-zinc-200'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isProcessing && selectedPlan === plan.id ? 'Processing...' : 
                 plan.id === 'trial' ? 'Start Free Trial' :
                 currentSubscription ? 'Switch Plan' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-zinc-900 rounded-xl p-8 mb-12 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Why Subscribe to Baguri Designer?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Users className="text-blue-400 mx-auto mb-3" size={32} />
              <h4 className="font-semibold text-white mb-2">Reach More Customers</h4>
              <p className="text-zinc-400 text-sm">
                Get featured placement and priority listing to increase your visibility
              </p>
            </div>
            <div className="text-center">
              <TrendingUp className="text-green-400 mx-auto mb-3" size={32} />
              <h4 className="font-semibold text-white mb-2">Boost Your Sales</h4>
              <p className="text-zinc-400 text-sm">
                Access marketing tools and analytics to optimize your performance
              </p>
            </div>
            <div className="text-center">
              <ShoppingBag className="text-purple-400 mx-auto mb-3" size={32} />
              <h4 className="font-semibold text-white mb-2">Premium Features</h4>
              <p className="text-zinc-400 text-sm">
                Unlock advanced tools, lower commissions, and priority support
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <div className="bg-zinc-900 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Can I cancel anytime?</h4>
              <p className="text-zinc-400 text-sm">
                Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">What happens after the free trial?</h4>
              <p className="text-zinc-400 text-sm">
                After your 30-day free trial, you&apos;ll need to choose a paid plan to continue accessing premium features.
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Do you offer refunds?</h4>
              <p className="text-zinc-400 text-sm">
                We offer a 14-day money-back guarantee for all paid subscriptions if you&apos;re not satisfied.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 