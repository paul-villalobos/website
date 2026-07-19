import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processLogo() {
  const inputPath = './src/assets/logo_Paul-Villalobos.png';
  console.log(`Processing logo from: ${inputPath}`);

  // 1. Load the original image
  const image = sharp(inputPath);
  const { width, height } = await image.metadata();
  const { data } = await image.raw().toBuffer({ resolveWithObject: true });

  // Create a new buffer with transparency for near-white pixels
  const transparentBuffer = Buffer.alloc(width * height * 4);
  
  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      const outIdx = (y * width + x) * 4;

      // Check if it's near-white (threshold: R, G, B all >= 248)
      const isNearWhite = r >= 248 && g >= 248 && b >= 248;

      if (isNearWhite) {
        transparentBuffer[outIdx] = 0;
        transparentBuffer[outIdx + 1] = 0;
        transparentBuffer[outIdx + 2] = 0;
        transparentBuffer[outIdx + 3] = 0; // Transparent
      } else {
        transparentBuffer[outIdx] = r;
        transparentBuffer[outIdx + 1] = g;
        transparentBuffer[outIdx + 2] = b;
        transparentBuffer[outIdx + 3] = a; // Keep original alpha

        // Track bounding box of non-transparent content
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log(`Content bounding box found: X: [${minX}, ${maxX}], Y: [${minY}, ${maxY}]`);
  
  // Create directories if they don't exist
  if (!fs.existsSync('./src/assets')) {
    fs.mkdirSync('./src/assets', { recursive: true });
  }
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
  }

  // 2. Output the full transparent logo
  const logoWidth = maxX - minX + 1;
  const logoHeight = maxY - minY + 1;

  const croppedLogoBuffer = await sharp(transparentBuffer, {
    raw: { width, height, channels: 4 }
  })
  .extract({ left: minX, top: minY, width: logoWidth, height: logoHeight })
  .png()
  .toBuffer();

  await sharp(croppedLogoBuffer)
    .toFile('./src/assets/logo-transparent.png');
  
  console.log('Saved transparent logo to ./src/assets/logo-transparent.png');

  // Generate monochrome white version of the logo
  const logoMetadata = await sharp(croppedLogoBuffer).metadata();
  const logoRaw = await sharp(croppedLogoBuffer).raw().toBuffer({ resolveWithObject: true });
  const whiteLogoBuffer = Buffer.alloc(logoRaw.data.length);
  for (let i = 0; i < logoRaw.data.length; i += 4) {
    // If pixel is not fully transparent, make it white
    const alpha = logoRaw.data[i + 3];
    whiteLogoBuffer[i] = 255;
    whiteLogoBuffer[i + 1] = 255;
    whiteLogoBuffer[i + 2] = 255;
    whiteLogoBuffer[i + 3] = alpha;
  }
  await sharp(whiteLogoBuffer, {
    raw: { width: logoMetadata.width, height: logoMetadata.height, channels: 4 }
  })
  .png()
  .toFile('./src/assets/logo-transparent-white.png');
  console.log('Saved transparent white logo to ./src/assets/logo-transparent-white.png');

  // 3. Extract the emblem (symbol) from the left side.
  // The emblem is situated roughly from X=150 to X=750 based on density analysis.
  // Let's create a bounding box specifically for the emblem.
  let symbolMinX = width, symbolMaxX = 0, symbolMinY = height, symbolMaxY = 0;

  for (let y = 0; y < height; y++) {
    // Look only at X in range [100, 750] (emblem region)
    for (let x = 100; x < 750; x++) {
      const idx = (y * width + x) * 4;
      const alpha = transparentBuffer[idx + 3];

      if (alpha > 0) {
        if (x < symbolMinX) symbolMinX = x;
        if (x > symbolMaxX) symbolMaxX = x;
        if (y < symbolMinY) symbolMinY = y;
        if (y > symbolMaxY) symbolMaxY = y;
      }
    }
  }

  console.log(`Symbol bounding box found: X: [${symbolMinX}, ${symbolMaxX}], Y: [${symbolMinY}, ${symbolMaxY}]`);

  const symbolWidth = symbolMaxX - symbolMinX + 1;
  const symbolHeight = symbolMaxY - symbolMinY + 1;
  const size = Math.max(symbolWidth, symbolHeight);

  // We want to extract the symbol, and pad it to make it a perfect square
  const padLeft = Math.floor((size - symbolWidth) / 2);
  const padTop = Math.floor((size - symbolHeight) / 2);

  const croppedSymbol = await sharp(transparentBuffer, {
    raw: { width, height, channels: 4 }
  })
  .extract({ left: symbolMinX, top: symbolMinY, width: symbolWidth, height: symbolHeight })
  .extend({
    top: padTop,
    bottom: size - symbolHeight - padTop,
    left: padLeft,
    right: size - symbolWidth - padLeft,
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .png()
  .toBuffer();

  await sharp(croppedSymbol)
    .toFile('./src/assets/logo-symbol-transparent.png');
  
  console.log('Saved transparent symbol to ./src/assets/logo-symbol-transparent.png');

  // Generate monochrome white version of the symbol
  const symbolMetadata = await sharp(croppedSymbol).metadata();
  const symbolRaw = await sharp(croppedSymbol).raw().toBuffer({ resolveWithObject: true });
  const whiteSymbolBuffer = Buffer.alloc(symbolRaw.data.length);
  for (let i = 0; i < symbolRaw.data.length; i += 4) {
    const alpha = symbolRaw.data[i + 3];
    whiteSymbolBuffer[i] = 255;
    whiteSymbolBuffer[i + 1] = 255;
    whiteSymbolBuffer[i + 2] = 255;
    whiteSymbolBuffer[i + 3] = alpha;
  }
  await sharp(whiteSymbolBuffer, {
    raw: { width: symbolMetadata.width, height: symbolMetadata.height, channels: 4 }
  })
  .png()
  .toFile('./src/assets/logo-symbol-transparent-white.png');
  console.log('Saved transparent white symbol to ./src/assets/logo-symbol-transparent-white.png');

  // 4. Generate favicons from the cropped symbol
  const faviconSizes = [32, 96, 192, 512];
  
  for (const s of faviconSizes) {
    await sharp(croppedSymbol)
      .resize(s, s)
      .png()
      .toFile(`./public/favicon-${s}x512.png`.replace('512.png', `${s}.png`)); // handles template names
      
    // Overwrite the existing files specifically:
    await sharp(croppedSymbol)
      .resize(s, s)
      .png()
      .toFile(`./public/favicon-${s}x${s}.png`);
      
    console.log(`Generated public/favicon-${s}x${s}.png`);
  }

  // Generate public/favicon.ico (32x32 size as a PNG named .ico)
  try {
    await sharp(croppedSymbol)
      .resize(32, 32)
      .png()
      .toFile('./public/favicon.ico');
    console.log('Generated public/favicon.ico (as PNG)');
  } catch (err) {
    console.error('Error generating favicon.ico:', err);
  }

  // Also write a 180x180 png for apple-touch-icon
  try {
    await sharp(croppedSymbol)
      .resize(180, 180)
      .png()
      .toFile('./public/favicon-180x180.png');
    console.log('Generated public/favicon-180x180.png');
  } catch (err) {
    console.error('Error generating favicon-180x180.png:', err);
  }
}

processLogo().catch(console.error);
