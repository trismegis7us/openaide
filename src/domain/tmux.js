/**
 * Returns true if a tmux session with the given name currently exists.
 *
 * @param {string} session
 * @param {{ spawn: (cmd: string, args: string[], opts?: object) => import('child_process').SpawnSyncReturns<Buffer> }} shell
 * @returns {boolean}
 */
export function tmuxSessionExists(session, { shell }) {
  const result = shell.spawn('tmux', ['has-session', '-t', session], { stdio: 'ignore' });
  return result.status === 0;
}

/**
 * Creates a detached tmux session if one does not already exist.
 *
 * @param {string} session - Session name.
 * @param {string} path - Working directory for the session.
 * @param {{ spawn: (cmd: string, args: string[], opts?: object) => import('child_process').SpawnSyncReturns<Buffer> }} shell
 * @param {{ info: (...args: any[]) => void }} logger
 */
export function createTmuxSession(session, path, { shell, logger }) {
  logger.info('Creating tmux session:', session);

  if (tmuxSessionExists(session, { shell })) {
    logger.info(`Tmux session "${session}" already exists, skipping.`);
    return;
  }

  shell.spawn('tmux', ['new-session', '-d', '-s', session, '-c', path]);
  logger.info('Tmux session created.');
}
