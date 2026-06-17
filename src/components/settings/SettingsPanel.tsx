import { useState } from 'react';
import { X, GitBranch, Eye, EyeOff } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ open, onClose }: Props) {
  const { github, syncEnabled, setGitHub, setSyncEnabled } = useSettingsStore();
  const [showPat, setShowPat] = useState(false);
  const [draft, setDraft] = useState(github);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setGitHub(draft);
    setSyncEnabled(!!draft.pat && !!draft.owner && !!draft.repo);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const field =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all';
  const label = 'block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide';

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <GitBranch size={18} />
            <span className="font-semibold text-gray-800">GitHub Sync</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <p className="text-xs text-gray-500 leading-relaxed">
            Your board state will be autosaved to a JSON file in your GitHub repository.
            The Personal Access Token is stored only in your browser's localStorage.
          </p>

          {/* PAT */}
          <div>
            <label className={label}>Personal Access Token</label>
            <div className="relative">
              <input
                type={showPat ? 'text' : 'password'}
                className={field}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={draft.pat}
                onChange={(e) => setDraft((d) => ({ ...d, pat: e.target.value }))}
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                onClick={() => setShowPat((v) => !v)}
              >
                {showPat ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Needs <code className="bg-gray-100 px-1 rounded">repo</code> scope.
            </p>
          </div>

          {/* Owner */}
          <div>
            <label className={label}>GitHub Username / Org</label>
            <input
              type="text"
              className={field}
              placeholder="your-github-username"
              value={draft.owner}
              onChange={(e) => setDraft((d) => ({ ...d, owner: e.target.value }))}
            />
          </div>

          {/* Repo */}
          <div>
            <label className={label}>Repository Name</label>
            <input
              type="text"
              className={field}
              placeholder="my-whiteboard-data"
              value={draft.repo}
              onChange={(e) => setDraft((d) => ({ ...d, repo: e.target.value }))}
            />
          </div>

          {/* File path */}
          <div>
            <label className={label}>File Path in Repo</label>
            <input
              type="text"
              className={field}
              placeholder="board-data.json"
              value={draft.filePath}
              onChange={(e) => setDraft((d) => ({ ...d, filePath: e.target.value }))}
            />
          </div>

          {/* Sync toggle status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Sync enabled</span>
            <div
              className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${
                syncEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => setSyncEnabled(!syncEnabled)}
            >
              <div
                className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                  syncEnabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100">
          <button
            onClick={handleSave}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-colors text-sm"
          >
            {saved ? '✓ Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </>
  );
}
