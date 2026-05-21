import assert from 'node:assert/strict';
import { calculateDiscount, calculateItemTotal, slugify } from '../lib/order-utils';

assert.equal(slugify('Shake Morango Cremoso'), 'shake-morango-cremoso');
assert.equal(slugify('Chá Energia + Proteína'), 'cha-energia-proteina');

assert.equal(
  calculateItemTotal({
    price: 18,
    quantity: 2,
    selectedAddons: ['protein', 'fiber'],
    addons: [
      { id: 'protein', price: 6 },
      { id: 'fiber', price: 4 },
    ],
  }),
  56
);

assert.equal(calculateDiscount(100, { type: 'PERCENTAGE', value: 10 }), 10);
assert.equal(calculateDiscount(20, { type: 'FIXED', value: 50 }), 20);
assert.equal(calculateDiscount(100, null), 0);

console.log('Smoke tests passed.');

