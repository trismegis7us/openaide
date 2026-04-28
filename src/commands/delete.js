import { getWorkspace, removeGitWorktree, deleteGitBranch } from '../domain/git.js';
import { killTmuxSession } from '../domain/tmux.js';
import { createLogger } from '../utils/logger.js';

/**
 * Action handler for the `delete` command.
 *
 * Deletes the tmux session, git worktree, and git branch for a workspace.
 * Exits with an error if the worktree is dirty or the branch has unmerged commits.
 *
 * @param {string} name - Workspace name argument.
 * @param {{ verbose?: boolean }} options
 * @param {{ shell: object, fs: object }} services - Injected services.
 */
export function deleteCommand(name, options, { shell, fs }) {
  const { verbose } = options;
  const logger = createLogger(verbose);

  const [workspaceName, workspacePath] = getWorkspace(name, null, { fs });
  logger.info('Workspace name:', workspaceName);
  logger.info('Workspace path:', workspacePath);

  killTmuxSession(workspaceName, { shell, logger });
  removeGitWorktree(workspacePath, { shell, logger });
  deleteGitBranch(workspaceName, { shell, logger });
}
