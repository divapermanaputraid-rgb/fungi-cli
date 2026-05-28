# Agent Brief: Build FungiCode

You are building **FungiCode**, an open-source multi-provider AI coding terminal. The CLI command is `fungi`.

## Product Direction

FungiCode should feel like a modern agentic coding CLI:

- It understands a repository.
- It can plan changes.
- It can edit files.
- It can run shell commands with approval.
- It can review git diffs.
- It stores project memory locally.
- It supports multiple model providers.

## Required Providers for MVP

- 9Router
- OpenAI-compatible adapter
- Gemini
- DeepSeek

## Model Profiles

- `fast`: cheap/quick
- `smart`: strong reasoning
- `coder`: coding
- `planner`: long planning
- `reviewer`: diff review

## Development Rule

Before every sprint, perform the Sprint Lookup Protocol in `docs/SPRINT_LOOKUP_PROTOCOL.md`.

FungiCode is an open-source, multi-provider AI coding CLI inspired by modern agentic coding assistants and terminal-first developer workflows.

Do not copy internal naming, comments, source structure, proprietary prompts, or reference files.

## First Implementation Order

1. Create TypeScript project skeleton.
2. Add CLI command framework.
3. Add config loader.
4. Add provider interfaces.
5. Add provider router.
6. Add session logger.
7. Add context builder.
8. Add tool registry.
9. Add file read/write/edit tools.
10. Add shell tool with permission approval.
11. Add `fungi plan`.
12. Add `fungi code`.
13. Add `fungi review`.
14. Add package safety audit.

## Quality Bar

- Small commits
- TypeScript strict mode
- No secrets in repo
- No reference folder in git
- No sourcemaps in package
- Commands should fail clearly with actionable error messages

