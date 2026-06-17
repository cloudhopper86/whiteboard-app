import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export async function exportToPDF(canvasEl: HTMLElement): Promise<void> {
  const dataUrl = await toPng(canvasEl, {
    backgroundColor: '#f8fafc',
    pixelRatio: window.devicePixelRatio || 1,
  });

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = dataUrl;
  });

  const imgW = img.width;
  const imgH = img.height;

  const orientation = imgW > imgH ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ orientation, unit: 'px', format: [imgW, imgH] });
  pdf.addImage(dataUrl, 'PNG', 0, 0, imgW, imgH);
  pdf.save('whiteboard.pdf');
}
