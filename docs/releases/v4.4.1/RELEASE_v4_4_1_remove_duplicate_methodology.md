---
context_id: RELEASE_v4_4_1_remove_duplicate_methodology
version: "v4.4.1"
type: release
status: released

# Process Composer (v1.13.1)
process_id: bugfix_simple
process_version: "1.0.0"

# Workflow State
workflow_state:
  current_phase: DEPLOYED
  started_at: "2026-01-17T07:07:12.773Z"

phase_history:
  - phase: RELEASE
    entered_at: "2026-01-17T07:07:12.773Z"
    exited_at: "2026-01-17T07:07:20.290Z"
    validators:
      current_phase_has_history: { status: passed }
      process_allows_direct_pc: { status: passed }
    skipped: false
  - phase: PC_DEVELOPMENT
    entered_at: "2026-01-17T07:07:20.290Z"
    exited_at: "2026-01-17T07:08:02.106Z"
    validators:
    skipped: false
  - phase: IC_VALIDATION
    entered_at: "2026-01-17T07:08:02.106Z"
    exited_at: "2026-01-17T07:08:13.323Z"
    validators:
    skipped: false
  - phase: QA_TESTING
    entered_at: "2026-01-17T07:08:13.323Z"
    exited_at: "2026-01-17T07:08:31.056Z"
    validators:
      current_phase_has_history: { status: passed }
      qa_tests_passed: { status: passed }
      process_allows_direct_deploy: { status: passed }
    skipped: false
  - phase: DEPLOYED
    entered_at: "2026-01-17T07:08:31.056Z"
    exited_at: null
    validators:
    skipped: false

transition_log:
  - from: RELEASE
    to: PC_DEVELOPMENT
    timestamp: "2026-01-17T07:07:20.290Z"
    approval_by: null
  - from: PC_DEVELOPMENT
    to: IC_VALIDATION
    timestamp: "2026-01-17T07:08:02.106Z"
    approval_by: null
  - from: IC_VALIDATION
    to: QA_TESTING
    timestamp: "2026-01-17T07:08:13.323Z"
    approval_by: null
  - from: QA_TESTING
    to: DEPLOYED
    timestamp: "2026-01-17T07:08:31.056Z"
    approval_by: "user"
    approval_note: "QA Lead approved"
---

# Release v4.4.1: remove duplicate methodology

## Problem Statement

Дублирующийся файл /meta/generated/sccu.methodology.yaml - устаревшая версия (631 строк), SSOT находится в /namespaces/sccu/methodology.yaml (1028 строк). Нарушает принцип единого источника истины.

## Solution

(To be defined in BC/AC deltas)

## Scope

| Context | Type | Description |
|---------|------|-------------|
| | | |

## Success Criteria

- [ ] All workflow phases completed
- [ ] Tests passing
- [ ] Documentation updated

---

## Changelog

### v4.4.1 - 2026-01-17

**Changes:**
- Initial release context created
