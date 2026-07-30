import { z } from 'zod';

export const addProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  description: z.string().optional().default(''),
  price: z.number().min(0, 'Preço não pode ser negativo'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  imageUrl: z.string().nullable().optional(),
  galleryImage1: z.string().nullable().optional(),
  galleryImage2: z.string().nullable().optional(),
  galleryImage3: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  proteins: z.number().min(0).optional().default(0),
  calories: z.number().min(0).optional().default(0),
  weight: z.number().min(0).optional().default(0),
  volume: z.number().min(0).optional().default(0),
  allowMultipleAddons: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  sortOrder: z.number().int().min(0).optional().default(0),
  flavors: z.array(z.string()).optional().default([]),
  addons: z.array(z.object({
    name: z.string().min(1),
    price: z.number().min(0),
  })).optional().default([]),
});

export const updateProductSchema = addProductSchema.extend({
  id: z.string().min(1),
});

export const addCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional().default(''),
  rating: z.number().min(0).max(5).optional().default(0),
  deliveryTime: z.string().nullable().optional(),
  deliveryFee: z.number().min(0).optional().default(0),
  minOrder: z.number().min(0).optional().default(0),
  bannerUrl: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida').optional().default('#16803C'),
  whatsapp: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  businessHours: z.string().nullable().optional(),
  institutionalText: z.string().nullable().optional(),
});

export const createOrderSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100),
  phone: z.string().trim().min(10, 'Telefone inválido').max(24),
  cep: z.string().trim().max(12).optional().default(''),
  street: z.string().trim().max(140).optional().default(''),
  number: z.string().trim().max(20).optional().default(''),
  complement: z.string().trim().max(120).optional(),
  neighborhood: z.string().trim().max(100).optional().default(''),
  city: z.string().trim().max(100).optional().default(''),
  state: z.string().trim().max(2).optional().default(''),
  paymentMethod: z.enum(['PIX', 'MONEY', 'CREDIT', 'DEBIT']),
  deliveryMethod: z.enum(['DELIVERY', 'PICKUP']).optional().default('DELIVERY'),
  observations: z.string().trim().max(500).optional(),
  subtotal: z.number().min(0),
  deliveryFee: z.number().min(0).optional().default(0),
  discount: z.number().min(0).optional().default(0),
  total: z.number().min(0),
  couponCode: z.string().trim().max(40).optional(),
  items: z.array(z.object({
    id: z.string(),
    name: z.string().max(120),
    quantity: z.number().int().min(1).max(99),
    price: z.number().min(0),
    selectedFlavor: z.string().max(128).optional(),
    selectedAddons: z.array(z.string().max(128)).max(20).optional(),
    addons: z.array(z.object({ id: z.string(), name: z.string(), price: z.number() })).optional(),
  })).min(1, 'Pelo menos um item é necessário'),
});

export const couponTypeSchema = z.enum(['PERCENTAGE', 'FIXED']);

const couponBaseSchema = z.object({
  code: z.string().trim().min(2).max(40).regex(/^[a-zA-Z0-9_-]+$/, 'Código inválido'),
  type: couponTypeSchema,
  value: z.coerce.number().positive('Valor deve ser maior que zero').max(10000),
  isActive: z.boolean().optional().default(true),
  expiresAt: z.string().trim().optional().nullable(),
  usageLimit: z.coerce.number().int().positive().max(100000).optional().nullable(),
  minOrder: z.coerce.number().min(0).max(100000).optional().default(0),
});

export const createCouponSchema = couponBaseSchema.refine((coupon) => coupon.type !== 'PERCENTAGE' || coupon.value <= 100, {
  message: 'Cupom percentual não pode passar de 100%',
  path: ['value'],
});

export const updateCouponSchema = couponBaseSchema.partial().extend({
  id: z.string().min(1),
}).refine((coupon) => coupon.type !== 'PERCENTAGE' || coupon.value === undefined || coupon.value <= 100, {
  message: 'Cupom percentual não pode passar de 100%',
  path: ['value'],
});
