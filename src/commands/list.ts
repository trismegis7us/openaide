import { listWorkspaces, getWorktreesDir } from '../domain/workspace.js';

/**
 * Action handler for the `list` command.
 *
 * @param {{ shell: object, fs: object }} services - Injected services.
 */
export function listCommand(options, { shell, fs }) {
  const { json } = options;
  const worktreesDir = getWorktreesDir();
  const workspaces = listWorkspaces(worktreesDir, { shell, fs });

  if (workspaces.length === 0) {
    process.stderr.write('No active workspaces.');
    return;
  }

  // If the user requests JSON
  if (json) {
    // Write JSON to stdout and return
    for (let workspace of workspaces) {
      process.stdout.write(JSON.stringify(workspace) + '\n');
    }
  }
  else {
    const lines = workspaces.map(
      ({ name, path, created }) =>
        `Name: ${name}\nWorkspace path: ${path}\nCreated: ${created}`,
    );
    console.log(lines.join('\n\n'));
  }
}
