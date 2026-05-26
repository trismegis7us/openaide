import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runOpencode } from './opencode.js';

const DEFAULT_MODEL = 'github-copilot/claude-sonnet-4.6';
const DEFAULT_AGENT = 'plan';

describe('runOpencode', () => {
  it('reads specFile and sends tmux command with --model and --agent flags', () => {
    const calls = [];
    const fs = {
      readFile: () => 'build the feature',
      writeTempFile: () => '/tmp/openaide-abc123.md',
    };
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
    assert.ok(args[3].includes('$(cat /tmp/openaide-abc123.md)'));
    assert.ok(!args[3].includes(JSON.stringify('build the feature')));
    assert.equal(args[4], 'C-m');
  });

  it('writes spec with markdown code fences to tmp file and references it in command', () => {
    const specContent = [
      '# Create `openaide delete <name>` command',
      '- Allow user to delete their worktree, branch, and tmux session.',
      '- If git branch is not mergable (dirty or unmerged) exit with error.',
      '',
      '## Key shell commands',
      '```sh',
      'git worktree remove <name>',
      'git branch -d <name>',
      'tmux kill-session -t <name>',
      '```',
    ].join('\n');

    const writtenFiles = [];
    const calls = [];
    const fs = {
      readFile: () => specContent,
      writeTempFile: (content) => {
        writtenFiles.push(content);
        return '/tmp/openaide-delete-workspace.md';
      },
    };
    const shell = { spawn: (...args) => calls.push(args) };

    runOpencode('delete-workspace', 'delete-workspace.md', undefined, { fs, shell });

    assert.equal(writtenFiles.length, 1);
    assert.equal(writtenFiles[0], specContent);

    assert.equal(calls.length, 1);
    const [, args] = calls[0];
    assert.ok(args[3].includes('$(cat /tmp/openaide-delete-workspace.md)'));
    assert.ok(!args[3].includes('```'));
    assert.ok(!args[3].includes(JSON.stringify(specContent)));
    assert.ok(args[3].includes('--model ' + DEFAULT_MODEL));
    assert.ok(args[3].includes('--agent ' + DEFAULT_AGENT));
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
