<!--
INSTRUCTIONS: Before using this template

1. Replace all [placeholders] with actual values:
   - context_id: RELEASE_v{major}_{minor}_{patch}_{feature} (e.g., RELEASE_v1_0_0_web_ui)
   - version: "{major}.{minor}.{patch}" (e.g., "1.0.0")
   - {feature_name}: Replace with descriptive feature name

2. Choose a unique context_id following the pattern: RELEASE_v{M}_{m}_{p}_{feature}
   - Only letters (a-z, A-Z), numbers, and underscores allowed
   - NO hyphens, NO braces, NO brackets

3. Choose workflow process (v1.13.1):
   - process_id: feature_full (default, 9 phases with BC/AC)
   - process_id: bugfix_simple (5 phases, skip BC/AC)
   - process_id: custom_process (your project-specific process)
   - See: specifications/processes/README.md for all available processes

4. Update milestones with actual target dates

5. Use checklist to track progress (LLM can resume work after session interruption)

6. LLM MUST update workflow_state, phase_history, transition_log as work progresses
   - See specifications/SYSTEM_PROMPT.md "Workflow Progress Recording" section

7. Remove this instruction block after filling in all values

See also:
- Workflow: specifications/WORKFLOW.md
- YAML formatting guide: specifications/guides/standards/development/YAML_FRONTMATTER_GUIDE.md
- Error reference: specifications/guides/standards/testing/ERROR_MESSAGES_REFERENCE.md

PHASE RULES (this template is SSOT for RELEASE phase):
- Validators, skip conditions, and transitions are defined in frontmatter below
- PCC reads these rules directly from this template
-->

---
context_id: RELEASE_v[major]_[minor]_[patch]_[feature]
version: "[major].[minor].[patch]"   # Keep quotes! E.g., "1.0.0"
type: release
status: planning                      # planning | development | validation | released

# ═══════════════════════════════════════════════════════════════════════════════
# PROCESS COMPOSER (v1.13.1) - Specify which workflow process to use
# ═══════════════════════════════════════════════════════════════════════════════
process_id: feature_full              # feature_full | bugfix_simple | custom_process
process_version: "1.0.0"              # Version of process definition
# ═══════════════════════════════════════════════════════════════════════════════

release_date: null                    # Auto-populated from git tag (optional)

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE RULES (SSOT) - PCC reads these directly from this template
# ═══════════════════════════════════════════════════════════════════════════════
phase: RELEASE
output_file: "docs/releases/v{X.Y.Z}/RELEASE_v{X}_{Y}_{Z}_{feature}.md"
output_file_mandatory: true
validators:
  - id: release_has_problem
    description: Problem Statement filled
  - id: release_has_scope
    description: At least one BC/AC in scope
  - id: release_has_milestones
    description: All milestones have target_date
  - id: output_file_exists
    description: Output file exists at specified path
skip_allowed:
  - Change < 10 lines of code
  - No new functionality
  - Critical production hotfix
skip_forbidden:
  - New feature (requires scope planning)
  - Changes span multiple components/files
  - Breaking change in API/contracts
transition:
  requires_approval: false
  next_phase: BC_DRAFT
# ═══════════════════════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════════════════════
# WORKFLOW STATE - tracks progress across sessions (LLM updates this)
# ═══════════════════════════════════════════════════════════════════════════════
workflow_state:
  current_phase: RELEASE             # Current workflow phase
  started_at: null                   # ISO timestamp when release started

# Phase history with validator results (audit trail)
phase_history: []
  # - phase: RELEASE
  #   entered_at: 2026-01-05T10:00:00+03:00
  #   exited_at: 2026-01-05T10:30:00+03:00
  #   validators:
  #     release_has_problem:
  #       status: passed             # passed | failed | skipped
  #       reason: null               # Explanation if failed
  #     release_has_scope:
  #       status: passed
  #       reason: null
  #   skipped: false
  #   skip_reason: null

# Transition log with approvals (audit trail)
transition_log: []
  # - from: RELEASE
  #   to: BC_DRAFT
  #   timestamp: 2026-01-05T10:30:00+03:00
  #   approval_by: null              # null = no approval required
  #   approval_note: null
# ═══════════════════════════════════════════════════════════════════════════════

scope:
  - BC_[domain]_[feature]             # Business Context
  - AC_[domain]_[feature]             # Analytical Context
  - PC_[module]_[component]           # Programmatic Context (optional)
milestones:
  - name: Release Plan
    target_date: YYYY-MM-DD
    status: pending                   # pending | in_progress | done
  - name: BC Approval
    target_date: YYYY-MM-DD
    status: pending
  - name: AC Approval
    target_date: YYYY-MM-DD
    status: pending
  - name: PLAN_FINALIZE
    target_date: YYYY-MM-DD
    status: pending
  - name: PC Implementation
    target_date: YYYY-MM-DD
    status: pending
  - name: IC Validation
    target_date: YYYY-MM-DD
    status: pending
  - name: QA Testing
    target_date: YYYY-MM-DD
    status: pending
  - name: APPLY_DELTAS
    target_date: YYYY-MM-DD
    status: pending
  - name: Deploy
    target_date: YYYY-MM-DD
    status: pending
