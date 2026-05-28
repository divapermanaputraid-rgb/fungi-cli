# Sprint 0: Kickoff

## Reference Lookup Summary

No implementation lookup has been performed yet. Before Sprint 1, inspect the local reference folder if it exists and summarize only high-level feature categories and UX ideas.

## FungiCode Interpretation

Start with a minimal, original TypeScript CLI skeleton that can later support provider routing, tool calls, permissions, memory, and plan/code/review workflows.

## Naming

- Product: FungiCode
- CLI command: `fungi`
- Local state folder: `.fungi`
- Public package: `fungi-cli`

## User Flow

```bash
fungi init
fungi chat
fungi plan "task"
fungi code "task"
fungi review
```

## Technical Design

Use a modular structure with CLI commands, provider router, tools, permissions, memory, and planner modules.

## Safety Notes

Keep reference material outside the public repo. Add package safety checks before any npm publishing.

## Implementation Tasks

- [ ] Initialize TypeScript project
- [ ] Add CLI framework
- [ ] Add config loader
- [ ] Add provider interfaces
- [ ] Add basic command stubs
