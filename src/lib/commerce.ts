export type CheckoutItem = { productId: string; size: string; color: string; quantity: number };
export function parseCart(input: unknown): CheckoutItem[] {
  if (!Array.isArray(input) || !input.length || input.length > 50) throw new Error('Cart must contain 1–50 items');
  const merged = new Map<string, CheckoutItem>();
  for (const raw of input) {
    if (!raw || typeof raw !== 'object' || typeof raw.productId !== 'string' ||
        !/^[0-9a-f-]{36}$/i.test(raw.productId) || typeof raw.quantity !== 'number' ||
        !Number.isInteger(raw.quantity) || raw.quantity < 1 || raw.quantity > 10 ||
        typeof raw.size !== 'string' || typeof raw.color !== 'string' || raw.size.length > 80 || raw.color.length > 80) {
      throw new Error('Invalid product, variant, or quantity');
    }
    const item = { productId: raw.productId, size: raw.size, color: raw.color, quantity: raw.quantity };
    const key = JSON.stringify([item.productId, item.color, item.size]);
    const previous = merged.get(key);
    if (previous) previous.quantity += item.quantity; else merged.set(key, item);
    if (merged.get(key)!.quantity > 10) throw new Error('Maximum quantity per variant is 10');
  }
  return [...merged.values()].sort((a,b) => JSON.stringify([a.productId,a.color,a.size]).localeCompare(JSON.stringify([b.productId,b.color,b.size])));
}
export function moneyCents(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > 1000000 || Math.abs(value * 100 - Math.round(value * 100)) > 0.00001) throw new Error('Enter a positive amount with at most two decimals');
  return Math.round(value * 100);
}
export function canTransitionDelivery(from: string, to: string) {
  const next: Record<string,string[]> = { pending:['packed','cancelled'], packed:['shipped','cancelled'], shipped:['delivered','returned'], delivered:['returned'], returned:[], cancelled:[] };
  return from === to || (next[from] || []).includes(to);
}
