import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import type { StickyNote, Arrow } from '../types';

const PADDING = 48; // px of whitespace around the board content

export async function exportToPDF(
  canvasEl: HTMLElement,
  notes: Record<string, StickyNote>,
  arrows: Record<string, Arrow>,
): Promise<void> {
  const noteList = Object.values(notes);
  const arrowList = Object.values(arrows);
  if (noteList.length === 0 && arrowList.length === 0) return;

  // ── 1. Bounding box of all content in world coordinates ───────────────────
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const n of noteList) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + n.width);
    maxY = Math.max(maxY, n.y + n.height);
  }
  for (const a of arrowList) {
    // Arrow SVG spans from (a.x - M, a.y - M) where M = a.length + 50
    const M = a.length + 50;
    minX = Math.min(minX, a.x - M);
    minY = Math.min(minY, a.y - M);
    maxX = Math.max(maxX, a.x + M + a.length);
    maxY = Math.max(maxY, a.y + M + a.length);
  }

  const W = Math.round(maxX - minX + PADDING * 2);
  const H = Math.round(maxY - minY + PADDING * 2);
  // Translation so that world coord (minX, minY) lands at (PADDING, PADDING) in the output
  const tx = PADDING - minX;
  const ty = PADDING - minY;

  // ── 2. Find the world div (the absolutely-positioned, transformed container) ─
  // canvasEl > Canvas's wrapperRef > world div (has "translate" in its style)
  const worldDiv = canvasEl.querySelector<HTMLElement>('[style*="translate"]');
  if (!worldDiv) return;

  // ── 3. Capture the world div at 1:1 scale, clipped to the content bounds ──
  // The `style` option overrides styles on the cloned element only — no visible DOM change.
  // The `width`/`height` options set the SVG foreignObject size, which clips the capture.
  const dataUrl = await toPng(worldDiv, {
    backgroundColor: '#f8fafc',
    pixelRatio: 2,
    width: W,
    height: H,
    style: {
      transform: `translate(${tx}px, ${ty}px) scale(1)`,
      transformOrigin: '0 0',
    },
  });

  // ── 4. Build the PDF ──────────────────────────────────────────────────────
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = dataUrl;
  });

  const orientation = img.width > img.height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ orientation, unit: 'px', format: [img.width, img.height] });
  pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
  pdf.save('whiteboard.pdf');
}
