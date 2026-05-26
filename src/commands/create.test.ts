import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'path';
import { createCommand } from './create.js';

function makeShell() {
  const calls = [];
  return {
    calls,
    spawn: (cmd, args, opts) => {
      calls.push([cmd, args, opts]);
      if (cmd === 'tmux' && args[0] === 'has-session') return { status: 1 };
      return { status: 0 };
    },
  };
}

const fs = { exists: () => false, readFile: () => '' };
const baseOptions = { specFile: undefined, prompt: undefined, verbose: false };

describe('createCommand', () => {
  it('threads workspace path from getWorkspace into createGitWorktree', () => {
    const shell = makeShell();
    const expectedPath = resolve(process.cwd(), '../.openaide/worktrees/my-workspace');

    createCommand('my-workspace', baseOptions, { shell, fs });

    const worktreeCall = shell.calls.find(([cmd, args]) => cmd === 'git' && args[0] === 'worktree');
    assert.ok(worktreeCall, 'expected git worktree add to be called');
    assert.equal(worktreeCall[1][2], expectedPath);
  });

  it('threads workspace name and path into createTmuxSession', () => {
    const shell = makeShell();
    const expectedPath = resolve(process.cwd(), '../.openaide/worktrees/my-workspace');

    createCommand('my-workspace', baseOptions, { shell, fs });

    const newSessionCall = shell.calls.find(([cmd, args]) => cmd === 'tmux' && args[0] === 'new-session');
    assert.ok(newSessionCall, 'expected tmux new-session to be called');
    assert.equal(newSessionCall[1][3], 'my-workspace');
    assert.equal(newSessionCall[1][5], expectedPath);
  });

  it('threads workspace name into runOpencode as the tmux target session', () => {
    const shell = makeShell();

    createCommand('my-workspace', baseOptions, { shell, fs });

    const sendKeysCall = shell.calls.find(([cmd, args]) => cmd === 'tmux' && args[0] === 'send-keys');
    assert.ok(sendKeysCall, 'expected tmux send-keys to be called');
    assert.equal(sendKeysCall[1][2], 'my-workspace');
  });
});
