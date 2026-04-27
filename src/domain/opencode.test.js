import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runOpencode } from './opencode.js';

const DEFAULT_MODEL = 'github-copilot/claude-sonnet-4.6';
const DEFAULT_AGENT = 'plan';

describe('runOpencode', () => {
  it('reads specFile and sends tmux command with --model and --agent flags', () => {
    const calls = [];
    const fs = { readFile: () => 'build the feature' };
    const shell = { spawn: (...args) => calls.push(args) };

    runOpencode('my-session', 'spec.md', undefined, { fs, shell });

    assert.equal(calls.length, 1);
    const [cmd, args] = calls[0];
    assert.equal(cmd, 'tmux');
    assert.equal(args[0], 'send-keys');
    assert.equal(args[1], '-t');
    assert.equal(args[2], 'my-session');
    assert.ok(args[3].includes('--model ' + DEFAULT_MODEL));
    assert.ok(args[3].includes('--agent ' + DEFAULT_AGENT));
    assert.ok(args[3].includes(JSON.stringify('build the feature')));
    assert.equal(args[4], 'C-m');
  });

  it('sends tmux command with --prompt when only prompt is provided', () => {
    const calls = [];
    const fs = { readFile: () => {} };
    const shell = { spawn: (...args) => calls.push(args) };

    runOpencode('my-session', undefined, 'do something', { fs, shell });

    assert.equal(calls.length, 1);
    const [cmd, args] = calls[0];
    assert.equal(cmd, 'tmux');
    assert.ok(args[3].includes('--prompt'));
    assert.ok(args[3].includes(JSON.stringify('do something')));
    assert.ok(!args[3].includes('--model'));
    assert.ok(!args[3].includes('--agent'));
  });

  it('sends bare opencode command when neither specFile nor prompt is provided', () => {
    const calls = [];
    const fs = { readFile: () => {} };
    const shell = { spawn: (...args) => calls.push(args) };

    runOpencode('my-session', undefined, undefined, { fs, shell });

    assert.equal(calls.length, 1);
    const [cmd, args] = calls[0];
    assert.equal(cmd, 'tmux');
    assert.equal(args[3], 'opencode');
    assert.equal(args[4], 'C-m');
  });
});
