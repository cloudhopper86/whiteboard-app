import { Component, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { preloadAllFonts } from './lib/fonts';
import { useGitHubSync } from './hooks/useGitHubSync';
import { useBoardStore } from './store/boardStore';
import Canvas from './components/canvas/Canvas';
import Toolbar from './components/toolbar/Toolbar';
import SettingsPanel from './components/settings/SettingsPanel';

// ── Error boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-red-50 p-8">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-6 border border-red-200">
            <h2 className="text-red-600 font-semibold text-lg mb-2">Something went wrong</h2>
            <pre className="text-xs text-gray-600 bg-gray-50 rounded p-3 overflow-auto whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              onClick={() => this.setState({ error: null })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Main app ─────────────────────────────────────────────────────────────────
function AppInner() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { status, lastSaved, triggerSave } = useGitHubSync();
  const { deleteNote, deleteArrow, clearSelection } = useBoardStore();

  useEffect(() => {
    preloadAllFonts();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const active = e.target as HTMLElement;
      const isEditing =
        active.isContentEditable ||
        active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.tagName === 'SELECT';

      if (e.key === 'Escape') {
        setSettingsOpen(false);
        clearSelection();
        return;
      }

      if (!isEditing && (e.key === 'Delete' || e.key === 'Backspace')) {
        const { selection, multiSelectedNoteIds } = useBoardStore.getState();
        if (multiSelectedNoteIds.length > 0) {
          multiSelectedNoteIds.forEach((id) => deleteNote(id));
        } else if (selection?.kind === 'note') {
          deleteNote(selection.id);
        } else if (selection?.kind === 'arrow') {
          deleteArrow(selection.id);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteNote, deleteArrow, clearSelection]);

  return (
    <div className="flex flex-col w-full h-full">
      <Toolbar
        onSettingsOpen={() => setSettingsOpen(true)}
        syncStatus={status}
        lastSaved={lastSaved}
        onManualSave={triggerSave}
        canvasRef={canvasRef}
      />

      <div ref={canvasRef} className="flex-1 relative overflow-hidden">
        <Canvas />
      </div>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 text-xs text-gray-400 pointer-events-none select-none">
        <span>Double-click to add note</span>
        <span>·</span>
        <span>Scroll to zoom</span>
        <span>·</span>
        <span>Middle-click or Space+drag to pan</span>
        <span>·</span>
        <span>Del to delete</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
