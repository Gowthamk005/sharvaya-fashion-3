import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import jwt from 'jsonwebtoken';
import { listQuerySchema } from '../src/services/productQuery.js';
import { detectImageType } from '../src/utils/detectImageType.js';
import { escapeRegex } from '../src/utils/escapeRegex.js';
import { requireAdmin } from '../src/middleware/requireAdmin.js';
import { HttpError } from '../src/utils/httpError.js';

process.env.JWT_SECRET ??= 'unit-test-secret-long-enough';

describe('image type detection (checks real bytes, not the file name)', () => {
  it('recognises JPEG, PNG and WebP', () => {
    assert.equal(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10])), 'image/jpeg');
    assert.equal(detectImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0])), 'image/png');
    const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBPVP8 ')]);
    assert.equal(detectImageType(webp), 'image/webp');
  });
  it('rejects anything else, including a text file renamed to .jpg', () => {
    assert.equal(detectImageType(Buffer.from('<script>alert(1)</script>')), null);
    assert.equal(detectImageType(Buffer.alloc(0)), null);
  });
});

describe('Shop All query parsing', () => {
  it('applies defaults', () => {
    const p = listQuerySchema.parse({});
    assert.deepEqual(p, { q: '', sort: 'featured', sizes: [], page: 1, limit: 24 });
  });
  it('parses price range, sizes and sort', () => {
    const p = listQuerySchema.parse({ minPrice: '499', maxPrice: '999', sizes: 'S, M', sort: 'name-desc', page: '2' });
    assert.equal(p.minPrice, 499);
    assert.equal(p.maxPrice, 999);
    assert.deepEqual(p.sizes, ['S', 'M']);
    assert.equal(p.sort, 'name-desc');
    assert.equal(p.page, 2);
  });
  it('rejects unknown sorts, sizes and oversized pages', () => {
    assert.throws(() => listQuerySchema.parse({ sort: 'price; drop' }));
    assert.throws(() => listQuerySchema.parse({ sizes: 'XXXL' }));
    assert.throws(() => listQuerySchema.parse({ limit: '500' }));
    assert.throws(() => listQuerySchema.parse({ q: 'x'.repeat(81) }));
  });
});

describe('search escaping', () => {
  it('neutralises regex characters typed by a shopper', () => {
    assert.equal(escapeRegex('kurta (blue).*'), 'kurta \\(blue\\)\\.\\*');
  });
});

describe('admin token check', () => {
  const run = (header) => {
    let received;
    const req = { get: () => header };
    requireAdmin(req, {}, (err) => (received = err));
    return { req, err: received };
  };
  it('rejects a missing token with 401', () => {
    const { err } = run(undefined);
    assert.ok(err instanceof HttpError);
    assert.equal(err.status, 401);
  });
  it('rejects a token signed with the wrong secret', () => {
    const bad = jwt.sign({ sub: 'x', email: 'a@b.c' }, 'another-secret-entirely-xxxxxxxx');
    assert.equal(run(`Bearer ${bad}`).err.status, 401);
  });
  it('accepts a valid token and exposes the admin', () => {
    const good = jwt.sign({ sub: 'abc', email: 'owner@shop.test' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const { req, err } = run(`Bearer ${good}`);
    assert.equal(err, undefined);
    assert.equal(req.admin.email, 'owner@shop.test');
  });
});
