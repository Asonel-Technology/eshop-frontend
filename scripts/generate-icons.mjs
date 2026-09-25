import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { deflateSync } from "node:zlib";

const icons = path.resolve(import.meta.dirname, "../public/icons");
await mkdir(icons, { recursive: true });

const BLACK = [0x11, 0x11, 0x11];
const ORANGE = [0xd4, 0x62, 0x2d];

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) {
    c ^= byte;
    for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function png(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    rgba.copy(raw, row + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function fill(px, size, x0, y0, x1, y1, color) {
  const left = Math.max(0, Math.round(x0 * size));
  const top = Math.max(0, Math.round(y0 * size));
  const right = Math.min(size, Math.round(x1 * size));
  const bottom = Math.min(size, Math.round(y1 * size));
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const i = (y * size + x) * 4;
      px[i] = color[0];
      px[i + 1] = color[1];
      px[i + 2] = color[2];
      px[i + 3] = 255;
    }
  }
}

function drawB(px, size, inset) {
  fill(px, size, 0, 0, 1, 1, BLACK);
  const s = 1 - inset * 2;
  const o = inset;
  const x = (v) => o + v * s;
  const y = (v) => o + v * s;
  fill(px, size, x(0.24), y(0.18), x(0.40), y(0.82), ORANGE);
  fill(px, size, x(0.40), y(0.18), x(0.70), y(0.32), ORANGE);
  fill(px, size, x(0.40), y(0.44), x(0.66), y(0.56), ORANGE);
  fill(px, size, x(0.40), y(0.68), x(0.72), y(0.82), ORANGE);
  fill(px, size, x(0.64), y(0.24), x(0.76), y(0.50), ORANGE);
  fill(px, size, x(0.66), y(0.50), x(0.80), y(0.76), ORANGE);
  fill(px, size, x(0.40), y(0.32), x(0.64), y(0.44), BLACK);
  fill(px, size, x(0.40), y(0.56), x(0.66), y(0.68), BLACK);
}

function writeIcon(size, name, inset) {
  const px = Buffer.alloc(size * size * 4);
  drawB(px, size, inset);
  return new Promise((resolve, reject) => {
    const out = createWriteStream(path.join(icons, name));
    out.on("finish", resolve);
    out.on("error", reject);
    out.end(png(size, size, px));
  });
}

await writeIcon(192, "icon-192.png", 0.12);
await writeIcon(512, "icon-512.png", 0.12);
await writeIcon(512, "icon-maskable-512.png", 0.22);
await writeIcon(180, "apple-touch-icon.png", 0.12);
await writeIcon(32, "favicon-32.png", 0.12);
