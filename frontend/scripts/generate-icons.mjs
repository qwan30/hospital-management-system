import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect x="1" y="1" width="30" height="30" rx="8" ry="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
  <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" transform="translate(4, 4)" fill="none" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: transparent; width: 100vw; height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center; }
          svg { width: 100%; height: 100%; display: block; }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
    </html>
  `);

  async function renderPng(size) {
    await page.setViewportSize({ width: size, height: size });
    return await page.screenshot({ type: 'png', omitBackground: true });
  }

  const png16 = await renderPng(16);
  const png32 = await renderPng(32);
  const png48 = await renderPng(48);
  const png180 = await renderPng(180);
  const png192 = await renderPng(192);
  const png512 = await renderPng(512);

  function createIco(pngEntries) {
    const numImages = pngEntries.length;
    const headerSize = 6;
    const dirEntrySize = 16;
    let offset = headerSize + dirEntrySize * numImages;

    const header = Buffer.alloc(headerSize);
    header.writeUInt16LE(0, 0); // Reserved
    header.writeUInt16LE(1, 2); // Type: 1 = ICO
    header.writeUInt16LE(numImages, 4); // Number of images

    const dirEntries = [];
    for (const { size, buffer } of pngEntries) {
      const entry = Buffer.alloc(dirEntrySize);
      entry.writeUInt8(size >= 256 ? 0 : size, 0); // Width
      entry.writeUInt8(size >= 256 ? 0 : size, 1); // Height
      entry.writeUInt8(0, 2); // Colors (0 = no palette)
      entry.writeUInt8(0, 3); // Reserved
      entry.writeUInt16LE(1, 4); // Color planes
      entry.writeUInt16LE(32, 6); // Bits per pixel
      entry.writeUInt32LE(buffer.length, 8); // Size of image data
      entry.writeUInt32LE(offset, 12); // Offset of image data
      dirEntries.push(entry);
      offset += buffer.length;
    }

    return Buffer.concat([header, ...dirEntries, ...pngEntries.map(p => p.buffer)]);
  }

  const icoBuffer = createIco([
    { size: 16, buffer: png16 },
    { size: 32, buffer: png32 },
    { size: 48, buffer: png48 }
  ]);

  // Target paths
  const appDir = path.join(frontendDir, 'src', 'app');
  const publicDir = path.join(frontendDir, 'public');

  // Save SVG
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');

  // Save ICO
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

  // Save Apple Touch Icon
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), png180);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);

  console.log('Successfully generated all icon assets!');
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
