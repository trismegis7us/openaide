import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { listWorkspaces } from './workspace.js';

const makeDir = (name) => ({ name, isDirectory: () => true });
const makeFile = (name) => ({ name, isDirectory: () => false });

describe('listWorkspaces', () => {
  it('returns [] when worktrees dir does not exist', () => {
    const fs = { exists: () => false, readdir: () => { throw new Error('should not be called'); } };
    const shell = { spawn: () => { throw new Error('should not be called'); } };

    assert.deepEqual(listWorkspaces('/some/worktrees', { shell, fs }), []);
  });

  it('returns [] when dir is empty', () => {
    const fs = { exists: () => true, readdir: () => [] };
    const shell = { spawn: () => { throw new Error('should not be called'); } };

    assert.deepEqual(listWorkspaces('/some/worktrees', { shell, fs }), []);
  });

  it('excludes non-directory entries', () => {
    const fs = { exists: () => true, readdir: () => [makeFile('some-file')] };
    const shell = { spawn: () => { throw new Error('should not be called'); } };

    assert.deepEqual(listWorkspaces('/some/worktrees', { shell, fs }), []);
  });

  it('excludes workspaces with no tmux session', () => {
    const fs = { exists: () => true, readdir: () => [makeDir('my-feature')] };
    // has-session returns non-zero → session does not exist
    const shell = { spawn: () => ({ status: 1, stdout: Buffer.from('') }) };

    assert.deepEqual(listWorkspaces('/some/worktrees', { shell, fs }), []);
  });

  it('includes workspace with active tmux session and parses timestamp', () => {
    const fs = { exists: () => true, readdir: () => [makeDir('my-feature')] };
    const calls = [];
    const shell = {
      spawn: (cmd, args) => {
        calls.push(args);
        if (args[0] === 'has-session') return { status: 0 };
        // display-message
        return { status: 0, stdout: Buffer.from('1745747525\n') };
      },
    };

    const result = listWorkspaces('/some/worktrees', { shell, fs });

    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'my-feature');
    assert.equal(result[0].path, '/some/worktrees/my-feature');
    assert.equal(result[0].created, new Date(1745747525 * 1000).toISOString());
  });

  it('handles multiple workspaces, only includes those with sessions', () => {
    const fs = {
      exists: () => true,
      readdir: () => [makeDir('alpha'), makeDir('beta'), makeDir('gamma')],
    };
    // alpha: has session; beta: no session; gamma: has session
    const shell = {
      spawn: (cmd, args) => {
        if (args[0] === 'has-session') {
          const session = args[2];
          return { status: session !== 'beta' ? 0 : 1 };
        }
        // display-message — return distinct timestamps per session
        const session = args[3];
        const ts = session === 'alpha' ? 1745700000 : 1745800000;
        return { status: 0, stdout: Buffer.from(`${ts}\n`) };
      },
    };

    const result = listWorkspaces('/some/worktrees', { shell, fs });

    assert.equal(result.length, 2);
    assert.equal(result[0].name, 'alpha');
    assert.equal(result[1].name, 'gamma');
    assert.equal(result[0].created, new Date(1745700000 * 1000).toISOString());
    assert.equal(result[1].created, new Date(1745800000 * 1000).toISOString());
  });
});
