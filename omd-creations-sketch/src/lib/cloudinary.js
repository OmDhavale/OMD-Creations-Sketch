import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image to Cloudinary and returns the HD URL and a watermarked preview URL.
 * 
 * @param {string} fileUri - The file path or base64 data to upload.
 * @param {Object} watermarkData - Data for the watermark (artistName, mandalName, year).
 * @returns {Promise<{hdUrl: string, previewUrl: string}>}
 */
export async function uploadSketch(fileUri, { artistName, mandalName, year }) {
  // Upload HD version
  const hdResult = await cloudinary.uploader.upload(fileUri, {
    folder: 'sketches/hd',
  });

  // Create preview version with watermark and grid
  // Cloudinary transformations:
  // - w_1000: set width to 1000px
  // - q_auto: automatic quality
  // - f_auto: automatic format
  // - overlay (watermark text): l_text:arial_40_bold:Text,g_center,o_30
  // - overlay (grid): This is harder with just text, but we can use multiple text overlays or a predefined image overlay.
  // For this prototype, we'll use a strong text watermark.

  const watermarkText = encodeURIComponent(`${artistName} | ${mandalName} | ${year}`);
  
  // Construct the preview URL manually or using the helper
  // We want: low res, watermark overlay, maybe some color adjustments to make it look "preview-y"
  const previewUrl = cloudinary.url(hdResult.public_id, {
    width: 1000,
    crop: 'scale',
    quality: 'auto',
    fetch_format: 'auto',
    overlay: {
      font_family: 'Arial',
      font_size: 40,
      font_weight: 'bold',
      text: `${artistName} - ${mandalName} (${year})`,
    },
    gravity: 'center',
    opacity: 30,
    angle: 45,
    effect: 'sepia:50', // Just to make it look distinct from HD
  });

  return {
    hdUrl: hdResult.secure_url,
    previewUrl: previewUrl,
  };
}

export async function uploadPaymentScreenshot(fileUri) {
  const result = await cloudinary.uploader.upload(fileUri, {
    folder: 'payments',
  });
  return result.secure_url;
}

export default cloudinary;
