# ref101-methodology

> Read `core/SYSTEM_PROMPT.md` before any work.

## Structure

- `core/` - Essential methodology specs (always read)
- `namespaces/` - Available methodologies (sccu, etc.)
- `guides/` - Optional learning materials
- `tools/` - CLI utilities

## Quick Start

1. Read `core/SYSTEM_PROMPT.md`
2. Choose namespace: `namespaces/sccu/`
3. Use skills from `namespaces/sccu/skills/`

## For New Projects

```bash
npx @ref101/init --methodology sccu --bundle enterprise
```

## Namespace: SCCU

Self-Contained Context Unit methodology with 8-phase workflow:

RELEASE -> BC_DELTA -> AC_DELTA -> PLAN_FINALIZE -> PC_CONTEXT -> IC -> QA_TESTING -> DEPLOYED

Key files:
- `namespaces/sccu/templates/phases/` - Phase templates
- `namespaces/sccu/processes/` - Process definitions
- `namespaces/sccu/skills/` - Claude Code skills
