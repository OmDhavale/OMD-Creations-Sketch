import sharp from 'sharp';
import TextToSVG from 'text-to-svg';
import path from 'path';

let textToSVG = null;
try {
  const fontPath = path.join(process.cwd(), 'src', 'lib', 'fonts', 'Roboto-Black.ttf');
  textToSVG = TextToSVG.loadSync(fontPath);
} catch (e) {
  console.error('Failed to load font for watermark', e);
}

/**
 * Generates a protected preview of a sketch using Sharp.
 * Includes resizing, grid overlay, dynamic watermark, and interference patterns.
 * 
 * @param {Buffer} inputBuffer - The original image buffer.
 * @param {Object} metadata - Metadata for the watermark (artistName, mandalName, year).
 * @returns {Promise<Buffer>} - The processed preview image buffer.
 */
export async function generateProtectedPreview(inputBuffer, { artistName, mandalName, year }) {
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  const width = metadata.width || 1000;
  const height = metadata.height || 1000;

  // Step 1: Resize to 1000px width (maintaining aspect ratio)
  const previewWidth = 1000;
  const previewHeight = Math.round((height / width) * previewWidth) || 1000;

  // We'll create SVG overlays for grid, watermark, and interference
  const safeArtist = (artistName || 'OMD CREATIONS').toUpperCase();
  const safeMandal = (mandalName || 'PROJECT').toUpperCase();
  const safeYear = year || new Date().getFullYear();

  let artistPath = '';
  let mandalPath = '';
  let yearPath = '';

  if (textToSVG) {
     artistPath = textToSVG.getD(safeArtist, { x: 200, y: 85, fontSize: 32, anchor: 'center middle' });
     mandalPath = textToSVG.getD(`PROJECT: ${safeMandal}`, { x: 200, y: 125, fontSize: 18, anchor: 'center middle' });
     yearPath = textToSVG.getD(`© ${safeYear} • PREVIEW ONLY`, { x: 200, y: 155, fontSize: 14, anchor: 'center middle' });
  }

  const svgOverlay = `
    <svg width="${previewWidth}" height="${previewHeight}" viewBox="0 0 ${previewWidth} ${previewHeight}" xmlns="http://www.w3.org/2000/svg" style="background-color: transparent;">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="black" stroke-width="1" stroke-opacity="0.1"/>
        </pattern>
        <pattern id="interference" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="40" stroke="black" stroke-width="1" stroke-opacity="0.05" />
        </pattern>
        <pattern id="watermark-pattern" width="400" height="200" patternUnits="userSpaceOnUse" patternTransform="rotate(-25)">
          <!-- Protective Backing Rectangles -->
          <rect x="50" y="55" width="300" height="40" rx="4" fill="white" fill-opacity="0.3" />
          <rect x="100" y="105" width="200" height="25" rx="4" fill="white" fill-opacity="0.3" />
          
          <!-- Deep-baked Font Paths (Guaranteed to render) -->
          <path d="${artistPath}" fill="black" fill-opacity="0.7" stroke="white" stroke-width="1" stroke-opacity="0.5" />
          <path d="${mandalPath}" fill="black" fill-opacity="0.7" stroke="white" stroke-width="0.5" stroke-opacity="0.5" />
          <path d="${yearPath}" fill="black" fill-opacity="0.5" />
        </pattern>
      </defs>

      <!-- Draw Grid, Interference and Tiled Watermark -->
      <rect width="100%" height="100%" fill="url(#grid)" fill-opacity="1" />
      <rect width="100%" height="100%" fill="url(#interference)" fill-opacity="1" />
      <rect width="100%" height="100%" fill="url(#watermark-pattern)" fill-opacity="1" />
    </svg>
  `;

  // Step 2-5: Combine everything with explicit blend mode
  return await image
    .resize(previewWidth)
    .composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0,
        blend: 'over'
      }
    ])
    .jpeg({ quality: 80 }) // Reduced quality for preview
    .toBuffer();
}
