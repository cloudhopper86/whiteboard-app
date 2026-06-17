import { StickyNote, ArrowRight, Settings, Download, Trash2, Grid2X2 } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import { useBoardStore } from '../../store/boardStore';
import { useSettingsStore } from '../../store/settingsStore';
import { exportToPDF } from '../../lib/export';
import ZoomControls from './ZoomControls';
import SyncStatus from '../settings/SyncStatus';
import type { SyncStatus as SyncStatusType } from '../../hooks/useGitHubSync';

interface Props {
  onSettingsOpen: () => void;
  syncStatus: SyncStatusType;
  lastSaved: Date | null;
  onManualSave: () => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export default function Toolbar({
  onSettingsOpen,
  syncStatus,
  lastSaved,
  onManualSave,
  canvasRef,
}: Props) {
  const { offsetX, offsetY, scale } = useCanvasStore();
  const { addNote, addArrow, deleteNote, deleteArrow, selection, maxZIndex } = useBoardStore();
  const { snapToGrid, setSnapToGrid } = useSettingsStore();

  const btn =
    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors';

  const handleAddNote = () => {
    const cx = (window.innerWidth / 2 - offsetX) / scale;
    const cy = (window.innerHeight / 2 - offsetY) / scale;
    addNote({
      id: crypto.randomUUID(),
      x: cx - 120,
      y: cy - 80,
      width: 240,
      height: 160,
      content: '<p></p>',
      backgroundColor: '#fef9c3',
      fontFamily: 'Inter',
      zIndex: maxZIndex + 1,
      hasDivider: false,
      dividerPosition: 50,
    });
  };

  const handleAddArrow = () => {
    const cx = (window.innerWidth / 2 - offsetX) / scale;
    const cy = (window.innerHeight / 2 - offsetY) / scale;
    addArrow({
      id: crypto.randomUUID(),
      x: cx - 60,
      y: cy,
      length: 120,
      rotation: 0,
      color: '#374151',
      strokeWidth: 2.5,
      headStyle: 'arrow',
      zIndex: maxZIndex + 1,
    });
  };

  const handleDeleteSelected = () => {
    if (!selection) return;
    if (selection.kind === 'note') deleteNote(selection.id);
    if (selection.kind === 'arrow') deleteArrow(selection.id);
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    try {
      await exportToPDF(canvasRef.current);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm h-14 shrink-0 z-30 relative">
      {/* Left: Brand */}
      <div className="flex items-center gap-2 min-w-[140px]">
        <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
          <StickyNote size={14} className="text-white" />
        </div>
        <span className="font-semibold text-gray-900 text-sm">DC's Ideation Station</span>
      </div>

      {/* Centre: Tools */}
      <div className="flex items-center gap-1 bg-gray-50 rounded-xl px-2 py-1 border border-gray-200">
        <button className={btn} onClick={handleAddNote} title="Add sticky note (or double-click canvas)">
          <StickyNote size={15} />
          <span className="hidden sm:inline">Note</span>
        </button>

        <div className="w-px h-5 bg-gray-200" />

        <button className={btn} onClick={handleAddArrow} title="Add arrow">
          <ArrowRight size={15} />
          <span className="hidden sm:inline">Arrow</span>
        </button>

        <div className="w-px h-5 bg-gray-200" />

        <button
          className={`${btn} ${snapToGrid ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 hover:text-blue-700' : ''}`}
          onClick={() => setSnapToGrid(!snapToGrid)}
          title={snapToGrid ? 'Snap to grid: on' : 'Snap to grid: off'}
        >
          <Grid2X2 size={15} />
          <span className="hidden sm:inline">Snap</span>
        </button>

        {selection && (
          <>
            <div className="w-px h-5 bg-gray-200" />
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              onClick={handleDeleteSelected}
              title="Delete selected (Del)"
            >
              <Trash2 size={15} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </>
        )}
      </div>

      {/* Right: Zoom + Sync + Settings + Export */}
      <div className="flex items-center gap-2 min-w-[140px] justify-end">
        <ZoomControls />

        <div className="w-px h-5 bg-gray-200" />

        <SyncStatus status={syncStatus} lastSaved={lastSaved} onManualSave={onManualSave} />

        <button
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
          onClick={handleExport}
          title="Export to PDF"
        >
          <Download size={16} />
        </button>

        <button
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
          onClick={onSettingsOpen}
          title="GitHub sync settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
}
