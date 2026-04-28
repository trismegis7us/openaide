import { join, resolve } from 'path';
import { tmuxSessionExists } from './tmux.js';

const GIT_WORKTREE_BASE_PATH = join('..', '.openaide', 'worktrees');

/**
 * Returns the absolute path to the worktrees directory.
 *
 * @returns {string}
 */
export function getWorktreesDir() {
  return resolve(process.cwd(), GIT_WORKTREE_BASE_PATH);
}

/**
 * Lists all active workspaces — those that exist as worktree directories
 * AND have a live tmux session.
 *
 * @param {string} worktreesDir - Absolute path to the worktrees directory.
 * @param {{ shell: object, fs: object }} services - Injected services.
 * @returns {Array<{ name: string, path: string, created: string }>}
 */
export function listWorkspaces(worktreesDir, { shell, fs }) {
  if (!fs.exists(worktreesDir)) {
    return [];
  }

  const entries = fs.readdir(worktreesDir).filter((e) => e.isDirectory());
  const workspaces = [];

  for (const entry of entries) {
    const name = entry.name;

    if (!tmuxSessionExists(name, { shell })) {
      continue;
    }

    const result = shell.spawn('tmux', [
      'display-message', '-p', '-t', name, '#{session_created}',
    ]);
    const timestamp = parseInt(result.stdout?.toString().trim(), 10);
    const created = new Date(timestamp * 1000).toISOString();
    const path = join(worktreesDir, name);

    workspaces.push({ name, path, created });
  }

  return workspaces;
}
