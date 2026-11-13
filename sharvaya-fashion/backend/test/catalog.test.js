// Product rules that can be checked without a running database.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import mongoose from 'mongoose';
import { DEMO_PRODUCTS } from '../src/data/demoProducts.js';
import { Product } from '../src/models/Product.js';
import { listQuerySchema } from '../src/services/productQuery.js';

const validProduct = () => ({
  name: 'Test Kurta',
  price: 1299,
  sizes: ['S', 'M'],
  description: 'Soft cotton kurta.',
});

describe('Shop All query parsing', () => {
  it('accepts every sort the frontend offers', () => {
    for (const sort of ['featured', 'price-asc', 'price-desc', 'name-asc', 'name-desc']) {
      assert.equal(listQuerySchema.parse({ sort }).sort, sort);
    }
  });
  it('defaults to featured with 24 per page', () => {
    const q = listQuerySchema.parse({});
    assert.equal(q.sort, 'featured');
    assert.equal(q.limit, 24);
    assert.equal(q.page, 1);
    assert.deepEqual(q.sizes, []);
  });
  it('turns a comma list of sizes into an array', () => {
    assert.deepEqual(listQuerySchema.parse({ sizes: 'S, M,L' }).sizes, ['S', 'M', 'L']);
  });
  it('rejects a size that is not in the list', () => {
    assert.throws(() => listQuerySchema.parse({ sizes: 'S,XXXL' }));
  });
  it('trims and caps the search text', () => {
    assert.equal(listQuerySchema.parse({ q: '  kurta  ' }).q, 'kurta');
    assert.throws(() => listQuerySchema.parse({ q: 'x'.repeat(81) }));
  });
});

describe('Product model', () => {
  it('accepts a complete product', () => {
    assert.equal(new Product(validProduct()).validateSync(), undefined);
  });
  it('rejects a zero or fractional-free invalid price', () => {
    assert.ok(new Product({ ...validProduct(), price: 0 }).validateSync()?.errors.price);
  });
  it('requires at least one size', () => {
    assert.ok(new Product({ ...validProduct(), sizes: [] }).validateSync()?.errors.sizes);
  });
  it('rejects a size outside the allowed list', () => {
    assert.ok(new Product({ ...validProduct(), sizes: ['XXXL'] }).validateSync()?.errors['sizes.0']);
  });
  it('JSON output uses id and a photo URL, and hides internal fields', () => {
    const imageId = new mongoose.Types.ObjectId();
    const json = new Product({ ...validProduct(), imageId, imageType: 'image/jpeg' }).toJSON();
    assert.equal(json.id.length, 24);
    assert.equal(json.image, `/api/images/${imageId}`);
    assert.equal('_id' in json, false);
    assert.equal('imageId' in json, false);
    assert.equal('imageType' in json, false);
    assert.equal('__v' in json, false);
  });
  it('a product without a photo has image null', () => {
    assert.equal(new Product(validProduct()).toJSON().image, null);
  });
});

describe('demo products', () => {
  it('every demo product passes the Product schema', () => {
    assert.ok(DEMO_PRODUCTS.length >= 6);
    for (const item of DEMO_PRODUCTS) {
      assert.equal(new Product(item).validateSync(), undefined, `invalid demo product: ${item.name}`);
    }
  });
});
