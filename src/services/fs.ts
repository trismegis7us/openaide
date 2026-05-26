import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

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

/**
 * Returns directory entries for the given path.
 * @param {string} path
 * @returns {import('fs').Dirent[]}
 */
export function readdir(path) {
  return readdirSync(path, { withFileTypes: true });
}

/**
 * Writes content to a temporary file and returns the file path.
 * @param {string} content
 * @returns {string}
 */
export function writeTempFile(content, name) {
  const fileName = `openaide-${name}`;
  const path = join(tmpdir(), fileName);
  writeFileSync(path, content, 'utf8');
  return path;
}
