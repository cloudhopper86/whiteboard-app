import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { StickyNote, Arrow, SelectionTarget } from '../types';

interface BoardStore {
  notes: Record<string, StickyNote>;
  arrows: Record<string, Arrow>;
  selection: SelectionTarget;
  multiSelectedNoteIds: string[];
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
  setMultiSelection: (ids: string[]) => void;
  toggleNoteInMultiSelection: (id: string) => void;

  // Bring to front
  bringToFront: (kind: 'note' | 'arrow', id: string) => void;
  bringManyToFront: (ids: string[]) => void;

  // Hydrate from saved state
  hydrate: (notes: Record<string, StickyNote>, arrows: Record<string, Arrow>) => void;
}

export const useBoardStore = create<BoardStore>()(
  subscribeWithSelector((set) => ({
    notes: {},
    arrows: {},
    selection: null,
    multiSelectedNoteIds: [],
    maxZIndex: 1,

    addNote: (note) =>
      set((s) => ({
        notes: { ...s.notes, [note.id]: note },
        maxZIndex: Math.max(s.maxZIndex, note.zIndex),
      })),

    updateNote: (id, patch) =>
      set((s) => {
        if (!s.notes[id]) return s;
        return { notes: { ...s.notes, [id]: { ...s.notes[id], ...patch } } };
      }),

    deleteNote: (id) =>
      set((s) => {
        const notes = { ...s.notes };
        delete notes[id];
        return {
          notes,
          selection: s.selection?.id === id ? null : s.selection,
          multiSelectedNoteIds: s.multiSelectedNoteIds.filter((i) => i !== id),
        };
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
    clearSelection: () => set({ selection: null, multiSelectedNoteIds: [] }),

    setMultiSelection: (ids) =>
      set({ selection: null, multiSelectedNoteIds: ids }),

    toggleNoteInMultiSelection: (id) =>
      set((s) => {
        // Promote an existing single-note selection into multi when shift-clicking
        let base = s.multiSelectedNoteIds;
        if (base.length === 0 && s.selection?.kind === 'note') {
          base = [s.selection.id];
        }
        const alreadyIn = base.includes(id);
        return {
          selection: null,
          multiSelectedNoteIds: alreadyIn ? base.filter((i) => i !== id) : [...base, id],
        };
      }),

    bringToFront: (kind, id) =>
      set((s) => {
        const next = s.maxZIndex + 1;
        if (kind === 'note') {
          if (!s.notes[id]) return s;
          return {
            notes: { ...s.notes, [id]: { ...s.notes[id], zIndex: next } },
            maxZIndex: next,
          };
        }
        if (!s.arrows[id]) return s;
        return {
          arrows: { ...s.arrows, [id]: { ...s.arrows[id], zIndex: next } },
          maxZIndex: next,
        };
      }),

    bringManyToFront: (ids) =>
      set((s) => {
        let next = s.maxZIndex;
        const updates: Record<string, StickyNote> = {};
        ids.forEach((id) => {
          if (s.notes[id]) {
            next++;
            updates[id] = { ...s.notes[id], zIndex: next };
          }
        });
        return { notes: { ...s.notes, ...updates }, maxZIndex: next };
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
