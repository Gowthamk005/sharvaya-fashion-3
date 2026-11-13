import mongoose from 'mongoose';

// Messages from the Contact Us form, kept so the owner can read them (there is no mail service yet).
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

contactSchema.index({ createdAt: -1 });

export const ContactMessage = mongoose.model('ContactMessage', contactSchema);
