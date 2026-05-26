import { getWorkspace, createGitWorktree } from '../domain/git.js';
import { createTmuxSession } from '../domain/tmux.js';
import { runOpencode } from '../domain/opencode.js';
import { createLogger } from '../utils/logger.js';

/**
 * Action handler for the `create` command.
 *
 * @param {string|undefined} name - Workspace name argument.
 * @param {{ specFile?: string, prompt?: string, verbose?: boolean }} options
 * @param {{ shell: object, fs: object }} services - Injected services.
 */
export function createCommand(name, options, { shell, fs }) {
  const { specFile, prompt, verbose } = options;
  const logger = createLogger(verbose);

  const [workspaceName, workspacePath] = getWorkspace(name, specFile, { fs });
  logger.info('Workspace name:', workspaceName);
  logger.info('Workspace path:', workspacePath);

  createGitWorktree(workspacePath, { fs, shell, logger });
  createTmuxSession(workspaceName, workspacePath, { shell, logger });
  runOpencode(workspaceName, specFile, prompt, { fs, shell });
}
