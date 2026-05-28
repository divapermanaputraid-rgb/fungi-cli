# Sprint Lookup Protocol

## 1. Purpose

FungiCode development uses a sprint lookup step before every major sprint. The purpose is to inspect local reference material for product research, feature categories, and terminal UX ideas, then design an original FungiCode implementation.

This is not a copy step. It is a research and translation step.

## 2. Expected Local Workspace

Recommended layout:

```txt
fungicode-workspace/
FungiCode is an open-source, multi-provider AI coding CLI inspired by modern agentic coding assistants and terminal-first developer workflows.
    claude-code-main/
      ...local reference files...
  fungi-cli/
    docs/
    src/
```

The public repository should be initialized inside `fungi-cli/` only.

## 3. Mandatory Rule Before Every Sprint

Before implementing any sprint, the development agent must perform:

```txt
Sprint Lookup → Fungi Design Note → Implementation Plan → Code
```

The agent must not skip the Fungi Design Note.

## 4. What the Agent May Inspect

The agent may inspect reference material to understand:

- Feature categories
- Command UX patterns
- Safety/permission concepts
- Planning workflows
- Memory workflows
- Tool registry concepts
- Packaging safety lessons
- TUI behavior ideas

## 5. What the Agent Must Not Copy

The project must not:

- Copy internal naming
- Copy proprietary comments
- Copy source structure verbatim
- Commit reference files
FungiCode is an open-source, multi-provider AI coding CLI inspired by modern agentic coding assistants and terminal-first developer workflows.
- Reuse proprietary prompt text as public project prompts

## 6. Required Sprint Design Note Format

Every sprint must create or update a design note in:

```txt
docs/sprints/sprint-NAME.md
```

Template:

```md
# Sprint: <name>

## Reference Lookup Summary

What was inspected at a high level. Do not paste proprietary code.

## FungiCode Interpretation

What original feature FungiCode will build.

## Naming

Original public names for commands, types, folders, and features.

## User Flow

How users will interact with the feature.

## Technical Design

Original FungiCode architecture for this feature.

## Safety Notes

Risks and permission gates.

## Implementation Tasks

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3
```

## 7. Agent Prompt for Sprint Start

Use this at the beginning of a sprint:

```txt
You are developing FungiCode, an open-source multi-provider AI coding terminal.

FungiCode is an open-source, multi-provider AI coding CLI inspired by modern agentic coding assistants and terminal-first developer workflows.

Do not copy internal names, comments, source structure, proprietary prompts, or raw implementation. Do not commit anything from the reference folder. Do not mention the reference folder as a dependency.

After lookup, write an original FungiCode design note in docs/sprints/<sprint-name>.md with:
- Reference Lookup Summary
- FungiCode Interpretation
- Original Naming
- User Flow
- Technical Design
- Safety Notes
- Implementation Tasks

Only after that, implement the feature with original TypeScript code inside fungi-cli.
```

## 8. Recommended First Sprints

1. CLI skeleton
2. Provider router
3. Config system
4. Session logger
5. Context builder
6. Tool registry
7. Permission policy
8. Plan mode
9. Code mode
10. Review mode
11. Memory system
12. Package safety audit

