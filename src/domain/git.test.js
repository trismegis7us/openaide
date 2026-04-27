import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'path';
import { getWorkspace, createGitWorktree } from './git.js';

const GIT_WORKTREE_BASE_PATH = '../.openaide/worktrees';

describe('getWorkspace', () => {
  it('throws when neither name nor specFile is provided', () => {
    const fs = { exists: () => true };
    assert.throws(
      () => getWorkspace(undefined, undefined, { fs }),
      { message: 'Either name or specFile must be provided.' }
    );
  });

  it('throws when specFile does not exist', () => {
    const fs = { exists: () => false };
    assert.throws(
      () => getWorkspace(undefined, 'missing.md', { fs }),
      { message: 'Spec file not found.' }
    );
  });

  it('throws when specFile has a non-.md extension', () => {
    const fs = { exists: () => true };
    assert.throws(
      () => getWorkspace(undefined, 'spec.txt', { fs }),
      { message: 'Spec file must be a .md file.' }
    );
  });

  it('returns [name, path] when name is given and no specFile', () => {
    const fs = { exists: () => true };
    const [workspaceName, workspacePath] = getWorkspace('my-workspace', undefined, { fs });
    const expectedPath = resolve(process.cwd(), GIT_WORKTREE_BASE_PATH, 'my-workspace');
    assert.equal(workspaceName, 'my-workspace');
    assert.equal(workspacePath, expectedPath);
  });

  it('derives workspace name from specFile basename when no name given', () => {
    const fs = { exists: () => true };
    const [workspaceName, workspacePath] = getWorkspace(undefined, 'my-spec.md', { fs });
    const expectedPath = resolve(process.cwd(), GIT_WORKTREE_BASE_PATH, 'my-spec');
    assert.equal(workspaceName, 'my-spec');
    assert.equal(workspacePath, expectedPath);
  });

  it('uses explicit name over specFile basename when both are given', () => {
    const fs = { exists: () => true };
    const [workspaceName] = getWorkspace('explicit', 'my-spec.md', { fs });
    assert.equal(workspaceName, 'explicit');
  });
});

describe('createGitWorktree', () => {
  it('skips shell.spawn when path already exists', () => {
    const calls = [];
    const fs = { exists: () => true };
    const shell = { spawn: (...args) => calls.push(args) };
    const logger = { info: () => {} };

    createGitWorktree('/some/path', { fs, shell, logger });

    assert.equal(calls.length, 0);
  });

  it('calls shell.spawn with correct git args when path does not exist', () => {
    const calls = [];
    const fs = { exists: () => false };
    const shell = { spawn: (...args) => calls.push(args) };
    const logger = { info: () => {} };

    createGitWorktree('/some/path', { fs, shell, logger });

    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0], ['git', ['worktree', 'add', '/some/path'], { stdio: 'inherit' }]);
  });
});
