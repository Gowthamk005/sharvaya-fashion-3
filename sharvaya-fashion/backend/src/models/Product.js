import mongoose from 'mongoose';
import { PRODUCT_LIMITS, SIZES } from '../config/constants.js';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: PRODUCT_LIMITS.nameMax },
    price: { type: Number, required: true, min: 1, max: PRODUCT_LIMITS.priceMax },
    sizes: {
      type: [{ type: String, enum: SIZES }],
      validate: { validator: (v) => v.length > 0, message: 'Select at least one size' },
    },
    description: { type: String, required: true, trim: true, maxlength: PRODUCT_LIMITS.descriptionMax },
    // The photo lives in GridFS (bucket "productImages"); this is its file id.
    imageId: { type: mongoose.Schema.Types.ObjectId, default: null },
    imageType: { type: String, default: null },
  },
  { timestamps: true }
);

// Indexes for the Shop All sort/filter/search queries.
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 1 });
productSchema.index({ price: 1 });
productSchema.index({ sizes: 1 });

// Clean JSON for the API: "id" instead of "_id", and a URL the browser can load the photo from.
productSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    ret.image = ret.imageId ? `/api/images/${ret.imageId}` : null;
    delete ret._id;
    delete ret.imageId;
    delete ret.imageType;
    return ret;
  },
});

export const Product = mongoose.model('Product', productSchema);
