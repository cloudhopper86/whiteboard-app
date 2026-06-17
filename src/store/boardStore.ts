import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { StickyNote, Arrow, SelectionTarget } from '../types';

interface BoardStore {
  notes: Record<string, StickyNote>;
  arrows: Record<string, Arrow>;
  selection: SelectionTarget;
  maxZIndex: number;

  // Notes
  addNote: (note: StickyNote) => void;
  updateNote: (id: string, patch: Partial<StickyNote>) => void;
  deleteNote: (id: string) => void;

  // Arrows
  addArrow: (arrow: Arrow) => void;
  updateArrow: (id: string, patch: Partial<Arrow>) => void;
  deleteArrow: (id: string) => void;

  // Selection
  setSelection: (sel: SelectionTarget) => void;
  clearSelection: () => void;

  // Bring to front
  bringToFront: (kind: 'note' | 'arrow', id: string) => void;

  // Hydrate from saved state
  hydrate: (notes: Record<string, StickyNote>, arrows: Record<string, Arrow>) => void;
}

export const useBoardStore = create<BoardStore>()(
  subscribeWithSelector((set) => ({
    notes: {},
    arrows: {},
    selection: null,
    maxZIndex: 1,

    addNote: (note) =>
      set((s) => ({
        notes: { ...s.notes, [note.id]: note },
        maxZIndex: Math.max(s.maxZIndex, note.zIndex),
      })),

    updateNote: (id, patch) =>
      set((s) => ({
        notes: { ...s.notes, [id]: { ...s.notes[id], ...patch } },
      })),

    deleteNote: (id) =>
      set((s) => {
        const notes = { ...s.notes };
        delete notes[id];
        return { notes, selection: s.selection?.id === id ? null : s.selection };
      }),

    addArrow: (arrow) =>
      set((s) => ({
        arrows: { ...s.arrows, [arrow.id]: arrow },
        maxZIndex: Math.max(s.maxZIndex, arrow.zIndex),
      })),

    updateArrow: (id, patch) =>
      set((s) => ({
        arrows: { ...s.arrows, [id]: { ...s.arrows[id], ...patch } },
      })),

    deleteArrow: (id) =>
      set((s) => {
        const arrows = { ...s.arrows };
        delete arrows[id];
        return { arrows, selection: s.selection?.id === id ? null : s.selection };
      }),

    setSelection: (sel) => set({ selection: sel }),
    clearSelection: () => set({ selection: null }),

    bringToFront: (kind, id) =>
      set((s) => {
        const next = s.maxZIndex + 1;
        if (kind === 'note') {
          return {
            notes: { ...s.notes, [id]: { ...s.notes[id], zIndex: next } },
            maxZIndex: next,
          };
        }
        return {
          arrows: { ...s.arrows, [id]: { ...s.arrows[id], zIndex: next } },
          maxZIndex: next,
        };
      }),

    hydrate: (notes, arrows) => {
      const allZ = [
        ...Object.values(notes).map((n) => n.zIndex),
        ...Object.values(arrows).map((a) => a.zIndex),
      ];
      set({ notes, arrows, maxZIndex: allZ.length ? Math.max(...allZ) : 1 });
    },
  }))
);
