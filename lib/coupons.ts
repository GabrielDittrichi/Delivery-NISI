export interface CouponRecord {
  id: string;
  code: string;
  type: string;
  value: number;
  isActive: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  minOrder: number;
  createdAt: string;
  updatedAt: string;
}

const now = new Date().toISOString();

const memoryCoupons: CouponRecord[] = [
  {
    id: 'coupon-nisi10',
    code: 'NISI10',
    type: 'PERCENTAGE',
    value: 10,
    isActive: true,
    expiresAt: null,
    usageLimit: null,
    usedCount: 0,
    minOrder: 0,
    createdAt: now,
    updatedAt: now,
  },
];

export function getMemoryCoupons() {
  return [...memoryCoupons].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createMemoryCoupon(input: {
  code: string;
  type: string;
  value: number;
  isActive?: boolean;
  expiresAt?: string | null;
  usageLimit?: number | null;
  minOrder?: number;
}) {
  const code = input.code.toUpperCase();
  if (memoryCoupons.some((coupon) => coupon.code === code)) {
    throw new Error('DUPLICATE_COUPON');
  }

  const createdAt = new Date().toISOString();
  const coupon: CouponRecord = {
    id: `coupon-${code.toLowerCase()}-${Date.now()}`,
    code,
    type: input.type,
    value: input.value,
    isActive: input.isActive ?? true,
    expiresAt: input.expiresAt || null,
    usageLimit: input.usageLimit ?? null,
    usedCount: 0,
    minOrder: input.minOrder ?? 0,
    createdAt,
    updatedAt: createdAt,
  };
  memoryCoupons.unshift(coupon);
  return coupon;
}

export function updateMemoryCoupon(id: string, data: Partial<CouponRecord>) {
  const index = memoryCoupons.findIndex((coupon) => coupon.id === id);
  if (index === -1) return null;
  memoryCoupons[index] = {
    ...memoryCoupons[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return memoryCoupons[index];
}

export function deleteMemoryCoupon(id: string) {
  const index = memoryCoupons.findIndex((coupon) => coupon.id === id);
  if (index === -1) return false;
  memoryCoupons.splice(index, 1);
  return true;
}

export function findMemoryCoupon(code: string) {
  return memoryCoupons.find((coupon) => coupon.code === code.toUpperCase()) ?? null;
}
