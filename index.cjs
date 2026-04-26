#!/usr/bin/env node

const { Command, Option } = require('commander');

const program = new Command();

program
  .name('aide')
  .description('Create and manage AI coding agent workspaces')
  .command('create')
  .description('Create a new workspace which includes a git worktree and a coding agent.')
  .argument('[name]', 'Workspace name. If omitted, the spec file name will be used instead.')
  .option('-s, --spec-file <specFile>', 'Markdown spec file to launch the workspace with.')
  .addOption(new Option('-p, --prompt <prompt>', 'Prompt to launch the workspace with. Can be used instead of specFile.').conflicts('specFile'))
  .option('-i, --init-script <initScript>', 'Script to run after workspace creation. Can be used for tasks such as installing dependencies and running servers.')
  .action((name, args) => {
    console.log('Workspace name:', name);
    console.log('Args:', args);
  });


program.parse(process.argv);
