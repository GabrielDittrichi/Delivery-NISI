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
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().min(10, 'Telefone inválido'),
  cep: z.string().optional().default(''),
  street: z.string().optional().default(''),
  number: z.string().optional().default(''),
  complement: z.string().optional(),
  neighborhood: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  paymentMethod: z.string().min(1),
  deliveryMethod: z.enum(['DELIVERY', 'PICKUP']).optional().default('DELIVERY'),
  observations: z.string().optional(),
  subtotal: z.number().min(0),
  deliveryFee: z.number().min(0).optional().default(0),
  discount: z.number().min(0).optional().default(0),
  total: z.number().min(0),
  couponCode: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    quantity: z.number().int().min(1),
    price: z.number().min(0),
    selectedFlavor: z.string().optional(),
    selectedAddons: z.array(z.string()).optional(),
    addons: z.array(z.object({ id: z.string(), name: z.string(), price: z.number() })).optional(),
  })).min(1, 'Pelo menos um item é necessário'),
});
