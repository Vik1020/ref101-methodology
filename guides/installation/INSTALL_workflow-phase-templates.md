---
install_id: INSTALL_workflow-phase-templates
node_id: workflow-phase-templates
node_name: "Workflow Phase Templates"
version: "1.1.0"
status: active
last_updated: 2026-01-11
coupling: structural
canonical_project: ref101-specs
depends_on:
  - workflow-engine
---

# Installation Guide: Workflow Phase Templates

> **Node ID:** `workflow-phase-templates`
> **Coupling:** structural
> **Canonical Project:** ref101-specs
> **Dependencies:** workflow-engine

## Overview

Phase Templates define the SSOT for phase behavior, validators, and transitions. Each template specifies what artifacts are created, which validators run, and where the workflow transitions next.

---

## Prerequisites

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Git | 2.x | Latest |
| Text editor | Any | VS Code with YAML extension |

### Project Requirements

| Requirement | Description | Check Command |
|-------------|-------------|---------------|
| ref101-specs | Access to methodology repo | `ls methodology/ref101-specs` |

### Dependencies on Other Nodes

| Node | Role | Purpose |
|------|------|---------|
| workflow-engine | provider | Provides validator IDs and phases |

---

## Provider Installation

> **Role:** Provider maintains phase template definitions
> **Canonical Project:** ref101-specs
> **SSOT Pattern:** `templates/phases/*_TEMPLATE.md`

### Provider Prerequisites

- [ ] You are working in ref101-specs project
- [ ] workflow-engine node is available

### Step 1: Create Templates Directory

**Requirement ID:** `templates-directory`

**What:** Create the phase templates directory

**Commands:**
```bash
mkdir -p templates/phases
```

---

### Step 2: Create Phase Templates

**What:** Create *_TEMPLATE.md for each workflow phase

**Required Templates:**
- `RELEASE_TEMPLATE.md`
- `BC_delta_TEMPLATE.md`
- `AC_delta_TEMPLATE.md`
- `PLAN_FINALIZE_TEMPLATE.md`
- `PC_TEMPLATE.md`
- `IC_TEMPLATE.md`
- `QA_TEMPLATE.md`

**Template Structure:**
```markdown
---
phase: RELEASE
artifact_type: release
required_sections:
  - Problem Statement
  - Solution Summary
validators:
  - release_version_valid
transition:
  next_phase: BC_DRAFT
---

# Release: {version}

## Problem Statement
...
```

---

### Provider Configuration

Templates are self-documenting via YAML frontmatter.

### Provider Validation Rules

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `template-has-phase` | error | Frontmatter has phase field |
| `template-has-transition` | error | Defines next_phase |
| `validator-ids-valid` | error | Validators exist in validators.ts |

**Run validation:**
```bash
make validate-instances
```

---

## Consumer Installation

> **Role:** Consumer accesses templates via git submodule
> **Typical Setup:** Git submodule to ref101-specs

### Consumer Prerequisites

- [ ] Git available
- [ ] Access to ref101-specs repository

### Step 1: Add Submodule

**What:** Add ref101-specs as git submodule

**Commands:**
```bash
git submodule add https://github.com/org/ref101-specs methodology/ref101-specs
git submodule update --init
```

---

### Step 2: Verify Access

**What:** Confirm templates are accessible

**Commands:**
```bash
ls methodology/ref101-specs/templates/phases/
```

**Expected Result:**
```
RELEASE_TEMPLATE.md
BC_delta_TEMPLATE.md
AC_delta_TEMPLATE.md
...
```

---

### Consumer Configuration

No additional configuration. Templates accessed via submodule path.

### Consumer Validation Rules

No specific consumer rules - submodule provides read access.

---

## Verification

### Quick Checklist

**For Provider (ref101-specs):**
- [ ] `templates/phases/` directory exists
- [ ] All *_TEMPLATE.md files have frontmatter
- [ ] Each template defines phase and transition

**For Consumer:**
- [ ] Submodule initialized
- [ ] Templates accessible via `methodology/ref101-specs/templates/phases/`

### Verification Script

```bash
#!/bin/bash
# verify-phase-templates.sh

PROJECT_ROOT="${1:-$(pwd)}"

echo "Verifying phase-templates installation..."

TEMPLATES_DIR="$PROJECT_ROOT/methodology/ref101-specs/templates/phases"
if [ ! -d "$TEMPLATES_DIR" ]; then
    TEMPLATES_DIR="$PROJECT_ROOT/templates/phases"
fi

[ -d "$TEMPLATES_DIR" ] \
    && echo "OK templates directory" || echo "FAIL templates directory"

for phase in RELEASE BC_delta AC_delta PLAN_FINALIZE PC IC QA; do
    [ -f "$TEMPLATES_DIR/${phase}_TEMPLATE.md" ] \
        && echo "OK ${phase}_TEMPLATE.md" || echo "WARN ${phase}_TEMPLATE.md missing"
done
```

---

## Troubleshooting

### Issue: Submodule Not Initialized

**Symptom:**
```
ls: cannot access 'methodology/ref101-specs': No such file or directory
```

**Cause:** Submodule not initialized after clone

**Solution:**
```bash
git submodule update --init --recursive
```

---

## Node Instance Registration

### Provider Registration

```yaml
instances:
  workflow-phase-templates@ref101-specs:
    template: workflow-phase-templates
    project: ref101-specs
    role: provider
    ssot: templates/phases/
    status: active
```

### Consumer Registration

```yaml
instances:
  workflow-phase-templates@my-project:
    template: workflow-phase-templates
    project: my-project
    role: consumer
    config:
      access_via: submodule
      submodule_path: methodology/ref101-specs/templates/phases/
    status: active
```

---

## Related Documentation

- [node-templates.yaml](../../config/node-templates.yaml)
- [node-instances.yaml](../../config/node-instances.yaml)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-11 | Initial release |
