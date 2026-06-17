import { Octokit } from '@octokit/rest';
import type { BoardState, GitHubSettings } from '../types';

function makeClient(pat: string) {
  return new Octokit({ auth: pat });
}

export async function loadBoard(settings: GitHubSettings): Promise<BoardState | null> {
  const octokit = makeClient(settings.pat);
  try {
    const res = await octokit.repos.getContent({
      owner: settings.owner,
      repo: settings.repo,
      path: settings.filePath,
    });
    const data = res.data as { content: string };
    const json = atob(data.content.replace(/\n/g, ''));
    return JSON.parse(json) as BoardState;
  } catch (err: unknown) {
    // 404 means the file doesn't exist yet — that's fine for first run
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

export async function saveBoard(
  settings: GitHubSettings,
  state: BoardState
): Promise<void> {
  const octokit = makeClient(settings.pat);
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(state, null, 2))));

  // Fetch current SHA so we can update (not overwrite) the file
  let sha: string | undefined;
  try {
    const res = await octokit.repos.getContent({
      owner: settings.owner,
      repo: settings.repo,
      path: settings.filePath,
    });
    sha = (res.data as { sha: string }).sha;
  } catch {
    // File doesn't exist yet — create it
  }

  await octokit.repos.createOrUpdateFileContents({
    owner: settings.owner,
    repo: settings.repo,
    path: settings.filePath,
    message: `chore: autosave board [${new Date().toISOString()}]`,
    content,
    sha,
  });
}
