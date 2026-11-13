import mongoose from 'mongoose';
import { Router } from 'express';
import { z } from 'zod';
import { PRODUCT_LIMITS, SIZES } from '../config/constants.js';
import { DEMO_PRODUCTS } from '../data/demoProducts.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { uploadImage } from '../middleware/uploadImage.js';
import { Product } from '../models/Product.js';
import { deleteImage, saveImage } from '../services/imageStore.js';
import { listProducts } from '../services/productQuery.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { detectImageType } from '../utils/detectImageType.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

// Form fields arrive as text, so sizes can be "S,M" or repeated fields; accept both.
const sizesField = z.preprocess(
  (v) => (typeof v === 'string' ? v.split(',') : Array.isArray(v) ? v : []).map((s) => String(s).trim()).filter(Boolean),
  z.array(z.enum(SIZES)).min(1, 'Select at least one size')
);

const productInput = z.object({
  name: z.string().trim().min(2, 'Enter the product name').max(PRODUCT_LIMITS.nameMax),
  price: z.coerce.number().int('Price must be a whole number').min(1, 'Enter a valid price').max(PRODUCT_LIMITS.priceMax),
  sizes: sizesField,
  description: z.string().trim().min(5, 'Add a short description').max(PRODUCT_LIMITS.descriptionMax),
});

// Public: the Shop All page and the home carousel both use this.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await listProducts(req.query));
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, 'Product not found');
    const product = await Product.findById(req.params.id);
    if (!product) throw new HttpError(404, 'Product not found');
    res.json(product);
  })
);

// Admin only: add a product, with an optional photo.
router.post(
  '/',
  requireAdmin,
  uploadImage,
  asyncHandler(async (req, res) => {
    const input = productInput.parse(req.body); // validate BEFORE storing any photo

    let imageId = null;
    let imageType = null;
    if (req.file) {
      imageType = detectImageType(req.file.buffer);
      if (!imageType) throw new HttpError(400, 'The photo must be a JPG, PNG or WebP image');
      imageId = await saveImage(req.file.buffer, imageType);
    }

    try {
      const product = await Product.create({ ...input, imageId, imageType });
      res.status(201).json(product);
    } catch (err) {
      await deleteImage(imageId); // do not leave an orphaned photo behind
      throw err;
    }
  })
);

// Admin only: adds the sample products, but only into an empty store.
router.post(
  '/demo',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const existing = await Product.countDocuments();
    if (existing > 0) {
      throw new HttpError(409, 'The store already has products. Clear them first to add the demo set.');
    }
    const added = await Product.insertMany(DEMO_PRODUCTS);
    res.status(201).json({ added: added.length });
  })
);

// Admin only: removes one product and its photo.
router.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, 'Product not found');
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new HttpError(404, 'Product not found');
    await deleteImage(product.imageId);
    res.status(204).end();
  })
);

// Admin only: removes every product and its photo.
router.delete(
  '/',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const products = await Product.find({}, { imageId: 1 }).lean();
    await Product.deleteMany({});
    await Promise.all(products.map((p) => deleteImage(p.imageId)));
    res.status(204).end();
  })
);

export default router;
