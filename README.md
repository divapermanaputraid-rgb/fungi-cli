<p align="center">
  <img src="./assets/needle-hero.png" alt="Needle - terminal-first AI coding agent" width="100%" />
</p>

<p align="center">
  <strong>A terminal-first AI coding agent that threads through your codebase.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/needle-ai"><img src="https://img.shields.io/npm/v/needle-ai?style=flat-square&color=4F7CFF" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/needle-ai"><img src="https://img.shields.io/npm/dm/needle-ai?style=flat-square&color=36E4C6" alt="npm downloads" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-7C5CFF?style=flat-square" alt="license" /></a>
  <img src="https://img.shields.io/badge/terminal-first-D7E2FF?style=flat-square&color=172033" alt="terminal first" />
  <img src="https://img.shields.io/badge/provider-agnostic-36E4C6?style=flat-square" alt="provider agnostic" />
</p>

<p align="center">
  <a href="#install">Install</a>
  ·
  <a href="#quickstart">Quickstart</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#how-it-works">How it works</a>
  ·
  <a href="#roadmap">Roadmap</a>
</p>

---

## What is Needle?

**Needle** is an open-source AI coding CLI built for developers who prefer working from the terminal.

It helps you inspect a codebase, plan changes, patch files, reflect on previous sessions, and keep project memory close to the repo. Needle is designed to feel like a focused coding partner, not a heavy IDE replacement.

```bash
needle
```

```txt
> scan repo
✓ mapped project context
✓ planned next change
✓ patched files
✓ updated memory
```

Needle is still early, but the direction is clear: a lightweight, provider-agnostic coding agent that can grow with your workflow.

## Why Needle?

Most AI coding tools are either locked inside an editor, tied to one model provider, or too heavy for quick terminal work.

Needle focuses on a smaller surface area:

* terminal-first interaction
* clean project context
* provider-agnostic model routing
* local project memory
* safe, reviewable code changes
* simple commands that fit into existing developer workflows

The goal is not to replace your editor. The goal is to make your terminal smarter.

## Install

> Package name may change while the project is early. Replace `needle-ai` with the actual npm package name before publishing.

```bash
npm install -g needle-ai
```

Or run locally from source:

```bash
git clone https://github.com/YOUR_USERNAME/needle.git
cd needle
npm install
npm run build
npm link
```

Then run:

```bash
needle --help
```

## Quickstart

Initialize Needle inside a project:

```bash
cd your-project
needle init
```

Ask Needle to inspect the repo:

```bash
needle scan
```

Start an interactive coding session:

```bash
needle chat
```

Reflect on previous sessions and update project memory:

```bash
needle reflect
```

Run with a specific provider or profile:

```bash
needle --provider openrouter
needle --profile fast
needle --profile deep
```

## Features

### Terminal-first AI coding

Needle is built around the CLI, so it works naturally with your existing shell, git workflow, editor, and project structure.

### Project-aware context

Needle can inspect your repo structure and use project files as context before suggesting or applying changes.

### Provider-agnostic routing

Needle is designed to work with multiple model providers instead of being locked into one. The long-term goal is to make switching providers simple and predictable.

```bash
needle --provider openrouter
needle --provider 9router
needle --provider local
```

### Local project memory

Needle can maintain a lightweight `MEMORY.md` inside your project so important decisions, patterns, and prior work are not lost between sessions.

### Safer patch workflow

Needle should help generate changes that are reviewable, understandable, and easy to accept or reject.

### Reflection mode

Reflection helps summarize previous coding sessions into useful project memory, keeping context compact and reusable.

## Example workflow

```bash
# 1. Open your project
cd apps/api

# 2. Ask Needle to inspect the codebase
needle scan

# 3. Start working with the agent
needle chat

# 4. Review generated changes
git diff

# 5. Update project memory
needle reflect
```

## How it works

```txt
┌──────────────┐
│   Terminal   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Needle CLI   │
└──────┬───────┘
       │
       ├── scans project context
       ├── builds compact prompts
       ├── routes to selected provider
       ├── proposes file changes
       └── updates project memory
       │
       ▼
┌──────────────┐
│ Codebase     │
└──────────────┘
```

Needle keeps the workflow simple:

1. Read the project context.
2. Ask the selected model for a plan or patch.
3. Show the result in the terminal.
4. Let the developer review the change.
5. Save useful session knowledge into project memory.

## Configuration

Create a Needle config file:

```bash
needle init
```

Example configuration:

```json
{
  "provider": "openrouter",
  "profile": "fast",
  "memory": {
    "enabled": true,
    "path": "MEMORY.md"
  },
  "safety": {
    "requireReview": true,
    "redactSecrets": true
  }
}
```

Environment variables:

```bash
OPENROUTER_API_KEY="your_api_key"
NINE_ROUTER_API_KEY="your_api_key"
```

## Commands

| Command          | Description                                           |
| ---------------- | ----------------------------------------------------- |
| `needle init`    | Create a basic Needle config for the current project. |
| `needle scan`    | Inspect the project structure and summarize context.  |
| `needle chat`    | Start an interactive coding session.                  |
| `needle reflect` | Summarize recent sessions into project memory.        |
| `needle config`  | View or update local configuration.                   |
| `needle --help`  | Show available commands and options.                  |

## Use cases

Needle is useful for:

* exploring unfamiliar repositories
* generating small patches
* refactoring focused parts of a codebase
* documenting project decisions
* turning coding sessions into reusable memory
* experimenting with different AI providers
* building a terminal-first AI engineering workflow

## Design principles

### Small surface area

Needle should be easy to understand, easy to run, and easy to remove from a project.

### Review before trust

AI-generated code should be reviewable. Needle should help developers move faster without hiding what changed.

### Provider freedom

Developers should be able to choose the model provider that fits their budget, speed, and quality needs.

### Local-first project context

Project memory should live close to the codebase, not disappear inside a closed platform.

### Boring when possible

Needle should prefer simple files, simple commands, and predictable behavior over magic.

## Roadmap

* [ ] Stable CLI command structure
* [ ] Provider routing profiles
* [ ] Project scanning and context packing
* [ ] Safer patch generation
* [ ] Local `MEMORY.md` reflection
* [ ] Session history
* [ ] Git-aware review flow
* [ ] Cost and usage tracking
* [ ] Multi-provider fallback
* [ ] Plugin hooks for custom workflows
* [ ] Better terminal UI
* [ ] npm package release

## Project status

Needle is currently an early-stage open-source project.

Expect rough edges, breaking changes, and fast iteration. The core idea is being shaped in public: a terminal-first AI coding agent that stays lightweight, practical, and developer-owned.

## Contributing

Contributions are welcome.

Good first areas:

* improve CLI UX
* add provider adapters
* improve context scanning
* write tests
* improve docs
* test Needle on real projects
* report confusing behavior

Before opening a large PR, please create an issue or discussion first so the direction stays aligned.

## Development

Clone the repo:

```bash
git clone https://github.com/YOUR_USERNAME/needle.git
cd needle
```

Install dependencies:

```bash
npm install
```

Run in development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Branding assets

Recommended asset structure:

```txt
assets/
  needle-icon.png
  needle-wordmark.png
  needle-hero.png
```

Use the hero image at the top of this README:

```md
<p align="center">
  <img src="./assets/needle-hero.png" alt="Needle - terminal-first AI coding agent" width="100%" />
</p>
```

## License

MIT License.

See [`LICENSE`](./LICENSE) for details.

