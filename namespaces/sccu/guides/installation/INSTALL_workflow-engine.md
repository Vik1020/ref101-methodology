---
install_id: INSTALL_workflow-engine
node_id: workflow-engine
node_name: "Workflow Engine"
version: "1.0.0"
status: active
last_updated: 2026-01-11
coupling: structural
canonical_project: ref101-pcc
depends_on: []
---

# Installation Guide: Workflow Engine

> **Node ID:** `workflow-engine`
> **Coupling:** structural
> **Canonical Project:** ref101-pcc
> **Dependencies:** None (root dependency)

## Overview

Workflow Engine is the core state machine for release lifecycle management. It defines phase transitions, validators, and the fundamental workflow state model. All other workflow-related nodes depend on this one.

---

## Prerequisites

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | v18.x | v20.x LTS |
| TypeScript | v5.0 | v5.3+ |

### Project Requirements

| Requirement | Description | Check Command |
|-------------|-------------|---------------|
| npm workspaces | Monorepo structure | `npm -v` |
| TypeScript | For compilation | `tsc --version` |

### Dependencies on Other Nodes

None - this is the root dependency for all workflow nodes.

---

## Provider Installation

> **Role:** Provider implements the workflow state machine
> **Canonical Project:** ref101-pcc
> **SSOT Pattern:** `**/workflow/transitions.ts`

### Provider Prerequisites

- [ ] You are working in ref101-pcc project
- [ ] npm workspaces configured

### Step 1: Create Transitions File

**Requirement ID:** `transitions-file`

**What:** Define phase transitions and their rules

**Path:** `packages/core/src/workflow/transitions.ts`

**Key Contents:**
```typescript
export const PHASE_TRANSITIONS: Record<Phase, PhaseConfig> = {
  RELEASE: {
    next_phases: ['BC_DRAFT'],
    validators: ['release_version_valid', 'release_not_exists'],
  },
  BC_DRAFT: {
    next_phases: ['AC_DRAFT'],
    validators: ['bc_delta_exists'],
  },
  // ... other phases
};
```

---

### Step 2: Create Validators File

**Requirement ID:** `validators-file`

**What:** Implement precondition validators for phase transitions

**Path:** `packages/core/src/workflow/validators.ts`

**Key Contents:**
```typescript
export const PRECONDITION_VALIDATORS: Record<string, ValidatorFn> = {
  release_version_valid: async (ctx) => { ... },
  release_not_exists: async (ctx) => { ... },
  // ... other validators
};
```

---

### Step 3: Create WorkflowState Model

**Requirement ID:** `workflow-state`

**What:** Define WorkflowState TypeScript model

**Path:** `packages/core/src/models/WorkflowState.ts`

**Key Contents:**
```typescript
export const PHASE_ORDER: Phase[] = [
  'RELEASE', 'BC_DRAFT', 'AC_DRAFT', 'PLAN_FINALIZE',
  'PC_DEVELOPMENT', 'IC_VALIDATION', 'QA_TESTING',
  'APPLY_DELTAS', 'DEPLOYED'
];

export interface WorkflowState {
  release_id: string;
  version: string;
  process_id: string;
  current_phase: Phase;
  phase_history: PhaseHistoryEntry[];
}
```

---

### Provider Configuration

No additional configuration needed. Workflow Engine is configured through code.

### Provider Validation Rules

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `validator-implementation` | error | All validators have implementation |
| `no-orphan-validators` | warning | All validators are used |
| `phase-order-match` | warning | PHASE_ORDER matches templates |

**Run validation:**
```bash
make validate-instances
```

---

## Consumer Installation

> **Role:** Consumer uses workflow engine via @ref101/pcc package
> **Typical Setup:** npm package dependency

### Consumer Prerequisites

- [ ] npm or yarn available
- [ ] Access to ref101-pcc package

### Step 1: Install PCC Package

**Requirement ID:** `pcc-dependency`

**What:** Add @ref101/pcc as dependency

**Commands:**
```bash
npm install @ref101/pcc
# or
yarn add @ref101/pcc
```

---

### Consumer Configuration

No additional configuration. Import and use:

```typescript
import { WorkflowEngine } from '@ref101/pcc';
```

### Consumer Validation Rules

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `pcc-dependency` | error | @ref101/pcc in package.json |

---

## Verification

### Quick Checklist

**For Provider (ref101-pcc):**
- [ ] `packages/core/src/workflow/transitions.ts` exists
- [ ] `packages/core/src/workflow/validators.ts` exists
- [ ] `packages/core/src/models/WorkflowState.ts` exists
- [ ] All validators have implementations

**For Consumer:**
- [ ] @ref101/pcc in dependencies
- [ ] Can import WorkflowEngine

### Verification Script

```bash
#!/bin/bash
# verify-workflow-engine.sh

PROJECT_ROOT="${1:-$(pwd)}"
ROLE="${2:-consumer}"

echo "Verifying workflow-engine installation..."

if [ "$ROLE" = "provider" ]; then
    [ -f "$PROJECT_ROOT/packages/core/src/workflow/transitions.ts" ] \
        && echo "OK transitions.ts" || echo "FAIL transitions.ts"
    [ -f "$PROJECT_ROOT/packages/core/src/workflow/validators.ts" ] \
        && echo "OK validators.ts" || echo "FAIL validators.ts"
    [ -f "$PROJECT_ROOT/packages/core/src/models/WorkflowState.ts" ] \
        && echo "OK WorkflowState.ts" || echo "FAIL WorkflowState.ts"
else
    grep -q "@ref101/pcc" "$PROJECT_ROOT/package.json" \
        && echo "OK @ref101/pcc dependency" || echo "FAIL missing dependency"
fi
```

---

## Troubleshooting

### Issue: Missing Validator Implementation

**Symptom:**
```
Error: Validator 'xyz' not found in PRECONDITION_VALIDATORS
```

**Cause:** Transition references validator not implemented

**Solution:**
Add implementation in validators.ts:
```typescript
export const PRECONDITION_VALIDATORS = {
  xyz: async (ctx) => { /* implementation */ },
};
```

---

## Node Instance Registration

### Provider Registration

```yaml
instances:
  workflow-engine@ref101-pcc:
    template: workflow-engine
    project: ref101-pcc
    role: provider
    ssot: packages/core/src/workflow/transitions.ts
    status: active
```

### Consumer Registration

```yaml
instances:
  workflow-engine@my-project:
    template: workflow-engine
    project: my-project
    role: consumer
    config:
      package: "@ref101/pcc"
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
