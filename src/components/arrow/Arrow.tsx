import { useRef } from 'react';
import type { Arrow as ArrowType } from '../../types';
import { useBoardStore } from '../../store/boardStore';
import { useCanvasStore } from '../../store/canvasStore';

interface Props {
  arrow: ArrowType;
}

export default function Arrow({ arrow }: Props) {
  const scale = useCanvasStore((s) => s.scale);
  const { updateArrow, deleteArrow, setSelection, selection, bringToFront } =
    useBoardStore();
  const isSelected = selection?.kind === 'arrow' && selection.id === arrow.id;

  const moveRef = useRef<{
    screenX: number;
    screenY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const rotateRef = useRef<{
    originX: number;
    originY: number;
    startAngle: number;
    startRotation: number;
  } | null>(null);

  const resizeRef = useRef<{
    screenX: number;
    screenY: number;
    startLength: number;
  } | null>(null);

  const handleSelect = (e: React.PointerEvent) => {
    e.stopPropagation();
    setSelection({ kind: 'arrow', id: arrow.id });
    bringToFront('arrow', arrow.id);
  };

  // ── Move ────────────────────────────────────────────────────────────────
  const onMoveDown = (e: React.PointerEvent<SVGGElement>) => {
    handleSelect(e);
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    moveRef.current = {
      screenX: e.clientX,
      screenY: e.clientY,
      startX: arrow.x,
      startY: arrow.y,
    };
  };
  const onMoveMove = (e: React.PointerEvent<SVGGElement>) => {
    if (!moveRef.current) return;
    updateArrow(arrow.id, {
      x: moveRef.current.startX + (e.clientX - moveRef.current.screenX) / scale,
      y: moveRef.current.startY + (e.clientY - moveRef.current.screenY) / scale,
    });
  };
  const onMoveUp = () => { moveRef.current = null; };

  // ── Rotate ──────────────────────────────────────────────────────────────
  const onRotateDown = (e: React.PointerEvent<SVGCircleElement>) => {
    e.stopPropagation();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    // Arrow origin lives at SVG (M, M) due to the translate in the <g> transform
    const M = arrow.length + 50;
    const svgEl = e.currentTarget.ownerSVGElement as SVGSVGElement;
    const pt = svgEl.createSVGPoint();
    pt.x = M;
    pt.y = M;
    const origin = pt.matrixTransform(svgEl.getScreenCTM()!);
    rotateRef.current = {
      originX: origin.x,
      originY: origin.y,
      startAngle:
        Math.atan2(e.clientY - origin.y, e.clientX - origin.x) * (180 / Math.PI),
      startRotation: arrow.rotation,
    };
  };
  const onRotateMove = (e: React.PointerEvent<SVGCircleElement>) => {
    if (!rotateRef.current) return;
    const angle =
      Math.atan2(
        e.clientY - rotateRef.current.originY,
        e.clientX - rotateRef.current.originX
      ) *
      (180 / Math.PI);
    let newRotation =
      rotateRef.current.startRotation + (angle - rotateRef.current.startAngle);
    if (e.ctrlKey) {
      newRotation = Math.round(newRotation / 10) * 10;
    }
    updateArrow(arrow.id, { rotation: newRotation });
  };
  const onRotateUp = () => { rotateRef.current = null; };

  // ── Resize ──────────────────────────────────────────────────────────────
  const onResizeDown = (e: React.PointerEvent<SVGCircleElement>) => {
    e.stopPropagation();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    resizeRef.current = {
      screenX: e.clientX,
      screenY: e.clientY,
      startLength: arrow.length,
    };
  };
  const onResizeMove = (e: React.PointerEvent<SVGCircleElement>) => {
    if (!resizeRef.current) return;
    const rotRad = arrow.rotation * (Math.PI / 180);
    const dx = (e.clientX - resizeRef.current.screenX) / scale;
    const dy = (e.clientY - resizeRef.current.screenY) / scale;
    const projected = dx * Math.cos(rotRad) + dy * Math.sin(rotRad);
    updateArrow(arrow.id, {
      length: Math.max(40, resizeRef.current.startLength + projected),
    });
  };
  const onResizeUp = () => { resizeRef.current = null; };

  const markerId = `arrowhead-${arrow.id}`;
  // Shorten line so it doesn't overlap the arrowhead polygon
  const lineEnd = arrow.headStyle === 'arrow' ? arrow.length - arrow.strokeWidth * 3 : arrow.length;

  // SVG must be large enough that every handle (including the delete button at
  // arrow.length+16 from origin) stays inside the viewport for ANY rotation.
  // margin = arrow.length + 50 guarantees this: at 180° the delete button lands
  // at SVG x = margin − (arrow.length + 16) = 34, safely inside the box.
  const M = arrow.length + 50;
  const svgSize = M * 2 + arrow.length; // = 3 * arrow.length + 100

  return (
    <svg
      style={{
        position: 'absolute',
        left: arrow.x - M,
        top: arrow.y - M,
        width: svgSize,
        height: svgSize,
        zIndex: arrow.zIndex,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={arrow.color} />
        </marker>
      </defs>

      <g
        transform={`translate(${M}, ${M}) rotate(${arrow.rotation})`}
        style={{ pointerEvents: 'all', cursor: 'move' }}
        onPointerDown={onMoveDown}
        onPointerMove={onMoveMove}
        onPointerUp={onMoveUp}
      >
        {/* Wide transparent hit area */}
        <line
          x1={0}
          y1={0}
          x2={arrow.length}
          y2={0}
          stroke="transparent"
          strokeWidth={24}
        />

        {/* Visible arrow line */}
        <line
          x1={0}
          y1={0}
          x2={lineEnd}
          y2={0}
          stroke={arrow.color}
          strokeWidth={arrow.strokeWidth}
          strokeLinecap="round"
          markerEnd={arrow.headStyle === 'arrow' ? `url(#${markerId})` : undefined}
          style={{ pointerEvents: 'none' }}
        />

        {/* Selection decorations */}
        {isSelected && (
          <>
            {/* Origin anchor */}
            <circle
              cx={0}
              cy={0}
              r={5}
              fill="#6366f1"
              style={{ pointerEvents: 'none' }}
            />

            {/* Resize handle at tip */}
            <circle
              cx={arrow.length}
              cy={0}
              r={7}
              fill="white"
              stroke="#6366f1"
              strokeWidth={2}
              style={{ cursor: 'ew-resize', pointerEvents: 'all' }}
              onPointerDown={onResizeDown}
              onPointerMove={onResizeMove}
              onPointerUp={onResizeUp}
            />

            {/* Rotate handle stem */}
            <line
              x1={arrow.length / 2}
              y1={-8}
              x2={arrow.length / 2}
              y2={-28}
              stroke="#6366f1"
              strokeWidth={1}
              strokeDasharray="3 2"
              style={{ pointerEvents: 'none' }}
            />

            {/* Rotate handle */}
            <circle
              cx={arrow.length / 2}
              cy={-34}
              r={7}
              fill="white"
              stroke="#6366f1"
              strokeWidth={2}
              style={{ cursor: 'grab', pointerEvents: 'all' }}
              onPointerDown={onRotateDown}
              onPointerMove={onRotateMove}
              onPointerUp={onRotateUp}
            />

            {/* Rotate icon indicator */}
            <text
              x={arrow.length / 2}
              y={-34}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={8}
              fill="#6366f1"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              ↻
            </text>

            {/* Delete button (appears at tip + offset) */}
            <g
              transform={`translate(${arrow.length + 16}, 0)`}
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onPointerDown={(e) => { e.stopPropagation(); deleteArrow(arrow.id); }}
            >
              <circle cx={0} cy={0} r={10} fill="#fee2e2" stroke="#fca5a5" strokeWidth={1.5} />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fill="#ef4444"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                ✕
              </text>
            </g>
          </>
        )}
      </g>
    </svg>
  );
}

