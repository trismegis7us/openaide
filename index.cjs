#!/usr/bin/env node

const { execSync, spawnSync } = require('child_process');
const { Command, Option } = require('commander');
const { existsSync, readFileSync } = require('fs');
const { join, resolve, parse } = require('path');

const GIT_WORKTREE_BASE_PATH = join('..', '.openaide', 'worktrees');

const program = new Command();

program
  .name('openaide')
  .description('Create and manage AI coding agent workspaces')
  .command('create')
  .description('Create a new workspace which includes a git worktree and a coding agent.')
  .argument('[name]', 'Workspace name. If omitted, the spec file name will be used instead.')
  .option('-s, --spec-file <specFile>', 'Markdown spec file to launch the workspace with.')
  .addOption(new Option('-p, --prompt <prompt>', 'Prompt to launch the workspace with. Can be used instead of specFile.').conflicts('specFile'))
  .option('-v, --verbose', 'Enable verbose logging.')
  .action((name, args) => {
    const [workspaceName, workspacePath] = getWorkspace(name, args.specFile);
    if (args.verbose) console.info('Workspace name:', workspaceName);
    if (args.verbose) console.info('Workspace path:', workspacePath);

    createGitWorktree(workspacePath, args.verbose);
    tmuxCreateSession(workspaceName, workspacePath, args.verbose); 
    runOpencode(workspaceName, args.specFile, args.prompt);
  });

program.parse(process.argv);

function runOpencode(workspaceName, specFile, prompt) {
  // Run opencode in the tmux session
  if (specFile) {
    // Run opencode with the spec
    const spec = readFileSync(specFile, 'utf8');
    const defaultAgent = 'plan';
    const defaultModel = 'github-copilot/claude-sonnet-4.6'

    // Run with plan agent and Sonnet 4.6 model
    const cmd = `opencode --prompt ${JSON.stringify(spec)} --model ${defaultModel} --agent ${defaultAgent}`;

    spawnSync('tmux', [
      'send-keys',
      '-t',
      workspaceName,
      cmd,
      'C-m'
    ]);

  }
  else if (prompt) {
    // Run opencode with the prompt
    const cmd = `opencode --prompt ${JSON.stringify(prompt)}`;

    spawnSync('tmux', [
      'send-keys',
      '-t',
      workspaceName,
      cmd,
      'C-m'
    ]);
  }
  else {
    // Run opencode with no args
    execSync(`tmux send-keys -t ${workspaceName} "opencode" C-m`);
  }
}

function getWorkspace(name, specFile) {
  let workspaceName = name;
  let workspacePath;

  // If no name or specfile is provided throw error
  if (!name && !specFile) {
    throw new Error('Either name or specFile must be provided.')
  }

  if (specFile) {
    // Ensure spec file exists
    if (!existsSync(specFile)) {
      throw new Error('Spec file not found.');
    }

    // Ensure spec file is a .md file
    const parsedSpec = parse(specFile);
    if (parsedSpec.ext !== '.md') {
      throw new Error('Spec file is not a .md file.')
    }

    // If no name is provided, use the spec file name.
    if (!name) {
      workspaceName = parsedSpec.name;
    }
  }

  workspacePath = resolve(process.cwd(), GIT_WORKTREE_BASE_PATH, workspaceName);
  return [workspaceName, workspacePath];
}

function createGitWorktree(path, verbose) {
  if (verbose) console.info('Creating git worktree at path:', path);
  // If the git worktree already exists, continue.
  if (existsSync(path)) {
    if (verbose) console.info('Git Worktree already exists.');
  }
  // If the git worktree does not exist, create it.
  else {
    execSync(`git worktree add ${path}`, {
      stdio: verbose ? "inherit" : "ignore", // Only forward stdio output when verbose is true.
    });
  }
}

function tmuxCreateSession(session, path, verbose) {
  if (verbose) console.info('Creating Tmux session');
  if (tmuxSessionExists(session)) {
    if (verbose) console.info(`Tmux session ${session} already exists.`);
  }
  // Create Tmux session
  else {
    execSync(`tmux new-session -d -s ${session} -c ${path}`);
    if (verbose) console.info('Tmux session created');
  }
}

function tmuxSessionExists(session) {
  try {
    execSync(`tmux has-session -t ${session}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
