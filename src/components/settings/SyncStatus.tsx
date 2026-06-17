import { Cloud, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { SyncStatus as SyncStatusType } from '../../hooks/useGitHubSync';

interface Props {
  status: SyncStatusType;
  lastSaved: Date | null;
  onManualSave: () => void;
}

export default function SyncStatus({ status, lastSaved, onManualSave }: Props) {
  const iconClass = 'w-3.5 h-3.5';

  const content = {
    idle: (
      <>
        <Cloud className={iconClass} />
        {lastSaved && (
          <span>Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        )}
      </>
    ),
    loading: (
      <>
        <Loader2 className={`${iconClass} animate-spin`} />
        <span>Loading…</span>
      </>
    ),
    saving: (
      <>
        <Loader2 className={`${iconClass} animate-spin`} />
        <span>Saving…</span>
      </>
    ),
    saved: (
      <>
        <CheckCircle2 className={`${iconClass} text-green-500`} />
        <span className="text-green-700">Saved</span>
      </>
    ),
    error: (
      <>
        <AlertCircle className={`${iconClass} text-red-500`} />
        <span className="text-red-700">Sync error</span>
      </>
    ),
  };

  return (
    <button
      onClick={onManualSave}
      title="Click to save now"
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded hover:bg-gray-100"
    >
      {content[status]}
    </button>
  );
}
