#!/usr/bin/env node

const { Command, Option } = require('commander');

const program = new Command();

program
  .name('aide')
  .description('Create and manage AI coding agent workspaces')
  .command('create')
  .description('Create a new workspace which includes a git worktree and a coding agent.')
  .option('-n, --name <name>', 'workspace name')
  .option('-s, --spec-file <specFile>', 'markdown spec file')
  .addOption(new Option('-p, --prompt <prompt>', 'prompt to execute on start').conflicts('specFile'))
  .option('-i, --init-script <initScript>', 'script to run after workspace creation')
  .action((args) => {
    console.log('Args:', args);
  });


program.parse(process.argv);
