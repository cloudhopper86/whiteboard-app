export function screenToWorld(
  screenX: number,
  screenY: number,
  offsetX: number,
  offsetY: number,
  scale: number
): { x: number; y: number } {
  return {
    x: (screenX - offsetX) / scale,
    y: (screenY - offsetY) / scale,
  };
}
