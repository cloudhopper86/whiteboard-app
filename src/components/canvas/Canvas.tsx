import { useCallback, useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { useBoardStore } from '../../store/boardStore';
import { useSettingsStore } from '../../store/settingsStore';
import { screenToWorld } from '../../lib/coords';
import CanvasGrid from './CanvasGrid';
import StickyNote from '../note/StickyNote';
import Arrow from '../arrow/Arrow';

const SEL_THRESHOLD = 5; // px before rubber band activates

export default function Canvas() {
  const { offsetX, offsetY, scale, panBy } = useCanvasStore();
  const { notes, arrows, addNote, clearSelection, setMultiSelection } = useBoardStore();
  const snapToGrid = useSettingsStore((s) => s.snapToGrid);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const spaceHeld = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  // Rubber-band selection
  const selStart = useRef<{ x: number; y: number } | null>(null);
  const selBoxRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const [selBox, setSelBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Space-bar pan mode
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !(e.target as HTMLElement).isContentEditable &&
        (e.target as HTMLElement).tagName !== 'INPUT' &&
        (e.target as HTMLElement).tagName !== 'TEXTAREA' &&
        (e.target as HTMLElement).tagName !== 'SELECT'
      ) {
        e.preventDefault();
        spaceHeld.current = true;
        if (wrapperRef.current) wrapperRef.current.style.cursor = 'grab';
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceHeld.current = false;
        if (wrapperRef.current) wrapperRef.current.style.cursor = '';
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // Wheel zoom — must be non-passive to call preventDefault
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { scale } = useCanvasStore.getState();
      useCanvasStore.getState().zoomTo(scale * (e.deltaY > 0 ? 0.9 : 1.1), e.clientX, e.clientY);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const isBackground =
        e.target === wrapperRef.current ||
        (e.target as HTMLElement).dataset.grid === '1';

      const tryCapture = (id: number) => {
        try { wrapperRef.current?.setPointerCapture(id); } catch { /* synthetic events have no real pointer id */ }
      };

      if (e.button === 1 || (e.button === 0 && spaceHeld.current)) {
        e.preventDefault();
        isPanning.current = true;
        lastPointer.current = { x: e.clientX, y: e.clientY };
        tryCapture(e.pointerId);
      } else if (e.button === 0 && isBackground) {
        selStart.current = { x: e.clientX, y: e.clientY };
        selBoxRef.current = null;
        tryCapture(e.pointerId);
      }
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isPanning.current) {
        panBy(e.clientX - lastPointer.current.x, e.clientY - lastPointer.current.y);
        lastPointer.current = { x: e.clientX, y: e.clientY };
        return;
      }
      if (selStart.current) {
        const dx = e.clientX - selStart.current.x;
        const dy = e.clientY - selStart.current.y;
        if (Math.abs(dx) > SEL_THRESHOLD || Math.abs(dy) > SEL_THRESHOLD) {
          const box = {
            x: Math.min(e.clientX, selStart.current.x),
            y: Math.min(e.clientY, selStart.current.y),
            w: Math.abs(dx),
            h: Math.abs(dy),
          };
          selBoxRef.current = box;
          setSelBox(box);
        }
      }
    },
    [panBy]
  );

  const onPointerUp = useCallback(
    (_e: React.PointerEvent<HTMLDivElement>) => {
      isPanning.current = false;

      if (selStart.current) {
        const box = selBoxRef.current;
        if (box) {
          // Rubber-band: find all notes that intersect the selection rect in world space
          const { offsetX, offsetY, scale } = useCanvasStore.getState();
          const topLeft = screenToWorld(box.x, box.y, offsetX, offsetY, scale);
          const bottomRight = screenToWorld(box.x + box.w, box.y + box.h, offsetX, offsetY, scale);
          const { notes } = useBoardStore.getState();
          const ids = Object.values(notes)
            .filter(
              (n) =>
                n.x < bottomRight.x &&
                n.x + n.width > topLeft.x &&
                n.y < bottomRight.y &&
                n.y + n.height > topLeft.y
            )
            .map((n) => n.id);
          if (ids.length > 0) {
            setMultiSelection(ids);
          } else {
            clearSelection();
          }
          selBoxRef.current = null;
          setSelBox(null);
        } else {
          // Plain click on background — clear everything
          clearSelection();
        }
        selStart.current = null;
      }
    },
    [clearSelection, setMultiSelection]
  );

  const onDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const isBackground =
        e.target === wrapperRef.current ||
        (e.target as HTMLElement).dataset.grid === '1';
      if (!isBackground) return;

      const { offsetX, offsetY, scale, maxZIndex } = {
        ...useCanvasStore.getState(),
        maxZIndex: useBoardStore.getState().maxZIndex,
      };
      const world = screenToWorld(e.clientX, e.clientY, offsetX, offsetY, scale);
      addNote({
        id: crypto.randomUUID(),
        x: world.x - 120,
        y: world.y - 80,
        width: 240,
        height: 160,
        content: '<p></p>',
        backgroundColor: '#fef9c3',
        fontFamily: 'Inter',
        zIndex: maxZIndex + 1,
        hasDivider: false,
        dividerPosition: 50,
      });
    },
    [addNote]
  );

  const sortedNotes = Object.values(notes).sort((a, b) => a.zIndex - b.zIndex);
  const sortedArrows = Object.values(arrows).sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full overflow-hidden relative bg-slate-50"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={onDoubleClick}
    >
      {/* Dot grid — pointer-events: none so clicks pass through */}
      <div data-grid="1" className="absolute inset-0 pointer-events-none">
        <CanvasGrid offsetX={offsetX} offsetY={offsetY} scale={scale} />
      </div>

      {/* World — everything inside is in canvas coordinate space */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transformOrigin: '0 0',
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
          willChange: 'transform',
        }}
      >
        {sortedArrows.map((arrow) => (
          <Arrow key={arrow.id} arrow={arrow} />
        ))}
        {sortedNotes.map((note) => (
          <StickyNote key={note.id} note={note} canvasScale={scale} snapToGrid={snapToGrid} />
        ))}
      </div>

      {/* Rubber-band selection rect (screen space) */}
      {selBox && (
        <div
          style={{
            position: 'absolute',
            left: selBox.x,
            top: selBox.y,
            width: selBox.w,
            height: selBox.h,
            border: '1.5px dashed #3b82f6',
            backgroundColor: 'rgba(59,130,246,0.07)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
      )}
    </div>
  );
}
