import { readFileSync } from 'fs'
import path from 'path'

const FONTS_DIR = path.resolve(process.cwd(), 'src/infrastructure/pdf/fonts')

let cachedFontFaces: string | null = null

/** @font-face CSS ของ Sarabun (regular + bold) ฝังเป็น base64 สำหรับเอกสาร PDF ภาษาไทย */
export function sarabunFontFaces(): string {
  if (!cachedFontFaces) {
    const regular = readFileSync(path.join(FONTS_DIR, 'Sarabun-Regular.ttf')).toString('base64')
    const bold = readFileSync(path.join(FONTS_DIR, 'Sarabun-Bold.ttf')).toString('base64')
    cachedFontFaces = `
    @font-face {
      font-family: 'Sarabun';
      src: url(data:font/truetype;base64,${regular}) format('truetype');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'Sarabun';
      src: url(data:font/truetype;base64,${bold}) format('truetype');
      font-weight: 700;
      font-style: normal;
    }`
  }
  return cachedFontFaces
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
