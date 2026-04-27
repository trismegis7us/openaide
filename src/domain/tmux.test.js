import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { tmuxSessionExists, createTmuxSession } from './tmux.js';

describe('tmuxSessionExists', () => {
  it('returns true when spawn returns status 0', () => {
    const shell = { spawn: () => ({ status: 0 }) };
    assert.equal(tmuxSessionExists('my-session', { shell }), true);
  });

  it('returns false when spawn returns non-zero status', () => {
    const shell = { spawn: () => ({ status: 1 }) };
    assert.equal(tmuxSessionExists('my-session', { shell }), false);
  });
});

describe('createTmuxSession', () => {
  it('skips new-session spawn when session already exists', () => {
    const calls = [];
    const shell = { spawn: (...args) => { calls.push(args); return { status: 0 }; } };
    const logger = { info: () => {} };

    createTmuxSession('my-session', '/some/path', { shell, logger });

    // only the has-session check should have been called
    assert.equal(calls.length, 1);
    assert.equal(calls[0][1][0], 'has-session');
  });

  it('calls spawn with correct new-session args when session does not exist', () => {
    const calls = [];
    const shell = { spawn: (...args) => { calls.push(args); return { status: 1 }; } };
    const logger = { info: () => {} };

    createTmuxSession('my-session', '/some/path', { shell, logger });

    assert.equal(calls.length, 2);
    assert.deepEqual(calls[1], ['tmux', ['new-session', '-d', '-s', 'my-session', '-c', '/some/path']]);
  });
});
