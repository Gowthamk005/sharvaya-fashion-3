// Exercises the real Express routes. These checks stop before the database is needed
// (validation, auth, upload rules), so they run without MongoDB.
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'http-test-secret-long-enough-xx';
const { createApp } = await import('../src/app.js');

let server;
let base;
let token;

before(async () => {
  // ensureDb is replaced so requests that fail validation never wait for a database.
  server = createApp({ ensureDb: async () => {} }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  token = jwt.sign({ sub: 'admin-1', email: 'owner@shop.test', role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
});

after(() => new Promise((resolve) => server.close(resolve)));

const req = (path, init = {}) => fetch(base + path, init);
const json = async (res) => ({ status: res.status, body: await res.json() });
const form = (fields, file) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  if (file) fd.append('image', new Blob([file.data], { type: file.type }), file.name);
  return fd;
};
const validFields = { name: 'Test Kurta', price: '1299', sizes: 'S,M', description: 'Soft cotton kurta.' };
const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

describe('server basics', () => {
  it('health check responds without a database', async () => {
    const { status, body } = await json(await req('/api/health'));
    assert.equal(status, 200);
    assert.equal(body.ok, true);
  });
  it('unknown API routes return JSON 404', async () => {
    const { status, body } = await json(await req('/api/nope'));
    assert.equal(status, 404);
    assert.match(body.error, /No route/);
  });
  it('does not advertise the framework', async () => {
    assert.equal((await req('/api/health')).headers.get('x-powered-by'), null);
  });
});

describe('admin routes are protected', () => {
  it('creating a product needs a token', async () => {
    const { status, body } = await json(await req('/api/products', { method: 'POST', body: form(validFields) }));
    assert.equal(status, 401);
    assert.match(body.error, /sign in/i);
  });
  it('deleting a product needs a token', async () => {
    const { status } = await json(await req('/api/products/64b64b64b64b64b64b64b64', { method: 'DELETE' }));
    assert.equal(status, 401);
  });
  it('a forged token is refused', async () => {
    const forged = jwt.sign({ sub: 'x', email: 'x@y.z' }, 'attacker-secret-attacker-secret');
    const { status } = await json(
      await req('/api/auth/me', { headers: { authorization: `Bearer ${forged}` } })
    );
    assert.equal(status, 401);
  });
  it('a valid token gets the signed-in user', async () => {
    const { status, body } = await json(
      await req('/api/auth/me', { headers: { authorization: `Bearer ${token}` } })
    );
    assert.equal(status, 200);
    assert.equal(body.user.email, 'owner@shop.test');
  });
});

describe('product input validation (rejected before anything is stored)', () => {
  const auth = () => ({ authorization: `Bearer ${token}` });

  it('lists every invalid field at once', async () => {
    const { status, body } = await json(
      await req('/api/products', { method: 'POST', headers: auth(), body: form({ name: 'A', price: '0', sizes: '', description: 'x' }) })
    );
    assert.equal(status, 400);
    const fields = body.details.map((d) => d.field);
    assert.ok(fields.includes('name') && fields.includes('price') && fields.includes('sizes') && fields.includes('description'));
  });
  it('rejects an unknown size', async () => {
    const { status } = await json(
      await req('/api/products', { method: 'POST', headers: auth(), body: form({ ...validFields, sizes: 'XXXL' }) })
    );
    assert.equal(status, 400);
  });
  it('rejects a file that is not a real image', async () => {
    const { status, body } = await json(
      await req('/api/products', {
        method: 'POST',
        headers: auth(),
        body: form(validFields, { name: 'evil.png', type: 'image/png', data: Buffer.from('<script>x</script>') }),
      })
    );
    assert.equal(status, 400);
    assert.match(body.error, /JPG, PNG or WebP/);
  });
  it('rejects a photo over 5 MB', async () => {
    const { status, body } = await json(
      await req('/api/products', {
        method: 'POST',
        headers: auth(),
        body: form(validFields, { name: 'big.png', type: 'image/png', data: Buffer.concat([pngBytes, Buffer.alloc(6 * 1024 * 1024)]) }),
      })
    );
    assert.equal(status, 413);
    assert.match(body.error, /5 MB/);
  });
});

describe('Shop All query validation', () => {
  it('rejects an unknown sort (no injection through the sort field)', async () => {
    const { status } = await json(await req('/api/products?sort=' + encodeURIComponent('price; drop')));
    assert.equal(status, 400);
  });
  it('rejects a price range that is backwards', async () => {
    const { status, body } = await json(await req('/api/products?minPrice=900&maxPrice=100'));
    assert.equal(status, 400);
    assert.match(body.error, /lowest price/);
  });
  it('rejects an oversized page size', async () => {
    const { status } = await json(await req('/api/products?limit=1000'));
    assert.equal(status, 400);
  });
});

describe('login and contact validation', () => {
  it('login rejects a malformed email before checking the database', async () => {
    const { status, body } = await json(
      await req('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email', password: 'x' }),
      })
    );
    assert.equal(status, 400);
    assert.equal(body.details[0].field, 'email');
  });
  it('contact rejects a filled honeypot field', async () => {
    const { status } = await json(
      await req('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Bot', email: 'bot@x.io', message: 'buy cheap things now', website: 'http://spam' }),
      })
    );
    assert.equal(status, 400);
  });
  it('contact rejects a short message and a bad phone number', async () => {
    const { status, body } = await json(
      await req('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Asha', email: 'asha@x.io', phone: 'call me', message: 'hi' }),
      })
    );
    assert.equal(status, 400);
    const fields = body.details.map((d) => d.field);
    assert.ok(fields.includes('phone') && fields.includes('message'));
  });
  it('broken JSON gets a clear 400, not a crash', async () => {
    const { status, body } = await json(
      await req('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{oops' })
    );
    assert.equal(status, 400);
    assert.match(body.error, /JSON/);
  });
});

describe('photo URLs', () => {
  it('an invalid photo id is a clean 404', async () => {
    const { status } = await json(await req('/api/images/not-a-real-id'));
    assert.equal(status, 404);
  });
});
