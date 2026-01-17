---
context_id: GUIDE_process_composer
version: "1.0.0"
type: guide
status: active
owner: ref101-specs
audience: developer
language: en
last_updated: "2026-01-06"
related_documents:
  - path: ../WORKFLOW.md
    description: "Workflow phases and transitions"
  - path: ../processes/README.md
    description: "Process Registry catalog"
  - path: ../templates/phases/RELEASE_TEMPLATE.md
    description: "Release context template"
---

# Process Composer Guide

**Version:** 1.0.0
**Last Updated:** 2026-01-06

> **Process Composer** enables composable workflows from reusable phases.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Process Definition Structure](#process-definition-structure)
4. [Creating Custom Processes](#creating-custom-processes)
5. [Process Resolution Order](#process-resolution-order)
6. [CLI Commands](#cli-commands)
7. [Examples](#examples)
8. [Troubleshooting](#troubleshooting)

---

## Introduction

### What is Process Composer?

**Process Composer** is a workflow composition system that allows you to:

- **Compose workflows** from reusable phases
- **Create custom processes** tailored to your project needs
- **Override base processes** with project-specific variants
- **Validate process definitions** against a strict schema
- **Version processes** independently from releases

### Why Process Composer?

**Before Process Composer:**
```
WORKFLOW.md → Single hardcoded 9-phase process
              No flexibility for bugfixes, refactoring, docs-only changes
```

**After Process Composer:**
```
Process Library → feature_full (9 phases)
                → bugfix_simple (5 phases)
                → refactoring (6 phases)
                → custom_hotfix (your own process)
                → ... (unlimited processes)
```

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Process Definitions (JSON)                                  │
│  processes/*.json                             │
│  {project}/processes/*.json (override)                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Process Composer (tools/process-composer/)                  │
│  - ProcessRegistry: Load with override support              │
│  - ProcessValidator: Validate against JSON Schema            │
│  - ProcessComposer: Compose WorkflowDefinition              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  PCC (tools/command-center/)                                 │
│  - WorkflowEngine: Execute workflow                          │
│  - DataService: Track progress                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### 1. Process Definition

A **Process** is a JSON file that defines:
- **process_id** - Unique identifier (e.g., `feature_full`, `bugfix_simple`)
- **version** - Semantic version (e.g., `"1.0.0"`)
- **name** - Human-readable name
- **description** - What this process is for
- **type** - Category (e.g., `feature_development`, `bugfix`)
- **phases** - Array of phase definitions

### 2. Phase Library

**Phases** are reusable workflow steps defined in templates:

```
templates/phases/
├── RELEASE_TEMPLATE.md          # Release planning
├── BC_DELTA_TEMPLATE.md         # Business context
├── AC_DELTA_TEMPLATE.md         # Analytical context
├── PLAN_FINALIZE_TEMPLATE.md    # Task decomposition
├── PC_CONTEXT_TEMPLATE.md       # Implementation
├── IC_TEMPLATE.md               # Infrastructure validation
├── QA_TESTING_TEMPLATE.md       # Testing
└── ... (future phases)
```

Each phase can be used in any process.

### 3. Composition

**Process = Combination of Phases**

```json
{
  "process_id": "bugfix_simple",
  "phases": [
    { "id": "RELEASE" },
    { "id": "PC" },
    { "id": "IC" },
    { "id": "QA" },
    { "id": "DEPLOY" }
  ]
}
```

This creates a simplified workflow: **RELEASE → PC → IC → QA → DEPLOY** (skips BC/AC).

---

## Process Definition Structure

### JSON Schema

All process definitions are validated against `processes/process.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["process_id", "version", "name", "phases"],
  "properties": {
    "process_id": {
      "type": "string",
      "pattern": "^[a-z_]+$",
      "description": "Lowercase letters and underscores only"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Semantic versioning (e.g., 1.0.0)"
    },
    "name": { "type": "string" },
    "description": { "type": "string" },
    "type": { "type": "string" },
    "phases": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id"],
        "properties": {
          "id": { "type": "string" },
          "template": { "type": "string" },
          "validators": {
            "type": "array",
            "items": { "type": "string" }
          },
          "approval": {
            "type": "object",
            "properties": {
              "required": { "type": "boolean" },
              "role": { "type": "string" }
            }
          },
          "skip_allowed": { "type": "boolean" }
        }
      }
    }
  }
}
```

### Phase Definition Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✅ | Phase identifier (e.g., `RELEASE`, `BC_delta`, `PC`) |
| `template` | ❌ | Template filename (e.g., `RELEASE_TEMPLATE.md`) |
| `validators` | ❌ | List of validator IDs to run |
| `approval` | ❌ | Approval requirements |
| `approval.required` | ❌ | Whether approval is needed |
| `approval.role` | ❌ | Who approves (e.g., `product_owner`, `tech_lead`) |
| `skip_allowed` | ❌ | Whether this phase can be skipped |

---

## Creating Custom Processes

### Step 1: Choose Process ID

Pick a unique identifier using **lowercase letters and underscores**:

- ✅ `custom_hotfix`
- ✅ `emergency_deploy`
- ✅ `docs_only_update`
- ❌ `custom-hotfix` (hyphens not allowed)
- ❌ `customHotfix` (camelCase not allowed)

### Step 2: Create JSON File

**Option A: Project-specific process** (recommended for customization)
```bash
mkdir -p processes
touch processes/custom_hotfix.json
```

**Option B: Global process** (for widely-used processes)
```bash
touch processes/custom_hotfix.json
```

### Step 3: Define Process Structure

```json
{
  "process_id": "custom_hotfix",
  "version": "1.0.0",
  "name": "Emergency Hotfix",
  "description": "Minimal process for production hotfixes. Skips BC/AC/QA.",
  "type": "hotfix",
  "phases": [
    {
      "id": "RELEASE",
      "template": "RELEASE_TEMPLATE.md",
      "validators": ["release_has_problem"],
      "skip_allowed": false
    },
    {
      "id": "PC",
      "template": "PC_CONTEXT_TEMPLATE.md",
      "validators": ["pc_has_implementation"],
      "skip_allowed": false
    },
    {
      "id": "IC",
      "template": "IC_TEMPLATE.md",
      "validators": ["all_ics_validated"],
      "skip_allowed": false
    },
    {
      "id": "DEPLOY",
      "skip_allowed": false
    }
  ]
}
```

### Step 4: Validate Process

```bash
pcc process-validate custom_hotfix
```

**Expected output:**
```
✅ Process custom_hotfix is valid
   - 4 phases defined
   - 0 approvals required
   - 3 phases with validators
```

### Step 5: Use in Release

In your RELEASE file frontmatter:

```yaml
---
context_id: RELEASE_v1_11_0_critical_fix
version: "1.11.0"
type: release
status: planning
process_id: custom_hotfix      # ← Use your custom process
process_version: "1.0.0"
---
```

---

## Process Resolution Order

When loading a process, PCC searches in this order:

```
1. {project}/processes/{process_id}.json      (highest priority)
2. processes/{process_id}.json  (fallback)
3. Error: Process not found                    (if neither exists)
```

### Override Warning

If both exist, PCC will warn you:

```
⚠️  Process bugfix_simple overridden by project
    (using {project}/processes/bugfix_simple.json)
```

This allows projects to customize base processes while keeping ref101-specs standards.

---

## CLI Commands

### List Available Processes

```bash
pcc process-list
```

**Output:**
```
📋 Available Processes:

  [ref101]   feature_full        - Feature Development (Full)
             [9 phases, 4 approvals]
  [ref101]   bugfix_simple       - Bugfix (Simple)
             [5 phases, 1 approval]
  [project]  custom_hotfix       - Emergency Hotfix
             [4 phases, 0 approvals]
```

**JSON format:**
```bash
pcc process-list --format json
```

### Show Process Details

```bash
pcc process-show feature_full
```

**Output:**
```
📄 Process: Feature Development (Full)
   ID: feature_full
   Version: 1.0.0
   Type: feature_development

   Full feature development process with all phases.
   Use for new features with business context, architecture, and full validation.

   Phases (9):
     1.  RELEASE [template: RELEASE_TEMPLATE.md]
         validators: release_has_problem, release_has_scope, release_has_milestones
     2.  BC_delta [template: BC_DELTA_TEMPLATE.md] [approval: product_owner]
         validators: bc_has_goals, bc_has_actors, bc_has_scenarios
     3.  AC_delta [template: AC_DELTA_TEMPLATE.md] [approval: tech_lead]
         validators: ac_has_use_cases, ac_based_on_bc
     ...
```

**JSON format:**
```bash
pcc process-show feature_full --format json
```

### Validate Process Definition

```bash
pcc process-validate custom_hotfix
```

**Verbose output:**
```bash
pcc process-validate custom_hotfix --verbose
```

**Output:**
```
✅ Process custom_hotfix is valid
   - 4 phases defined
   - 0 approvals required
   - 3 phases with validators
```

---

## Examples

### Example 1: Full Feature Development

**File:** `processes/feature_full.json`

```json
{
  "process_id": "feature_full",
  "version": "1.0.0",
  "name": "Feature Development (Full)",
  "description": "Full feature development process with all phases. Use for new features with business context, architecture, and full validation.",
  "type": "feature_development",
  "phases": [
    {
      "id": "RELEASE",
      "template": "RELEASE_TEMPLATE.md",
      "validators": ["release_has_problem", "release_has_scope", "release_has_milestones"],
      "skip_allowed": false
    },
    {
      "id": "BC_delta",
      "template": "BC_DELTA_TEMPLATE.md",
      "validators": ["bc_has_goals", "bc_has_actors", "bc_has_scenarios"],
      "approval": {
        "required": true,
        "role": "product_owner"
      },
      "skip_allowed": false
    },
    {
      "id": "AC_delta",
      "template": "AC_DELTA_TEMPLATE.md",
      "validators": ["ac_has_use_cases", "ac_based_on_bc"],
      "approval": {
        "required": true,
        "role": "tech_lead"
      },
      "skip_allowed": false
    },
    {
      "id": "PLAN_FINALIZE",
      "template": "PLAN_FINALIZE_TEMPLATE.md",
      "validators": ["plan_has_tasks", "tasks_estimated"],
      "approval": {
        "required": true,
        "role": "team"
      },
      "skip_allowed": false
    },
    {
      "id": "PC",
      "template": "PC_CONTEXT_TEMPLATE.md",
      "validators": ["pc_has_implementation", "pc_has_5_ics"],
      "skip_allowed": false
    },
    {
      "id": "IC",
      "template": "IC_TEMPLATE.md",
      "validators": ["all_ics_validated", "no_p0_violations"],
      "skip_allowed": false
    },
    {
      "id": "QA",
      "template": "QA_TESTING_TEMPLATE.md",
      "validators": ["qa_tests_passed", "qa_coverage_met"],
      "approval": {
        "required": true,
        "role": "qa_lead"
      },
      "skip_allowed": false
    },
    {
      "id": "APPLY_DELTAS",
      "skip_allowed": false
    },
    {
      "id": "DEPLOY",
      "skip_allowed": false
    }
  ]
}
```

**Workflow diagram:**
```
RELEASE → BC_delta → AC_delta → PLAN_FINALIZE → PC → IC → QA → APPLY_DELTAS → DEPLOY
          (approval)  (approval)  (approval)                (approval)
```

**Use case:** New features with full business analysis and validation.

---

### Example 2: Simple Bugfix

**File:** `processes/bugfix_simple.json`

```json
{
  "process_id": "bugfix_simple",
  "version": "1.0.0",
  "name": "Bugfix (Simple)",
  "description": "Simplified process for bug fixes. Skips BC/AC, goes straight to PC → IC → QA → DEPLOY.",
  "type": "bugfix",
  "phases": [
    {
      "id": "RELEASE",
      "template": "RELEASE_TEMPLATE.md",
      "validators": ["release_has_problem"],
      "skip_allowed": false
    },
    {
      "id": "PC",
      "template": "PC_CONTEXT_TEMPLATE.md",
      "validators": ["pc_has_implementation", "pc_has_5_ics"],
      "skip_allowed": false
    },
    {
      "id": "IC",
      "template": "IC_TEMPLATE.md",
      "validators": ["all_ics_validated"],
      "skip_allowed": false
    },
    {
      "id": "QA",
      "template": "QA_TESTING_TEMPLATE.md",
      "validators": ["qa_tests_passed"],
      "approval": {
        "required": true,
        "role": "qa_lead"
      },
      "skip_allowed": false
    },
    {
      "id": "DEPLOY",
      "skip_allowed": false
    }
  ]
}
```

**Workflow diagram:**
```
RELEASE → PC → IC → QA → DEPLOY
                    (approval)
```

**Use case:** Bug fixes that don't require business context changes.

---

### Example 3: Custom Hotfix (Project-Specific)

**File:** `{project}/processes/custom_hotfix.json`

```json
{
  "process_id": "custom_hotfix",
  "version": "1.0.0",
  "name": "Emergency Hotfix",
  "description": "Project-specific hotfix process. Minimal validation for critical production issues.",
  "type": "hotfix",
  "phases": [
    {
      "id": "RELEASE",
      "template": "RELEASE_TEMPLATE.md",
      "validators": ["release_has_problem"],
      "skip_allowed": false
    },
    {
      "id": "PC",
      "template": "PC_CONTEXT_TEMPLATE.md",
      "validators": ["pc_has_implementation"],
      "skip_allowed": false
    },
    {
      "id": "IC",
      "template": "IC_TEMPLATE.md",
      "validators": ["all_ics_validated"],
      "skip_allowed": false
    },
    {
      "id": "DEPLOY",
      "skip_allowed": false
    }
  ]
}
```

**Workflow diagram:**
```
RELEASE → PC → IC → DEPLOY
```

**Use case:** Critical production issues requiring immediate deployment.

**⚠️ Warning:** This process skips QA. Use only for emergencies and follow up with proper QA testing.

---

## Troubleshooting

### Error: Process not found

```
❌ Error: Process not found: my_custom_process
```

**Solution:**
1. Check process file exists:
   ```bash
   ls -la {project}/processes/my_custom_process.json
   ls -la processes/my_custom_process.json
   ```
2. Verify `process_id` in JSON matches filename (without `.json`)

---

### Error: Invalid process definition

```
❌ Process validation failed: data/process_id must match pattern "^[a-z_]+$"
```

**Solution:**
- Use only lowercase letters and underscores in `process_id`
- Change `my-custom-process` to `my_custom_process`

---

### Error: Phase template not found

```
❌ Process validation failed: Phase template not found: INVALID_TEMPLATE.md
```

**Solution:**
1. Check template exists:
   ```bash
   ls -la templates/phases/RELEASE_TEMPLATE.md
   ```
2. Use correct template filename from phase library

---

### Warning: Process overridden by project

```
⚠️  Process bugfix_simple overridden by project
    (using {project}/processes/bugfix_simple.json)
```

**This is informational, not an error.**

If unintended:
1. Remove `{project}/processes/bugfix_simple.json`
2. PCC will use ref101-specs version

---

### Error: Validator not found

```
❌ Validator not found: invalid_validator_id
```

**Solution:**
Use only validators defined in PCC's validator registry. See available validators:
```bash
pcc workflow --diagram  # Shows all validators
```

---

## Related Documentation

- [WORKFLOW.md](../WORKFLOW.md) - Workflow phases and transitions
- [Process Registry](../processes/README.md) - Catalog of all processes
- [RELEASE_TEMPLATE.md](../templates/phases/RELEASE_TEMPLATE.md) - Release context template
- [PCC README](../../tools/command-center/README.md) - PCC tool documentation

---

## Changelog

### v1.0.0 - 2026-01-06

**Initial release:**
- Process Composer architecture documentation
- Process definition structure (JSON Schema)
- Custom process creation guide
- CLI command reference
- Examples (feature_full, bugfix_simple, custom_hotfix)
- Troubleshooting section
