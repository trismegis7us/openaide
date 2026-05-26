# openaide

**Manage AI agent workspaces using git worktrees, tmux, and opencode.**

[![npm version](https://img.shields.io/npm/v/@trismegis7us/openaide)](https://www.npmjs.com/package/@trismegis7us/openaide)
[![license](https://img.shields.io/npm/l/@trismegis7us/openaide)](LICENSE)
[![node](https://img.shields.io/node/v/@trismegis7us/openaide)](package.json)

`openaide` wires together a **git worktree**, a **tmux session**, and an **opencode AI agent** into a fully isolated coding workspace — all from a single command. Each workspace lives in its own branch and directory, so multiple agents can work on different tasks in parallel without stepping on each other.

---

## Prerequisites

The following must be installed and available on your `PATH`:

- [git](https://git-scm.com/) — for worktree management
- [tmux](https://github.com/tmux/tmux/wiki) — for session management
- [opencode](https://opencode.ai) — the AI coding agent

---

## Installation

```sh
npm install -g @trismegis7us/openaide
```

---

## How it works

1. **Git worktree** — a new branch and working directory are created at `../.openaide/worktrees/<name>`, fully isolated from your main checkout.
2. **tmux session** — a new tmux session named `<name>` is started, with its working directory set to the worktree.
3. **opencode agent** — the agent is launched inside the tmux session, seeded with the contents of your spec file or inline prompt.

---

## CLI Reference

### create [options] [name]

Create a new workspace which includes a git worktree and a coding agent.

- `-s, --spec-file <specFile>` — Markdown spec file to launch the workspace with.
- `-p, --prompt <prompt>` — Prompt to launch the workspace with.
- `-v, --verbose` — Enable verbose logging.

### delete [options] [workspaces...]

Delete a workspace (worktree, branch, and tmux session).

- `-v, --verbose` — Enable verbose logging.

### list [options]

List all active workspaces.

- `--json` — Format output as JSON.

### spec [options] [command]

Manage spec files, dependency chains, priorities, and more.


#### run [options] [specFiles...]

Runs the create command with the given spec file.


#### ready [options]

List all specs that are ready to be worked on.

- `-s, --spec-files <specFiles...>` — Markdown spec files to analyze. Default is all.
- `--json` — Output as JSON
