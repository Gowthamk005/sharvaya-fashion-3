// Shared rules. The frontend sends these exact values, so keep them in sync with frontend/src/data/shopOptions.js.
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

export const SORT_OPTIONS = ['featured', 'price-asc', 'price-desc', 'name-asc', 'name-desc'];

export const PRODUCT_LIMITS = {
  nameMax: 80,
  descriptionMax: 500,
  priceMax: 10_000_000,
  defaultPageSize: 24,
  maxPageSize: 48,
  maxImageBytes: 5 * 1024 * 1024,
};

export const IMAGE_BUCKET = 'productImages';
