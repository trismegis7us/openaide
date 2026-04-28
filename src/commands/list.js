import { listWorkspaces, getWorktreesDir } from '../domain/workspace.js';

/**
 * Action handler for the `list` command.
 *
 * @param {{ shell: object, fs: object }} services - Injected services.
 */
export function listCommand({ shell, fs }) {
  const worktreesDir = getWorktreesDir();
  const workspaces = listWorkspaces(worktreesDir, { shell, fs });

  if (workspaces.length === 0) {
    console.log('No active workspaces.');
    return;
  }

  const lines = workspaces.map(
    ({ name, path, created }) =>
      `Name: ${name}\nWorkspace path: ${path}\nCreated: ${created}`,
  );

  console.log(lines.join('\n\n'));
}
