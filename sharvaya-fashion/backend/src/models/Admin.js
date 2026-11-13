import mongoose from 'mongoose';

// Store owners who may sign in to /admin. Passwords are stored only as bcrypt hashes.
const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

adminSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.passwordHash;
    return ret;
  },
});

export const Admin = mongoose.model('Admin', adminSchema);
