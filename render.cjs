// Render frontpage.html to entry.png at exactly 1024x1024 with headless Chrome.
// Usage: node render.cjs   (run from this directory)
const puppeteer = require('/home/hatch/workspace/makefun/radar-tools/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const SRC = 'file://' + path.join(DIR, 'frontpage.html');
const OUT = path.join(DIR, 'entry.png');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 1 });
    await page.goto(SRC, { waitUntil: 'load', timeout: 30000 });
    await page.screenshot({ path: OUT, type: 'png' });
  } finally {
    await browser.close();
  }

  const buf = fs.readFileSync(OUT);
  const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ok = buf.subarray(0, 8).equals(pngSig);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  console.log(JSON.stringify({ path: OUT, isPng: ok, width: w, height: h, bytes: buf.length }));
  if (!ok || w !== 1024 || h !== 1024 || buf.length > 1048576) {
    console.error('entry.png failed the size/format check');
    process.exit(1);
  }
})().catch((e) => { console.error('RENDER FAILED:', e.message); process.exit(1); });
