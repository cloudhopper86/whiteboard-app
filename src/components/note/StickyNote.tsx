import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { GripHorizontal } from 'lucide-react';
import { Rnd } from 'react-rnd';
import { useRef } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { loadFont } from '../../lib/fonts';
import type { StickyNote as StickyNoteType } from '../../types';
import NoteToolbar from './NoteToolbar';

interface Props {
  note: StickyNoteType;
  canvasScale: number;
  snapToGrid?: boolean;
}

const GRID = 20;
const snapValue = (v: number) => Math.round(v / GRID) * GRID;

export default function StickyNote({ note, canvasScale, snapToGrid }: Props) {
  const { updateNote, deleteNote, setSelection, selection, bringToFront } =
    useBoardStore();
  const isSelected = selection?.kind === 'note' && selection.id === note.id;

  // ── Manual drag via the grip handle ──────────────────────────────────────
  const dragRef = useRef<{
    screenX: number;
    screenY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const onGripPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setSelection({ kind: 'note', id: note.id });
    bringToFront('note', note.id);
    dragRef.current = {
      screenX: e.clientX,
      screenY: e.clientY,
      startX: note.x,
      startY: note.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onGripPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = (e.clientX - dragRef.current.screenX) / canvasScale;
    const dy = (e.clientY - dragRef.current.screenY) / canvasScale;
    let newX = dragRef.current.startX + dx;
    let newY = dragRef.current.startY + dy;
    if (snapToGrid) {
      newX = snapValue(newX);
      newY = snapValue(newY);
    }
    updateNote(note.id, { x: newX, y: newY });
  };

  const onGripPointerUp = () => {
    dragRef.current = null;
  };

  // ── Editor ────────────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, FontFamily],
    content: note.content || '<p></p>',
    onUpdate: ({ editor }) => {
      updateNote(note.id, { content: editor.getHTML() });
    },
  });

  const handleClick = () => {
    setSelection({ kind: 'note', id: note.id });
    bringToFront('note', note.id);
  };

  return (
    // react-rnd is used ONLY for corner/edge resize handles; drag is disabled
    <Rnd
      disableDragging
      position={{ x: note.x, y: note.y }}
      size={{ width: note.width, height: note.height }}
      scale={canvasScale}
      minWidth={160}
      minHeight={100}
      style={{ zIndex: note.zIndex }}
      onResizeStart={() => {
        setSelection({ kind: 'note', id: note.id });
        bringToFront('note', note.id);
      }}
      onResizeStop={(_e, _dir, ref, delta, pos) => {
        const rawW = parseFloat(ref.style.width);
        const rawH = parseFloat(ref.style.height);
        let newWidth  = isFinite(rawW) && rawW > 0 ? rawW  : note.width  + delta.width;
        let newHeight = isFinite(rawH) && rawH > 0 ? rawH  : note.height + delta.height;
        let newX = isFinite(pos.x) ? pos.x : note.x;
        let newY = isFinite(pos.y) ? pos.y : note.y;
        if (snapToGrid) {
          newWidth  = Math.max(160, snapValue(newWidth));
          newHeight = Math.max(100, snapValue(newHeight));
          newX = snapValue(newX);
          newY = snapValue(newY);
        }
        updateNote(note.id, {
          width:  snapToGrid ? newWidth  : Math.max(160, newWidth),
          height: snapToGrid ? newHeight : Math.max(100, newHeight),
          x: newX,
          y: newY,
        });
      }}
    >
      {/* Outer wrapper — stops double-click reaching the canvas */}
      <div
        className="relative w-full h-full"
        onClick={handleClick}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        {/* Floating format toolbar */}
        {isSelected && (
          <NoteToolbar
            editor={editor}
            backgroundColor={note.backgroundColor}
            fontFamily={note.fontFamily}
            onDelete={() => deleteNote(note.id)}
            onBgColorChange={(color) => updateNote(note.id, { backgroundColor: color })}
            onFontChange={(font) => {
              loadFont(font);
              updateNote(note.id, { fontFamily: font });
            }}
          />
        )}

        {/* Card */}
        <div
          className={`w-full h-full rounded-xl shadow-md flex flex-col overflow-hidden border-2 transition-colors ${
            isSelected ? 'border-blue-400' : 'border-transparent'
          }`}
          style={{ backgroundColor: note.backgroundColor, fontFamily: note.fontFamily }}
        >
          {/* ── Grip handle — drag starts here ─────────────────────────── */}
          <div
            className="shrink-0 h-6 flex items-center justify-center select-none touch-none"
            style={{
              backgroundColor: 'rgba(0,0,0,0.04)',
              cursor: dragRef.current ? 'grabbing' : 'grab',
            }}
            onPointerDown={onGripPointerDown}
            onPointerMove={onGripPointerMove}
            onPointerUp={onGripPointerUp}
            onPointerCancel={onGripPointerUp}
          >
            <GripHorizontal size={14} className="text-gray-400 pointer-events-none" />
          </div>

          {/* ── Editor ─────────────────────────────────────────────────── */}
          <EditorContent
            editor={editor}
            className={`
              flex-1 overflow-auto text-sm
              [&_.ProseMirror]:h-full
              [&_.ProseMirror]:min-h-full
              [&_.ProseMirror]:outline-none
              [&_.ProseMirror]:p-3
              [&_.ProseMirror]:cursor-text
              [&_.ProseMirror_hr]:border-gray-400
              [&_.ProseMirror_hr]:my-2
              [&_.ProseMirror_p]:leading-snug
              [&_.ProseMirror_h1]:text-xl
              [&_.ProseMirror_h1]:font-bold
              [&_.ProseMirror_h1]:leading-tight
              [&_.ProseMirror_h1]:mb-1
            `}
          />
        </div>
      </div>
    </Rnd>
  );
}
