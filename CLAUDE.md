# ref101-methodology

> Read `namespaces/sccu/core/SYSTEM_PROMPT.md` before any work.

## Structure

- `namespaces/` - Available methodologies
  - `sccu/` - SCCU methodology (core, guides, skills, processes)
  - `meta/` - Meta-methodology
  - `node-hub/` - Node validation
- `tools/` - CLI utilities

## Quick Start

1. Read `namespaces/sccu/core/SYSTEM_PROMPT.md`
2. Explore `namespaces/sccu/guides/` for detailed documentation
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

## Namespace: Meta

Meta-methodology for describing human-AI processes. 8 invariant elements:
State, Actor, Tool, Action, Entity, Artifact, Fact, Rule.

Key files:
- `namespaces/meta/methodology.yaml` - Self-describing methodology
- `namespaces/meta/README.md` - Full specification
- `namespaces/meta/schema/` - Validation schema

Skills:
- `/meta-new-methodology` - Create new namespace
- `/meta-validate` - Validate methodology.yaml

## Namespace: SCCU

Self-Contained Context Unit methodology with 8-phase workflow:

RELEASE -> BC_DELTA -> AC_DELTA -> PLAN_FINALIZE -> PC_CONTEXT -> IC -> QA_TESTING -> DEPLOYED

Key files:
- `namespaces/sccu/core/` - System prompt, workflow spec, quick reference
- `namespaces/sccu/guides/` - Documentation (standards, methodology, installation)
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
- /meta-new-methodology
- /meta-validate

### Processes

- feature_full
- feature_full_auto
- bugfix_simple
<!-- ref101:end -->
