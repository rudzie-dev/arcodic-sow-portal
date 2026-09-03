import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const PAGE_SIZE = [612, 792]; // US Letter
const MARGIN = 56;
const FONT_SIZE = 10;
const LINE_HEIGHT = 14;

// Renders the contract's plain-text content into a simple multi-page PDF so
// it can be uploaded to SignWell. Deliberately minimal (monospace body
// text, no styling) — SignWell's own signing-page chrome, not this
// document's typesetting, is what the client actually interacts with.
export async function textToPdf(text) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Courier);
  const [pageWidth, pageHeight] = PAGE_SIZE;
  const maxWidth = pageWidth - MARGIN * 2;
  const maxCharsPerLine = Math.floor(maxWidth / (font.widthOfTextAtSize('M', FONT_SIZE)));

  const lines = wrapText(text, maxCharsPerLine);
  let page = doc.addPage(PAGE_SIZE);
  let y = pageHeight - MARGIN;

  for (const line of lines) {
    if (y < MARGIN) {
      page = doc.addPage(PAGE_SIZE);
      y = pageHeight - MARGIN;
    }
    page.drawText(line, { x: MARGIN, y, size: FONT_SIZE, font, color: rgb(0.1, 0.1, 0.1) });
    y -= LINE_HEIGHT;
  }

  return doc.save(); // Uint8Array
}

function wrapText(text, maxChars) {
  const out = [];
  for (const rawLine of text.split('\n')) {
    if (rawLine.length <= maxChars) {
      out.push(rawLine);
      continue;
    }
    let remaining = rawLine;
    while (remaining.length > maxChars) {
      let cut = remaining.lastIndexOf(' ', maxChars);
      if (cut <= 0) cut = maxChars;
      out.push(remaining.slice(0, cut));
      remaining = remaining.slice(cut).trimStart();
    }
    out.push(remaining);
  }
  return out;
}
