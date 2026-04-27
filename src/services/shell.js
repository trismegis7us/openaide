import { spawnSync } from 'child_process';

/**
 * Spawns a process synchronously.
 * @param {string} command
 * @param {string[]} args
 * @param {import('child_process').SpawnSyncOptions} [options]
 * @returns {import('child_process').SpawnSyncReturns<Buffer>}
 */
export function spawn(command, args, options) {
  return spawnSync(command, args, options);
}
