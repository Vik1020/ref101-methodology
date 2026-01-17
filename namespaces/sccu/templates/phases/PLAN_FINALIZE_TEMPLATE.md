<!--
INSTRUCTIONS: Before using this template

1. Replace all [placeholders] with actual values:
   - context_id: PLAN_v{X_Y_Z} (e.g., PLAN_v1_9_0)
   - release: RELEASE_v{X_Y_Z}_{feature} (e.g., RELEASE_v1_9_0_dark_mode)

2. Review approved BC/AC deltas and decompose into tasks

3. Assign estimates to each task (S = 1-2h, M = 2-4h, L = 4-8h, XL = 8h+)

4. Get Team approval before starting PC development

5. Remove this instruction block after filling in all values

See also:
- Workflow: specifications/WORKFLOW.md (Subprocess: PLAN_FINALIZE)
- Release Management: specifications/reference/work-tracking/RELEASE_MANAGEMENT.md

PHASE RULES (this template is SSOT for PLAN_FINALIZE phase):
- Validators, skip conditions, and transitions are defined in frontmatter below
- PCC reads these rules directly from this template
-->

---
context_id: PLAN_v[X_Y_Z]                # Example: PLAN_v1_9_0
type: plan_finalize                      # Don't change
version: "1.0.0"                         # Plan document version
status: draft                            # draft | review | approved
release: RELEASE_v[X_Y_Z]_[feature]      # Link to Release context
created_at: 2026-01-04                   # REPLACE with current date
approved_at: null                        # Set when Team approves

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE RULES (SSOT) - PCC reads these directly from this template
# ═══════════════════════════════════════════════════════════════════════════════
phase: PLAN_FINALIZE
output_file: "docs/releases/v{X.Y.Z}/PLAN_FINALIZE_{tool}_v{X}_{Y}_{Z}.md"
output_file_mandatory: true
validators:
  - id: plan_has_tasks
    description: At least one task in tasks section
  - id: tasks_estimated
    description: All tasks have estimates
  - id: output_file_exists
    description: Output file exists at specified path
skip_allowed:
  - BC_delta and AC_delta were skipped
  - Single obvious task (1 file, 1 change)
  - No decomposition needed
skip_forbidden:
  - Changes affect > 3 files
  - Dependencies between changes exist
  - Coordination with other components required
transition:
  requires_approval: true
  approver: Team
  next_phase: PC
# ═══════════════════════════════════════════════════════════════════════════════

reviewed_deltas:
  - BC_delta_v[X_Y_Z]_[domain]           # BC deltas reviewed
  - AC_delta_v[X_Y_Z]_[domain]           # AC deltas reviewed
tasks:
  - id: TASK_001
    title: "[Task title]"
    type: feature                        # feature | bugfix | refactor | docs | test
    phase: PC                            # BC | AC | PC | IC | QA
    estimate: M                          # S (1-2h) | M (2-4h) | L (4-8h) | XL (8h+)
    assignee: null                       # Assigned person
    status: pending                      # pending | in_progress | done | blocked
    depends_on: []                       # Task IDs this task depends on
    ac_reference: UC[XXX]_[name]         # Use Case from AC delta
    notes: ""
checklist:                               # LLM-readable checklist for session recovery
  planning:
    - item: "BC deltas reviewed"
      status: pending                    # pending | done
    - item: "AC deltas reviewed"
      status: pending
    - item: "Tasks decomposed from Use Cases"
      status: pending
    - item: "Estimates assigned to all tasks"
      status: pending
  validation:
    - item: "No circular dependencies"
      status: pending
    - item: "Critical path identified"
      status: pending
    - item: "Total effort calculated"
      status: pending
    - item: "Ready for Team review"
      status: pending
---

# Plan Finalize: v[X.Y.Z]

> **Release:** [RELEASE_v{X_Y_Z}_{feature}](../releases/RELEASE_v{X_Y_Z}_{feature}.md)
> **Date:** [YYYY-MM-DD]
> **Status:** [Draft/Review/Approved]

## Overview

[Brief summary of what this release delivers and the scope of work]

---

