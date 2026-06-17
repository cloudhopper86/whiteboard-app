import { create } from 'zustand';

interface CanvasStore {
  offsetX: number;
  offsetY: number;
  scale: number;

  setOffset: (x: number, y: number) => void;
  setScale: (scale: number) => void;
  panBy: (dx: number, dy: number) => void;
  zoomTo: (scale: number, originX: number, originY: number) => void;
  resetView: () => void;
}

const MIN_SCALE = 0.1;
const MAX_SCALE = 4;

export const useCanvasStore = create<CanvasStore>()((set) => ({
  offsetX: 0,
  offsetY: 0,
  scale: 1,

  setOffset: (offsetX, offsetY) => set({ offsetX, offsetY }),

  setScale: (scale) => set({ scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale)) }),

  panBy: (dx, dy) =>
    set((s) => ({ offsetX: s.offsetX + dx, offsetY: s.offsetY + dy })),

  zoomTo: (newScale, originX, originY) => {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
    set((s) => {
      const ratio = clamped / s.scale;
      return {
        scale: clamped,
        offsetX: originX - ratio * (originX - s.offsetX),
        offsetY: originY - ratio * (originY - s.offsetY),
      };
    });
  },

  resetView: () => set({ offsetX: 0, offsetY: 0, scale: 1 }),
}));
