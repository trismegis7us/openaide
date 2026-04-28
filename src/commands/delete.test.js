import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'path';
import { deleteCommand } from './delete.js';

const baseOptions = { verbose: false };

function makeShell({ tmuxExists = true, worktreeStatus = 0, branchStatus = 0 } = {}) {
  const calls = [];
  return {
    calls,
    spawn: (cmd, args, opts) => {
      calls.push([cmd, args, opts]);
      if (cmd === 'tmux' && args[0] === 'has-session') return { status: tmuxExists ? 0 : 1 };
      if (cmd === 'git' && args[0] === 'worktree' && args[1] === 'remove') return { status: worktreeStatus };
      if (cmd === 'git' && args[0] === 'branch') return { status: branchStatus };
      return { status: 0 };
    },
  };
}

const fs = { exists: () => false };

describe('deleteCommand', () => {
  it('kills tmux session, removes worktree, and deletes branch on happy path', () => {
    const shell = makeShell();
    const expectedPath = resolve(process.cwd(), '../.openaide/worktrees/my-workspace');

    deleteCommand('my-workspace', baseOptions, { shell, fs });

    const killCall = shell.calls.find(([cmd, args]) => cmd === 'tmux' && args[0] === 'kill-session');
    assert.ok(killCall, 'expected tmux kill-session to be called');
    assert.equal(killCall[1][2], 'my-workspace');

    const worktreeCall = shell.calls.find(([cmd, args]) => cmd === 'git' && args[0] === 'worktree');
    assert.ok(worktreeCall, 'expected git worktree remove to be called');
    assert.equal(worktreeCall[1][1], 'remove');
    assert.equal(worktreeCall[1][2], expectedPath);

    const branchCall = shell.calls.find(([cmd, args]) => cmd === 'git' && args[0] === 'branch');
    assert.ok(branchCall, 'expected git branch -d to be called');
    assert.equal(branchCall[1][1], '-d');
    assert.equal(branchCall[1][2], 'my-workspace');
  });

  it('skips tmux kill-session when session does not exist', () => {
    const shell = makeShell({ tmuxExists: false });

    deleteCommand('my-workspace', baseOptions, { shell, fs });

    const killCall = shell.calls.find(([cmd, args]) => cmd === 'tmux' && args[0] === 'kill-session');
    assert.equal(killCall, undefined, 'expected tmux kill-session NOT to be called');

    // worktree and branch should still be cleaned up
    const worktreeCall = shell.calls.find(([cmd, args]) => cmd === 'git' && args[0] === 'worktree');
    assert.ok(worktreeCall, 'expected git worktree remove to be called');

    const branchCall = shell.calls.find(([cmd, args]) => cmd === 'git' && args[0] === 'branch');
    assert.ok(branchCall, 'expected git branch -d to be called');
  });

  it('throws when git worktree remove fails (dirty worktree)', () => {
    const shell = makeShell({ worktreeStatus: 1 });

    assert.throws(
      () => deleteCommand('my-workspace', baseOptions, { shell, fs }),
      /Failed to remove git worktree/
    );

    // branch delete should NOT be attempted after worktree failure
    const branchCall = shell.calls.find(([cmd, args]) => cmd === 'git' && args[0] === 'branch');
    assert.equal(branchCall, undefined, 'expected git branch -d NOT to be called after worktree error');
  });

  it('throws when git branch -d fails (unmerged branch)', () => {
    const shell = makeShell({ branchStatus: 1 });

    assert.throws(
      () => deleteCommand('my-workspace', baseOptions, { shell, fs }),
      /Failed to delete git branch/
    );
  });
});
