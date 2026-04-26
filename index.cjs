#!/usr/bin/env node

const { execSync } = require('child_process');
const { Command, Option } = require('commander');
const { existsSync } = require('fs');
const { join, resolve } = require('path');

const GIT_WORKTREE_BASE_PATH = join('..', 'aide', 'worktrees');

const program = new Command();

program
  .name('aide')
  .description('Create and manage AI coding agent workspaces')
  .command('create')
  .description('Create a new workspace which includes a git worktree and a coding agent.')
  .argument('[name]', 'Workspace name. If omitted, the spec file name will be used instead.')
  .option('-s, --spec-file <specFile>', 'Markdown spec file to launch the workspace with.')
  .addOption(new Option('-p, --prompt <prompt>', 'Prompt to launch the workspace with. Can be used instead of specFile.').conflicts('specFile'))
  .option('-v, --verbose', 'Enable verbose logging.')
  .action((name, args) => {
    // If name is not provided, ensure spec file is provided.

    const GIT_WORKTREE_PATH = resolve(process.cwd(), GIT_WORKTREE_BASE_PATH, name);

    // Git Worktree
    {
      if (args.verbose) console.info('Creating git worktree at path:', GIT_WORKTREE_PATH);
      // If the git worktree already exists, continue.
      if (existsSync(GIT_WORKTREE_PATH)) {
        if (args.verbose) console.info('Git Worktree already exists.');
      }
      // If the git worktree does not exist, create it.
      else {
        execSync(`git worktree add ${GIT_WORKTREE_PATH}`, {
          stdio: args.verbose ? "inherit" : "ignore", // Only forward stdio output when verbose is true.
        });
      }
    }

    // Tmux
    {
      if (args.verbose) console.info('Creating Tmux session');
      if (tmuxSessionExists(name)) {
        if (args.verbose) console.info('Tmux session already exists.');
      }
      // Create Tmux session
      else {
        execSync(`tmux new-session -d -s ${name} -c ${GIT_WORKTREE_PATH}`);
        // Run opencode in the session
        execSync(`tmux send-keys -t ${name} "opencode" C-m`);
      }

      // Opencode
      {
        // If a spec file is provided
        //  Ensure it exists
        //  Ensure it's a .md file
        //  Copy the spec into the worktree
        //  Run opencode with the spec
        // If a prompt is provided
        //  Run opencode with the prompt
      }
    }
  });


program.parse(process.argv);

function tmuxSessionExists(session) {
  try {
    execSync(`tmux has-session -t ${session}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