## Reviewed Deltas

| Delta | Type | Features | Status |
|-------|------|----------|--------|
| [BC_delta_v{X_Y_Z}_{domain}](../deltas/v{X.Y.Z}/BC_delta_{domain}.md) | BC | [N] features | Approved |
| [AC_delta_v{X_Y_Z}_{domain}](../deltas/v{X.Y.Z}/AC_delta_{domain}.md) | AC | [N] Use Cases | Approved |

---

## Task Breakdown

### Feature Tasks

| ID | Task | Phase | Estimate | Depends On | Status |
|----|------|-------|----------|------------|--------|
| TASK_001 | [Task description] | PC | M | - | pending |
| TASK_002 | [Task description] | PC | L | TASK_001 | pending |
| TASK_003 | [Task description] | IC | S | TASK_002 | pending |

### Test Tasks

| ID | Task | Phase | Estimate | Depends On | Status |
|----|------|-------|----------|------------|--------|
| TASK_010 | Unit tests for [component] | QA | M | TASK_002 | pending |
| TASK_011 | Integration tests for [feature] | QA | L | TASK_010 | pending |

### Documentation Tasks

| ID | Task | Phase | Estimate | Depends On | Status |
|----|------|-------|----------|------------|--------|
| TASK_020 | Update API docs | docs | S | TASK_002 | pending |

---

## Critical Path

```
TASK_001 ──► TASK_002 ──► TASK_010 ──► TASK_011
                │
                └──► TASK_003 ──► [IC Validation]
```

**Longest Path:** TASK_001 → TASK_002 → TASK_010 → TASK_011
**Estimated Duration:** [X] hours

---

## Effort Summary

| Phase | Tasks | Total Estimate |
|-------|-------|----------------|
| PC | [N] | [X] hours |
| IC | [N] | [X] hours |
| QA | [N] | [X] hours |
| docs | [N] | [X] hours |
| **Total** | **[N]** | **[X] hours** |

---

## Dependencies

### External Dependencies

| Dependency | Type | Status | Blocker? |
|------------|------|--------|----------|
| [External API] | API | Available | No |
| [Library upgrade] | Package | Pending | Yes |

### Internal Dependencies

| Task | Depends On | Reason |
|------|------------|--------|
| TASK_002 | TASK_001 | [Needs component from TASK_001] |
| TASK_010 | TASK_002 | [Needs implementation to test] |

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk 1] | High | Medium | [Mitigation strategy] |
| [Risk 2] | Medium | Low | [Mitigation strategy] |

---

## Approval

**Team Review:**
- [ ] All tasks have clear descriptions
- [ ] Estimates are realistic
- [ ] Dependencies are correct
- [ ] Critical path is acceptable
- [ ] Risks are mitigated

**Approved By:** [Name]
**Approved At:** [YYYY-MM-DD]

---

> **Next Steps:**
> 1. Get Team approval on this plan
> 2. Update Release context with tasks: `tasks:` section
> 3. Transition to PC phase
> 4. Start with tasks on critical path

---

## Workflow: PLAN_FINALIZE Phase

> **Input:** Approved BC_delta + AC_delta
> **Output:** `docs/releases/v{X.Y.Z}/PLAN_FINALIZE_{tool}_v{X}_{Y}_{Z}.md`

### Steps

1. Review approved BC/AC deltas
2. Decompose into tasks
3. Estimate each task
4. Add tasks to RELEASE context
5. Get Team approval
6. Transition to PC

### Validators

| Validator | Description |
|-----------|-------------|
| `plan_has_tasks` | At least one task in tasks section |
| `tasks_estimated` | All tasks have estimates |

### Skip Checklist

**Skip allowed if ALL TRUE:**
- [ ] BC_delta and AC_delta were skipped
- [ ] Single obvious task (1 file, 1 change)
- [ ] No decomposition needed

**Skip FORBIDDEN if ANY TRUE:**
- [ ] Changes affect > 3 files
- [ ] Dependencies between changes exist
- [ ] Coordination with other components required

### Transition

**PLAN_FINALIZE → PC** (requires Team approval)
