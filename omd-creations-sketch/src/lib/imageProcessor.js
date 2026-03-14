import sharp from 'sharp';

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
  // Explicitly using fill="none" on the SVG and style="background-color: transparent;"
  const svgOverlay = `
    <svg width="${previewWidth}" height="${previewHeight}" viewBox="0 0 ${previewWidth} ${previewHeight}" xmlns="http://www.w3.org/2000/svg" style="background-color: transparent;">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="black" stroke-width="1" stroke-opacity="0.1"/>
        </pattern>
        <pattern id="interference" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="40" stroke="black" stroke-width="1" stroke-opacity="0.05" />
        </pattern>
      </defs>

      <!-- Draw Grid and Interference directly WITHOUT a covering rect background -->
      <rect width="100%" height="100%" fill="url(#grid)" fill-opacity="1" />
      <rect width="100%" height="100%" fill="url(#interference)" fill-opacity="1" />

      <!-- Centered rotated watermark -->
      <g transform="rotate(-20, ${previewWidth / 2}, ${previewHeight / 2})">
        <text 
          x="${previewWidth / 2}" 
          y="${previewHeight / 2}" 
          text-anchor="middle" 
          font-family="Arial, sans-serif" 
          font-weight="bold" 
          fill="black"
        >
          <tspan x="${previewWidth / 2}" dy="-20" font-size="48" fill-opacity="0.15">${artistName.toUpperCase()}</tspan>
          <tspan x="${previewWidth / 2}" dy="50" font-size="28" fill-opacity="0.12">PROJECT: ${mandalName.toUpperCase()}</tspan>
          <tspan x="${previewWidth / 2}" dy="35" font-size="20" fill-opacity="0.08">© ${year} OMD CREATIONS • PREVIEW ONLY</tspan>
        </text>
      </g>
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