tracker:
  issue_key: null                     # Set after pcc sync
tasks: []                             # Task list for PLAN_FINALIZE phase
checklist:                            # LLM-readable checklist for session recovery
  pre_release:
    - item: "All BC contexts approved"
      status: pending                 # pending | done
    - item: "All AC contexts approved"
      status: pending
    - item: "All PC contexts implemented"
      status: pending
    - item: "self_testing.status = passed"
      status: pending
    - item: "Integration tests passing"
      status: pending
    - item: "No pending cascade updates"
      status: pending
  release_day:
    - item: "All changes merged to main"
      status: pending
    - item: "Create git tag"
      status: pending
    - item: "Close Release Epic in Tracker"
      status: pending
    - item: "Notify stakeholders"
      status: pending
  post_release:
    - item: "Monitor error rates (24h)"
      status: pending
    - item: "Review user feedback"
      status: pending
    - item: "Update roadmap"
      status: pending
---

# Release v[version]: [Feature Name]

## Problem Statement

[What problem does this release solve? What business need does it address?]

| # | Problem | Impact |
|---|---------|--------|
| 1 | [Problem description] | [Business/user impact] |
| 2 | [Problem description] | [Business/user impact] |

## Solution

[Brief description of the solution approach]

## Scope

| Context | Type | Description |
|---------|------|-------------|
| BC_[domain]_[feature] | Business | [What business goals it defines] |
| AC_[domain]_[feature] | Analytical | [What use cases/contracts it defines] |
| PC_[module]_[component] | Programmatic | [What code it implements] |

## Plan vs Actual

| Milestone | Planned | Actual | Status |
|-----------|---------|--------|--------|
| BC Approval | YYYY-MM-DD | - | pending |
| AC Approval | YYYY-MM-DD | - | pending |
| PLAN_FINALIZE | YYYY-MM-DD | - | pending |
| PC Implementation | YYYY-MM-DD | - | pending |
| IC Validation | YYYY-MM-DD | - | pending |
| QA Testing | YYYY-MM-DD | - | pending |
| APPLY_DELTAS | YYYY-MM-DD | - | pending |
| Deploy | YYYY-MM-DD | - | pending |

## Technical Decisions

| Question | Answer |
|----------|--------|
| [Decision point 1] | [Chosen approach and rationale] |
| [Decision point 2] | [Chosen approach and rationale] |

## Files to Modify

| File | Changes |
|------|---------|
| [path/to/file.ts] | [Description of changes] |
| [path/to/file.md] | [Description of changes] |

## Success Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

---

## Changelog

### v[version] - YYYY-MM-DD

**Changes:**
- [Change 1]
- [Change 2]

**Files Modified:**
- [file1]
- [file2]

---

## Workflow: RELEASE Phase

> **Input:** User request for new release
> **Output:** `docs/releases/v{X.Y.Z}/RELEASE_v{X}_{Y}_{Z}_{feature}.md`

### Steps

1. Create release file from RELEASE_TEMPLATE.md
2. Fill Problem Statement and Solution
3. Define Scope (BC_delta, AC_delta, PC contexts)
4. Set milestone target dates
5. Transition to BC_DRAFT

### Validators

| Validator | Description |
|-----------|-------------|
| `release_has_problem` | Problem Statement filled |
| `release_has_scope` | At least one BC/AC in scope |
| `release_has_milestones` | All milestones have target_date |

### Skip Checklist

**Skip allowed if ALL TRUE:**
- [ ] Change < 10 lines of code
- [ ] No new functionality
- [ ] Critical production hotfix

**Skip FORBIDDEN if ANY TRUE:**
- [ ] New feature (requires scope planning)
- [ ] Changes span multiple components/files
- [ ] Breaking change in API/contracts

### Transition

**RELEASE → BC_DRAFT** (no approval required)

---

## Workflow Progress Tracking

> **Important:** LLM updates these fields as work progresses. PCC reads them for UI display.

### workflow_state
Current phase and start timestamp. Updated on each phase transition.

### phase_history
Audit trail of completed phases with:
- `validators`: Result of each validator (passed/failed/skipped + reason)
- `skipped`: Whether phase was skipped via Skip Checklist
- `entered_at`/`exited_at`: Timestamps for duration tracking

### transition_log
Record of all phase transitions with:
- `from`/`to`: Source and target phases
- `approval_by`: Who approved (if requires_approval: true)
- `approval_note`: Optional context for approval decision
