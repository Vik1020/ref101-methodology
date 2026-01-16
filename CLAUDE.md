# ref101-methodology

> Read `core/SYSTEM_PROMPT.md` before any work.

## Structure

- `core/` - Essential methodology specs (always read)
- `namespaces/` - Available methodologies (sccu, etc.)
- `guides/` - Optional learning materials
  - `guides/standards/` - Development standards (deployment, testing, development)
- `tools/` - CLI utilities

## Quick Start

1. Read `core/SYSTEM_PROMPT.md`
2. Choose namespace: `namespaces/sccu/`
3. Use skills from `namespaces/sccu/skills/`

## For New Projects

Install methodology to another project using the local CLI:

```bash
# From ref101-methodology root
node tools/init/dist/index.js --methodology sccu --bundle minimal --methodology-path . /path/to/target-project

# Available bundles: minimal, standard, enterprise
# Use --dry-run to preview changes
```

CLI location: `tools/init/`

## Namespace: SCCU

Self-Contained Context Unit methodology with 8-phase workflow:

RELEASE -> BC_DELTA -> AC_DELTA -> PLAN_FINALIZE -> PC_CONTEXT -> IC -> QA_TESTING -> DEPLOYED

Key files:
- `namespaces/sccu/templates/phases/` - Phase templates
- `namespaces/sccu/processes/` - Process definitions
- `namespaces/sccu/skills/` - Claude Code skills

<!-- ref101:begin -->
## Installed Methodology: SCCU
Bundle: minimal

### Available Skills

- /hotfix
- /new-feature
- /new-release-auto

### Processes

- feature_full
- feature_full_auto
- bugfix_simple
<!-- ref101:end -->
