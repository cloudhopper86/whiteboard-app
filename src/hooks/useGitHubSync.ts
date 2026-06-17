import { useEffect, useRef, useState } from 'react';
import { loadBoard, saveBoard } from '../lib/github';
import { useBoardStore } from '../store/boardStore';
import { useSettingsStore } from '../store/settingsStore';

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error' | 'loading';

export function useGitHubSync() {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const settings = useSettingsStore((s) => s.github);
  const syncEnabled = useSettingsStore((s) => s.syncEnabled);
  const autoSaveIntervalMs = useSettingsStore((s) => s.autoSaveIntervalMs);
  const hydrate = useBoardStore((s) => s.hydrate);
  const notes = useBoardStore((s) => s.notes);
  const arrows = useBoardStore((s) => s.arrows);

  const isConfigured =
    syncEnabled && settings.pat && settings.owner && settings.repo;

  // Load on mount when configured
  useEffect(() => {
    if (!isConfigured) return;
    setStatus('loading');
    loadBoard(settings)
      .then((board) => {
        if (board) hydrate(board.notes, board.arrows);
        setStatus('idle');
      })
      .catch(() => setStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncEnabled]);

  // Debounced autosave on state change
  useEffect(() => {
    if (!isConfigured) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      triggerSave();
    }, autoSaveIntervalMs);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, arrows, isConfigured]);

  async function triggerSave() {
    if (!isConfigured) return;
    setStatus('saving');
    try {
      await saveBoard(settings, { notes, arrows, version: 1 });
      setStatus('saved');
      setLastSaved(new Date());
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
    }
  }

  return { status, lastSaved, triggerSave };
}
