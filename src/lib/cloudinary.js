import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads both HD and Protected Preview versions of a sketch.
 * 
 * @param {string} hdFileUri - The original HD image (base64/path).
 * @param {Buffer} previewBuffer - The processed preview image buffer.
 * @returns {Promise<{hdUrl: string, previewUrl: string}>}
 */
export async function uploadProjectSketch(hdFileUri, previewBuffer) {
  // 1. Upload HD version
  const hdResult = await cloudinary.uploader.upload(hdFileUri, {
    folder: 'artist-portal/sketches/hd',
  });

  // 2. Upload Preview version using stream (since it's a buffer)
  const previewResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'artist-portal/sketches/previews' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(previewBuffer);
  });

  return {
    hdUrl: hdResult.secure_url,
    hdPublicId: hdResult.public_id,
    previewUrl: previewResult.secure_url,
    previewPublicId: previewResult.public_id,
  };
}

export async function uploadPaymentScreenshot(fileUri) {
  const result = await cloudinary.uploader.upload(fileUri, {
    folder: 'payments',
  });
  return result.secure_url;
}

export async function deleteFromCloudinary(publicId) {
  if (!publicId) return null;
  return await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
