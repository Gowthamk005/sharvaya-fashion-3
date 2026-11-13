import { z } from 'zod';
import { PRODUCT_LIMITS, SIZES, SORT_OPTIONS } from '../config/constants.js';
import { Product } from '../models/Product.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { HttpError } from '../utils/httpError.js';

// Everything the Shop All page can ask for. Query strings arrive as text, so they are coerced and checked here.
export const listQuerySchema = z.object({
  q: z.string().trim().max(80).optional().default(''),
  sort: z.enum(SORT_OPTIONS).optional().default('featured'),
  minPrice: z.coerce.number().min(0).max(PRODUCT_LIMITS.priceMax).optional(),
  maxPrice: z.coerce.number().min(0).max(PRODUCT_LIMITS.priceMax).optional(),
  sizes: z
    .string()
    .optional()
    .transform((s) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : []))
    .pipe(z.array(z.enum(SIZES))),
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(PRODUCT_LIMITS.maxPageSize).optional().default(PRODUCT_LIMITS.defaultPageSize),
});

// Every sort ends with _id so products with equal names or prices keep a stable order across pages.
const SORTS = {
  featured: { createdAt: -1, _id: -1 },
  'price-asc': { price: 1, _id: 1 },
  'price-desc': { price: -1, _id: -1 },
  'name-asc': { name: 1, _id: 1 },
  'name-desc': { name: -1, _id: -1 },
};

function buildFilter({ q, minPrice, maxPrice, sizes }) {
  const filter = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { description: rx }];
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }
  if (sizes.length) filter.sizes = { $in: sizes };
  return filter;
}

export async function listProducts(rawParams) {
  const params = listQuerySchema.parse(rawParams);
  if (params.minPrice !== undefined && params.maxPrice !== undefined && params.minPrice > params.maxPrice) {
    throw new HttpError(400, 'The lowest price cannot be more than the highest price');
  }

  const filter = buildFilter(params);
  const skip = (params.page - 1) * params.limit;
  // Collation makes "a to z" ignore upper/lower case, so "kurta" sorts beside "Kurta".
  const collation = { locale: 'en', strength: 2 };

  const [items, total] = await Promise.all([
    Product.find(filter).sort(SORTS[params.sort]).collation(collation).skip(skip).limit(params.limit),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: params.page,
    pages: Math.max(1, Math.ceil(total / params.limit)),
  };
}
