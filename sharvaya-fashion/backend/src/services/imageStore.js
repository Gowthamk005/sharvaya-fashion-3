import mongoose from 'mongoose';
import { IMAGE_BUCKET } from '../config/constants.js';

// Product photos are stored in MongoDB itself using GridFS, so they are backed up with the database.
const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: IMAGE_BUCKET });
const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

export function saveImage(buffer, contentType) {
  return new Promise((resolve, reject) => {
    const upload = bucket().openUploadStream('product-photo', {
      contentType,
      metadata: { uploadedAt: new Date() },
    });
    upload.once('error', reject);
    upload.once('finish', () => resolve(upload.id));
    upload.end(buffer);
  });
}

export async function findImage(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return mongoose.connection.db
    .collection(`${IMAGE_BUCKET}.files`)
    .findOne({ _id: toObjectId(id) }, { projection: { contentType: 1, length: 1 } });
}

export function openImageStream(id) {
  return bucket().openDownloadStream(toObjectId(id));
}

// Best-effort removal; a missing file is not an error worth failing a request over.
export async function deleteImage(id) {
  if (!id) return;
  try {
    await bucket().delete(toObjectId(id));
  } catch (err) {
    console.warn('[images] could not delete', String(id), err.message);
  }
}
