import { join, resolve, parse } from 'path';

const GIT_WORKTREE_BASE_PATH = join('..', '.openaide', 'worktrees');

/**
 * Resolves the workspace name and absolute path from CLI inputs.
 *
 * @param {string|undefined} name - Explicit workspace name.
 * @param {string|undefined} specFile - Path to the spec file.
 * @param {{ exists: (path: string) => boolean }} fs - Filesystem service.
 * @returns {[string, string]} Tuple of [workspaceName, workspacePath].
 */
export function getWorkspace(name, specFile, { fs }) {
  let workspaceName = name;

  if (!name && !specFile) {
    throw new Error('Either name or specFile must be provided.');
  }

  if (specFile) {
    if (!fs.exists(specFile)) {
      throw new Error('Spec file not found.');
    }

    const parsedSpec = parse(specFile);
    if (parsedSpec.ext !== '.md') {
      throw new Error('Spec file must be a .md file.');
    }

    if (!name) {
      workspaceName = parsedSpec.name;
    }
  }

  const workspacePath = resolve(process.cwd(), GIT_WORKTREE_BASE_PATH, workspaceName);
  return [workspaceName, workspacePath];
}

/**
 * Creates a git worktree at the given path if it does not already exist.
 *
 * @param {string} path - Absolute path for the worktree.
 * @param {{ exists: (path: string) => boolean }} fs - Filesystem service.
 * @param {{ spawn: (cmd: string, args: string[], opts?: object) => void }} shell - Shell service.
 * @param {{ info: (...args: any[]) => void }} logger
 */
export function createGitWorktree(path, { fs, shell, logger }) {
  logger.info('Creating git worktree at path:', path);

  if (fs.exists(path)) {
    logger.info('Git worktree already exists, skipping.');
    return;
  }

  shell.spawn('git', ['worktree', 'add', path], { stdio: 'inherit' });
}

/**
 * Removes a git worktree at the given path.
 * Exits with an error if the worktree is dirty or untracked files are present.
 *
 * @param {string} path - Absolute path of the worktree to remove.
 * @param {{ spawn: (cmd: string, args: string[], opts?: object) => import('child_process').SpawnSyncReturns<Buffer> }} shell
 * @param {{ info: (...args: any[]) => void }} logger
 */
export function removeGitWorktree(path, { shell, logger }) {
  logger.info('Removing git worktree at path:', path);
  const result = shell.spawn('git', ['worktree', 'remove', path], { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`Failed to remove git worktree at "${path}". The worktree may be dirty or have untracked files.`);
  }
  logger.info('Git worktree removed.');
}

/**
 * Deletes a git branch using safe delete (-d).
 * Exits with an error if the branch has unmerged commits.
 *
 * @param {string} name - Branch name to delete.
 * @param {{ spawn: (cmd: string, args: string[], opts?: object) => import('child_process').SpawnSyncReturns<Buffer> }} shell
 * @param {{ info: (...args: any[]) => void }} logger
 */
export function deleteGitBranch(name, { shell, logger }) {
  logger.info('Deleting git branch:', name);
  const result = shell.spawn('git', ['branch', '-d', name], { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`Failed to delete git branch "${name}". The branch may have unmerged commits.`);
  }
  logger.info('Git branch deleted.');
}
