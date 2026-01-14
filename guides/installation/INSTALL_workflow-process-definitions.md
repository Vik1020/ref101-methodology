---
install_id: INSTALL_workflow-process-definitions
node_id: workflow-process-definitions
node_name: "Workflow Process Definitions"
version: "1.1.0"
status: active
last_updated: 2026-01-11
coupling: structural
canonical_project: ref101-specs
depends_on:
  - workflow-phase-templates
  - workflow-engine
---

# Installation Guide: Workflow Process Definitions

> **Node ID:** `workflow-process-definitions`
> **Coupling:** structural
> **Canonical Project:** ref101-specs
> **Dependencies:** workflow-phase-templates, workflow-engine

## Overview

Process Definitions are composable workflow configurations that combine phases, validators, and transitions. Each process (e.g., `feature_full`, `bugfix_simple`) defines a specific workflow path through the release lifecycle.

---

## Prerequisites

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Git | 2.x | Latest |
| JSON validator | Any | VS Code with JSON extension |

### Dependencies on Other Nodes

| Node | Role | Purpose |
|------|------|---------|
| workflow-phase-templates | provider | Template files for each phase |
| workflow-engine | provider | Validator definitions |

---

## Provider Installation

> **Role:** Provider maintains process JSON definitions
> **Canonical Project:** ref101-specs
> **SSOT Pattern:** `processes/*.json`

### Provider Prerequisites

- [ ] You are working in ref101-specs project
- [ ] phase-templates node is available

### Step 1: Create Processes Directory

**Requirement ID:** `processes-directory`

**Commands:**
```bash
mkdir -p processes
```

---

### Step 2: Create Process Schema

**Requirement ID:** `process-schema`

**What:** JSON Schema for validating process files

**Path:** `processes/process.schema.json`

**Key Contents:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["process_id", "phases"],
  "properties": {
    "process_id": { "type": "string" },
    "phases": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["phase_id", "template"],
        "properties": {
          "phase_id": { "type": "string" },
          "template": { "type": "string" },
          "validators": { "type": "array" }
        }
      }
    }
  }
}
```

---

### Step 3: Create Process Definitions

**What:** Create JSON files for each process type

**Example (feature_full.json):**
```json
{
  "process_id": "feature_full",
  "name": "Full Feature Process",
  "description": "Complete workflow with human approvals",
  "phases": [
    {
      "phase_id": "RELEASE",
      "template": "templates/phases/RELEASE_TEMPLATE.md",
      "validators": ["release_version_valid"],
      "requires_approval": true
    },
    {
      "phase_id": "BC_DRAFT",
      "template": "templates/phases/BC_delta_TEMPLATE.md",
      "validators": ["bc_delta_exists"],
      "requires_approval": true
    }
  ]
}
```

---

### Provider Validation Rules

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `process-has-phases` | error | At least one phase defined |
| `template-exists` | error | Template files exist |
| `process-id-unique` | error | Unique process_id |

---

## Consumer Installation

> **Role:** Consumer accesses processes via git submodule
> **Typical Setup:** Git submodule to ref101-specs

### Consumer Prerequisites

- [ ] ref101-specs submodule added

### Step 1: Verify Access

**Commands:**
```bash
ls methodology/ref101-specs/processes/
```

**Expected Result:**
```
feature_full.json
feature_full_auto.json
bugfix_simple.json
process.schema.json
```

---

### Consumer Configuration

Processes accessed via submodule. Optionally create symlink:

```bash
ln -sf methodology/ref101-specs/processes processes
```

---

## Verification

### Quick Checklist

**For Provider:**
- [ ] `processes/` directory exists
- [ ] `process.schema.json` exists
- [ ] At least one process JSON file

**For Consumer:**
- [ ] Processes accessible via submodule

### Verification Script

```bash
#!/bin/bash
# verify-process-definitions.sh

PROJECT_ROOT="${1:-$(pwd)}"

PROC_DIR="$PROJECT_ROOT/methodology/ref101-specs/processes"
[ ! -d "$PROC_DIR" ] && PROC_DIR="$PROJECT_ROOT/processes"

[ -d "$PROC_DIR" ] && echo "OK processes directory" || echo "FAIL"
[ -f "$PROC_DIR/process.schema.json" ] && echo "OK schema" || echo "WARN schema"

for proc in feature_full feature_full_auto bugfix_simple; do
    [ -f "$PROC_DIR/${proc}.json" ] \
        && echo "OK ${proc}.json" || echo "WARN ${proc}.json"
done
```

---

## Troubleshooting

### Issue: Template Path Not Found

**Symptom:**
```
Error: Template 'templates/phases/XYZ.md' not found
```

**Solution:**
Ensure phase-templates node is installed and paths are relative to ref101-specs root.

---

## Node Instance Registration

### Provider Registration

```yaml
instances:
  workflow-process-definitions@ref101-specs:
    template: workflow-process-definitions
    project: ref101-specs
    role: provider
    ssot: processes/
    status: active
```

---

## Related Documentation

- [node-templates.yaml](../../config/node-templates.yaml)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-11 | Initial release |
