// Shop All options. The sort and size values must match backend/src/config/constants.js.
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

export const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name-asc', label: 'A to Z' },
  { value: 'name-desc', label: 'Z to A' },
];

// Inclusive rupee ranges (prices are whole rupees), so 499 falls in "499 - 999" and not "under 499".
export const PRICE_RANGES = [
  { value: 'under-499', label: 'Under ₹499', min: undefined, max: 498 },
  { value: '499-999', label: '₹499 – ₹999', min: 499, max: 999 },
  { value: '1000-1999', label: '₹1,000 – ₹1,999', min: 1000, max: 1999 },
  { value: '2000-2999', label: '₹2,000 – ₹2,999', min: 2000, max: 2999 },
  { value: '3000-plus', label: '₹3,000 & above', min: 3000, max: undefined },
];

export const sortLabel = (value) => SORTS.find((s) => s.value === value)?.label ?? 'Featured';
export const rangeLabel = (value) => PRICE_RANGES.find((r) => r.value === value)?.label ?? '';

// The API parameters for a price range id, e.g. "499-999" -> { minPrice: 499, maxPrice: 999 }
export function rangeParams(value) {
  const range = PRICE_RANGES.find((r) => r.value === value);
  return range ? { minPrice: range.min, maxPrice: range.max } : {};
}
