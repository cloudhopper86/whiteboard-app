export interface StickyNote {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string; // Tiptap HTML
  backgroundColor: string;
  fontFamily: string;
  zIndex: number;
  hasDivider: boolean;
  dividerPosition: number; // percentage from top (0–100)
}

export interface Arrow {
  id: string;
  x: number;
  y: number;
  length: number;
  rotation: number; // degrees
  color: string;
  strokeWidth: number;
  headStyle: 'arrow' | 'none';
  zIndex: number;
}

export interface BoardState {
  notes: Record<string, StickyNote>;
  arrows: Record<string, Arrow>;
  version: number;
}

export interface GitHubSettings {
  pat: string;
  owner: string;
  repo: string;
  filePath: string;
}

export type SelectionTarget =
  | { kind: 'note'; id: string }
  | { kind: 'arrow'; id: string }
  | null;
