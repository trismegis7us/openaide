import { existsSync, readFileSync } from 'fs';

/**
 * Checks whether a path exists on the filesystem.
 * @param {string} path
 * @returns {boolean}
 */
export function exists(path) {
  return existsSync(path);
}

/**
 * Reads a file and returns its contents as a UTF-8 string.
 * @param {string} path
 * @returns {string}
 */
export function readFile(path) {
  return readFileSync(path, 'utf8');
}
