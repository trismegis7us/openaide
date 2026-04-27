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
