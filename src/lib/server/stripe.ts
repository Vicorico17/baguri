import 'server-only';
import Stripe from 'stripe';
let client: Stripe | undefined;
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('Stripe is not configured');
    client = new Stripe(key, { maxNetworkRetries: 2 });
  }
  return client;
}
export function appUrl() {
  const value = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (!value) throw new Error('Application URL is not configured');
  return new URL(value).origin;
}
