import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';

export default function ZoomControls() {
  const { scale, zoomTo, resetView } = useCanvasStore();

  const btn =
    'p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors';

  const zoomIn = () => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    zoomTo(scale * 1.25, cx, cy);
  };
  const zoomOut = () => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    zoomTo(scale * 0.8, cx, cy);
  };

  return (
    <div className="flex items-center gap-0.5">
      <button className={btn} onClick={zoomOut} title="Zoom out">
        <ZoomOut size={16} />
      </button>

      <button
        className="text-xs text-gray-500 hover:text-gray-800 w-12 text-center py-1 rounded hover:bg-gray-100 transition-colors tabular-nums"
        onClick={resetView}
        title="Reset view"
      >
        {Math.round(scale * 100)}%
      </button>

      <button className={btn} onClick={zoomIn} title="Zoom in">
        <ZoomIn size={16} />
      </button>

      <button className={btn} onClick={resetView} title="Fit to centre">
        <Maximize size={16} />
      </button>
    </div>
  );
}
