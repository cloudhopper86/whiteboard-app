import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GitHubSettings } from '../types';

interface SettingsStore {
  github: GitHubSettings;
  syncEnabled: boolean;
  autoSaveIntervalMs: number;
  snapToGrid: boolean;

  setGitHub: (settings: Partial<GitHubSettings>) => void;
  setSyncEnabled: (enabled: boolean) => void;
  setSnapToGrid: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      github: {
        pat: '',
        owner: '',
        repo: '',
        filePath: 'board-data.json',
      },
      syncEnabled: false,
      autoSaveIntervalMs: 30_000,
      snapToGrid: false,

      setGitHub: (settings) =>
        set((s) => ({ github: { ...s.github, ...settings } })),

      setSyncEnabled: (syncEnabled) => set({ syncEnabled }),
      setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
    }),
    {
      name: 'whiteboard-settings',
      // Only persist non-sensitive config alongside the PAT.
      // PAT is stored in localStorage by the user's explicit action.
    }
  )
);
