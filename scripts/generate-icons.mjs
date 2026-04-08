import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'icons')

fs.mkdirSync(outDir, { recursive: true })

/** Solid fill PNG (theme: slate-900-ish) */
function createPng(size, rgb) {
  const png = new PNG({ width: size, height: size })
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2
      png.data[idx] = rgb[0]
      png.data[idx + 1] = rgb[1]
      png.data[idx + 2] = rgb[2]
      png.data[idx + 3] = 255
    }
  }
  return PNG.sync.write(png)
}

const bg = [15, 23, 42] // #0f172a
fs.writeFileSync(path.join(outDir, 'icon-192.png'), createPng(192, bg))
fs.writeFileSync(path.join(outDir, 'icon-512.png'), createPng(512, bg))
console.log('Generated public/icons/icon-192.png and icon-512.png')
