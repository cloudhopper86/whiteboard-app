import { Bold, Italic, Minus, Trash2 } from 'lucide-react';
import type { Editor } from '@tiptap/react';
import { FONT_OPTIONS } from '../../lib/fonts';

const NOTE_COLORS = [
  { label: 'Yellow', value: '#fef9c3' },
  { label: 'Pink', value: '#fce7f3' },
  { label: 'Blue', value: '#dbeafe' },
  { label: 'Green', value: '#dcfce7' },
  { label: 'Purple', value: '#ede9fe' },
  { label: 'Orange', value: '#ffedd5' },
  { label: 'White', value: '#ffffff' },
];

interface Props {
  editor: Editor | null;
  backgroundColor: string;
  fontFamily: string;
  onDelete: () => void;
  onBgColorChange: (color: string) => void;
  onFontChange: (font: string) => void;
}

export default function NoteToolbar({
  editor,
  backgroundColor,
  fontFamily,
  onDelete,
  onBgColorChange,
  onFontChange,
}: Props) {
  const btn = 'p-1 rounded hover:bg-black/10 transition-colors flex items-center justify-center';
  const active = 'bg-black/15';

  return (
    <div
      className="absolute -top-11 left-0 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-1.5 z-50 whitespace-nowrap"
      // Prevent canvas from receiving these interactions
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {/* Font size */}
      <select
        value={editor?.isActive('heading', { level: 1 }) ? 'heading' : 'text'}
        onChange={(e) => {
          if (e.target.value === 'heading') {
            editor?.chain().focus().setHeading({ level: 1 }).run();
          } else {
            editor?.chain().focus().setParagraph().run();
          }
        }}
        className="text-xs border border-gray-200 rounded px-1 py-0.5 outline-none cursor-pointer bg-white"
        style={{ maxWidth: 80 }}
      >
        <option value="text">Text</option>
        <option value="heading">Heading</option>
      </select>

      <div className="w-px h-4 bg-gray-200 mx-0.5" />

      {/* Font family */}
      <select
        value={fontFamily}
        onChange={(e) => onFontChange(e.target.value)}
        className="text-xs border border-gray-200 rounded px-1 py-0.5 outline-none cursor-pointer bg-white"
        style={{ maxWidth: 110 }}
      >
        {FONT_OPTIONS.map((f) => (
          <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
            {f.label}
          </option>
        ))}
      </select>

      <div className="w-px h-4 bg-gray-200 mx-0.5" />

      <button
        className={`${btn} ${editor?.isActive('bold') ? active : ''}`}
        onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleBold().run(); }}
        title="Bold"
      >
        <Bold size={13} />
      </button>

      <button
        className={`${btn} ${editor?.isActive('italic') ? active : ''}`}
        onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleItalic().run(); }}
        title="Italic"
      >
        <Italic size={13} />
      </button>

      <div className="w-px h-4 bg-gray-200 mx-0.5" />

      {/* Text colour swatches */}
      <div className="flex gap-0.5 items-center">
        {[
          { label: 'Black', value: '#000000' },
          { label: 'White', value: '#ffffff' },
          { label: 'Red',   value: '#ef4444' },
          { label: 'Blue',  value: '#3b82f6' },
          { label: 'Green', value: '#22c55e' },
        ].map((c) => (
          <button
            key={c.value}
            className="w-4 h-4 rounded-full border-2 border-gray-300 transition-transform hover:scale-110"
            style={{ backgroundColor: c.value }}
            onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().setColor(c.value).run(); }}
            title={`Text: ${c.label}`}
          />
        ))}
      </div>

      <div className="w-px h-4 bg-gray-200 mx-0.5" />

      <button
        className={btn}
        onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().setHorizontalRule().run(); }}
        title="Add divider"
      >
        <Minus size={13} />
      </button>

      <div className="w-px h-4 bg-gray-200 mx-0.5" />

      {/* Background colour swatches */}
      <div className="flex gap-0.5 items-center">
        {NOTE_COLORS.map((c) => (
          <button
            key={c.value}
            className={`w-4 h-4 rounded-full border-2 transition-transform hover:scale-110 ${
              backgroundColor === c.value ? 'border-gray-500 scale-110' : 'border-gray-300'
            }`}
            style={{ backgroundColor: c.value }}
            onClick={() => onBgColorChange(c.value)}
            title={c.label}
          />
        ))}
      </div>

      <div className="w-px h-4 bg-gray-200 mx-0.5" />

      <button
        className={`${btn} text-red-500 hover:bg-red-50`}
        onClick={onDelete}
        title="Delete note"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
