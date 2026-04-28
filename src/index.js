import { Command, Option } from 'commander';
import * as shell from './services/shell.js';
import * as fs from './services/fs.js';
import { createCommand } from './commands/create.js';
import { deleteCommand } from './commands/delete.js';

const services = { shell, fs };

export function createProgram() {
  const program = new Command();

  program
    .name('openaide')
    .description('Create and manage AI coding agent workspaces');

  program
    .command('create')
    .description('Create a new workspace which includes a git worktree and a coding agent.')
    .argument('[name]', 'Workspace name. If omitted, the spec file name will be used instead.')
    .option('-s, --spec-file <specFile>', 'Markdown spec file to launch the workspace with.')
    .addOption(
      new Option('-p, --prompt <prompt>', 'Prompt to launch the workspace with.')
        .conflicts('specFile')
    )
    .option('-v, --verbose', 'Enable verbose logging.')
    .action((name, options) => createCommand(name, options, services));

  program
    .command('delete')
    .description('Delete a workspace (worktree, branch, and tmux session).')
    .argument('<name>', 'Workspace name to delete.')
    .option('-v, --verbose', 'Enable verbose logging.')
    .action((name, options) => deleteCommand(name, options, services));

  return program;
}
