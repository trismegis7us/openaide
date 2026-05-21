import path from 'path';

const DEFAULT_MODEL = 'github-copilot/claude-sonnet-4.6';
const DEFAULT_AGENT = 'plan';

/**
 * Launches opencode inside the named tmux session.
 *
 * Modes (in priority order):
 *  1. specFile  — reads the file and passes contents as --prompt, using the plan agent.
 *  2. prompt    — passes the inline text as --prompt.
 *  3. neither   — launches opencode interactively with no arguments.
 *
 * @param {string} workspaceName - Tmux session name to send keys to.
 * @param {string|undefined} specFilePath - Path to the spec file.
 * @param {string|undefined} prompt - Inline prompt text.
 * @param {{ spawn: (cmd: string, args: string[], opts?: object) => void }} shell
 */
export function runOpencode(workspaceName, specFilePath, prompt, { shell }) {
  let cmd;

  if (specFilePath) {
    const fileName = path.parse(specFilePath).name;
    const relativeTmuxSpecFilePath = path.join('..', '..', specFilePath);
    cmd = `opencode run --title ${fileName} --file ${relativeTmuxSpecFilePath} --model ${DEFAULT_MODEL} --agent ${DEFAULT_AGENT}`;
    shell.spawn('tmux', ['send-keys', '-t', workspaceName, cmd, 'C-m']);
  } else if (prompt) {
    cmd = `opencode --prompt ${JSON.stringify(prompt)}`;
    shell.spawn('tmux', ['send-keys', '-t', workspaceName, cmd, 'C-m']);
  } else {
    shell.spawn('tmux', ['send-keys', '-t', workspaceName, 'opencode', 'C-m']);
  }
}
