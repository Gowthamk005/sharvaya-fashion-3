// Adds the sample products, but only into an empty database.
// Usage: npm run seed
import { connectDB, disconnectDB } from '../src/db.js';
import { Product } from '../src/models/Product.js';
import { DEMO_PRODUCTS } from '../src/data/demoProducts.js';

try {
  await connectDB();
  const existing = await Product.countDocuments();
  if (existing > 0) {
    console.log(`Skipped: the database already has ${existing} product(s).`);
  } else {
    await Product.insertMany(DEMO_PRODUCTS);
    console.log(`Added ${DEMO_PRODUCTS.length} sample products.`);
  }
} catch (err) {
  console.error('Seeding failed:', err.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
