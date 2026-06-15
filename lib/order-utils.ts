export type PriceAddon = {
  id: string;
  price: number;
};

export type PriceItem = {
  price: number;
  quantity: number;
  selectedAddons?: string[];
  addons?: PriceAddon[];
};

export function calculateItemTotal(item: PriceItem) {
  const addonsTotal =
    item.selectedAddons?.reduce((acc, addonId) => {
      const addon = item.addons?.find((a) => a.id === addonId);
      return acc + (addon?.price ?? 0);
    }, 0) || 0;

  return (item.price + addonsTotal) * item.quantity;
}

export function calculateDiscount(total: number, coupon: { type: string; value: number } | null) {
  if (!coupon) return 0;
  const discount = coupon.type === 'PERCENTAGE' ? (total * coupon.value) / 100 : coupon.value;
  return Math.min(total, Math.max(0, discount));
}

export { slugify } from './slugify';

