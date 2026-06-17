const GRID_SIZE = 40;

interface Props {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export default function CanvasGrid({ offsetX, offsetY, scale }: Props) {
  const cellSize = GRID_SIZE * scale;
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(circle, #c4c9d4 1.5px, transparent 1.5px)',
        backgroundSize: `${cellSize}px ${cellSize}px`,
        backgroundPosition: `${offsetX % cellSize}px ${offsetY % cellSize}px`,
      }}
    />
  );
}
