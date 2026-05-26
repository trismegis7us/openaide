#!/usr/bin/env node

import { Command, Option } from 'commander';
import * as shell from './services/shell.js';
import * as fs from './services/fs.js';
import { createCommand } from './commands/create.js';
import { deleteCommand } from './commands/delete.js';
import { listCommand } from './commands/list.js';
import { listDependenciesCommand } from './commands/list-dependencies.ts';

const services = { shell, fs };

let stdinInput: string[] = [];
process.stdin.setEncoding('utf8');
if (!process.stdin.isTTY) {
  let stdin = '';
  for await (const chunk of process.stdin) {
    stdin += chunk;
  }
  stdinInput = stdin
    .trim()
    .split('\n');
}

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
  .argument('[workspaces...]', 'Workspace name to delete.')
  .option('-v, --verbose', 'Enable verbose logging.')
  .action((workspaces, options) =>
    (process.stdin.isTTY ? workspaces : stdinInput)
      .forEach((workspace: string) => deleteCommand(workspace, options, services))
  );

program
  .command('list')
  .description('List all active workspaces.')
  .option('--json', 'Format output as JSON.')
  .action((options) => listCommand(options, services));

const spec = program
  .command('spec')
  .description('Manage spec files, dependency chains, priorities, and more.');

spec
  .command('run')
  .description('Runs the create command with the given spec file.')
  .argument('[specFiles...]', 'The spec file to launch the workspace with.')
  .action((specFiles) =>
    (process.stdin.isTTY ? specFiles : stdinInput)
      .forEach((specFile: string) => createCommand(undefined, { specFile }, services))
  );

spec
  .command('ready')
  .description('List all specs that are ready to be worked on.')
  .option('-s, --spec-files <specFiles...>', 'Markdown spec files to analyze. Default is all.')
  .option("--json", "Output as JSON")
  .action((options) => listDependenciesCommand(options, services));

// Process argv
program.parse(process.argv);
