// Creates or updates the store owner's admin login.
// Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-password' npm run create-admin
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../src/db.js';
import { Admin } from '../src/models/Admin.js';

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';

if (!email.includes('@')) {
  console.error('Set ADMIN_EMAIL to the admin email address.');
  process.exit(1);
}
if (password.length < 10) {
  console.error('Set ADMIN_PASSWORD to at least 10 characters.');
  process.exit(1);
}

try {
  await connectDB();
  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.findOneAndUpdate({ email }, { email, passwordHash }, { upsert: true, new: true });
  console.log(`Admin ready: ${email}`);
} catch (err) {
  console.error('Could not create the admin:', err.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
