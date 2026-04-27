# openaide

**Manage AI agent workspaces using git worktrees, tmux, and opencode.**

[![npm version](https://img.shields.io/npm/v/openaide)](https://www.npmjs.com/package/openaide)
[![license](https://img.shields.io/npm/l/openaide)](LICENSE)
[![node](https://img.shields.io/node/v/openaide)](package.json)

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

## Usage

```
openaide <command> [options]
```

### `openaide create [name]`

Creates a new AI coding workspace: a git worktree, a tmux session, and an opencode agent — all scoped to `[name]`.

```
openaide create [name] [options]
```

| Argument / Option | Description |
|---|---|
| `[name]` | Workspace name. Optional if `--spec-file` is provided (name is inferred from the file). |
| `-s, --spec-file <path>` | Path to a Markdown (`.md`) spec file. Its contents are passed to the agent as the initial prompt. |
| `-p, --prompt <text>` | Inline prompt text. Mutually exclusive with `--spec-file`. |
| `-v, --verbose` | Print verbose output for each step. |

**Examples:**

```sh
# Create a workspace from a spec file (name inferred from filename)
openaide create --spec-file ./specs/auth-module.md

# Create a workspace with an inline prompt
openaide create my-feature --prompt "Refactor the user service to use async/await"

# Explicit name + spec file
openaide create oauth --spec-file ./specs/oauth.md --verbose
```

```sh
# Attach to session
# E.g. `tmux attach <name>`
tmux attach my-feature
```

---

## How it works

1. **Git worktree** — a new branch and working directory are created at `../.openaide/worktrees/<name>`, fully isolated from your main checkout.
2. **tmux session** — a new tmux session named `<name>` is started, with its working directory set to the worktree.
3. **opencode agent** — the agent is launched inside the tmux session, seeded with the contents of your spec file or inline prompt.

Re-running `openaide create` with the same name is safe — existing worktrees and tmux sessions are detected and skipped.

---

## Roadmap

- **`openaide list`** — list all active workspaces (worktrees + tmux sessions).
- **`openaide delete <name>`** — tear down a workspace: remove the git worktree and kill the tmux session.
- **Lifecycle hooks** — run user-defined scripts at key points during workspace creation.

---

## License

MIT © [Nilson Nascimento](https://github.com/trismegis7us)
