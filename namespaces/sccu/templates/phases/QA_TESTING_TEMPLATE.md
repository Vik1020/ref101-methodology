<!--
INSTRUCTIONS: Before using this template

1. Replace all [placeholders] with actual values:
   - context_id: QA_v{X_Y_Z} (e.g., QA_v1_9_0)
   - release: RELEASE_v{X_Y_Z}_{feature} (e.g., RELEASE_v1_9_0_dark_mode)

2. Execute all test types and document results

3. Ensure coverage >= 80% before requesting approval

4. Get QA Lead approval before transitioning to APPLY_DELTAS

5. For UI changes, capture screenshots using Playwright:
   ```bash
   mkdir -p docs/releases/v{X.Y.Z}/screenshots
   npx playwright screenshot --wait-for-timeout=3000 http://localhost:PORT docs/releases/v{X.Y.Z}/screenshots/main.png
   ```

6. Remove this instruction block after filling in all values

See also:
- Workflow: specifications/WORKFLOW.md (Subprocess: QA)
- Testing Strategy: specifications/guides/standards/testing/TESTING_STRATEGY.md

PHASE RULES (this template is SSOT for QA phase):
- Validators, skip conditions, and transitions are defined in frontmatter below
- PCC reads these rules directly from this template
-->

---
context_id: QA_v[X_Y_Z]                  # Example: QA_v1_9_0
type: qa_testing                         # Don't change
version: "1.0.0"                         # Document version
release: RELEASE_v[X_Y_Z]_[feature]      # Link to Release context
status: pending                          # pending | in_progress | passed | failed
created_at: 2026-01-04                   # REPLACE with current date
completed_at: null                       # Set when QA is complete

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE RULES (SSOT) - PCC reads these directly from this template
# ═══════════════════════════════════════════════════════════════════════════════
phase: QA
output_file: "docs/releases/v{X.Y.Z}/QA_{tool}_v{X}_{Y}_{Z}.md"
output_file_mandatory: true
validators:
  - id: qa_tests_passed
    description: All tests pass
  - id: qa_coverage_met
    description: Coverage >= 80%
  - id: output_file_exists
    description: Output file exists at specified path
skip_allowed:
  - PC and IC were skipped
  - Documentation only changes
skip_forbidden:
  - Any code change requires testing
  - UI changes require visual tests (Playwright)
  - API changes require contract tests
  - Logic changes require unit/integration tests
  - Config changes require smoke tests
transition:
  requires_approval: true
  approver: QA Lead
  next_phase: APPLY_DELTAS
test_matrix:
  ui_component: [unit, integration, visual, smoke]
  api_endpoint: [unit, integration, contract, smoke]
  business_logic: [unit, integration, smoke]
  configuration: [smoke]
  refactoring: [unit, integration, smoke]
# ═══════════════════════════════════════════════════════════════════════════════

test_plan:
  unit_tests:
    status: pending                      # pending | in_progress | passed | failed
    count: 0
    passed: 0
    failed: 0
  integration_tests:
    status: pending
    count: 0
    passed: 0
    failed: 0
  contract_tests:
    status: pending
    count: 0
    passed: 0
    failed: 0
  manual_tests:
    status: pending
    count: 0
    passed: 0
    failed: 0
  visual_tests:
    status: pending
    count: 0
    passed: 0
    failed: 0
    screenshots_dir: null           # e.g., docs/releases/v1.11.1/screenshots/
results:
  total_tests: 0
  passed: 0
  failed: 0
  skipped: 0
  coverage: 0                            # Percentage (e.g., 85)
  critical_bugs: 0
  minor_bugs: 0
checklist:                               # LLM-readable checklist for session recovery
  execution:
    - item: "Unit tests executed"
      status: pending                    # pending | done
    - item: "Integration tests executed"
      status: pending
    - item: "Contract tests executed"
      status: pending
    - item: "Manual tests completed"
      status: pending
    - item: "Visual tests (screenshots) captured"
      status: pending
  validation:
    - item: "Coverage >= 80%"
      status: pending
    - item: "No critical bugs"
      status: pending
    - item: "All failed tests documented"
      status: pending
    - item: "Regression tests passed"
      status: pending
  approval:
    - item: "Test report complete"
      status: pending
    - item: "Ready for QA Lead review"
      status: pending
---

# QA Testing: v[X.Y.Z]

> **Release:** [RELEASE_v{X_Y_Z}_{feature}](../releases/RELEASE_v{X_Y_Z}_{feature}.md)
> **Date:** [YYYY-MM-DD]
> **Status:** [Pending/In Progress/Passed/Failed]

## Overview

[Brief summary of what is being tested and the scope of QA activities]

---

## Test Plan Summary

| Test Type | Total | Passed | Failed | Skipped | Status |
|-----------|-------|--------|--------|---------|--------|
| Unit Tests | [N] | [N] | [N] | [N] | [Status] |
| Integration Tests | [N] | [N] | [N] | [N] | [Status] |
| Contract Tests | [N] | [N] | [N] | [N] | [Status] |
| Manual Tests | [N] | [N] | [N] | [N] | [Status] |
| Visual Tests | [N] | [N] | [N] | [N] | [Status] |
| **Total** | **[N]** | **[N]** | **[N]** | **[N]** | **[Status]** |

---

## Coverage Report

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Line Coverage | [X]% | 80% | [Pass/Fail] |
| Branch Coverage | [X]% | 70% | [Pass/Fail] |
| Function Coverage | [X]% | 80% | [Pass/Fail] |

---

## Unit Tests

### Executed Tests

| Test Suite | Tests | Passed | Failed | Duration |
|------------|-------|--------|--------|----------|
| [Component 1] | [N] | [N] | [N] | [Xs] |
| [Component 2] | [N] | [N] | [N] | [Xs] |

### Failed Tests

| Test | File | Error | Priority |
|------|------|-------|----------|
| [Test name] | [path/to/test.ts] | [Error message] | P[0-2] |

---

## Integration Tests

### Executed Tests

| Test Suite | Tests | Passed | Failed | Duration |
|------------|-------|--------|--------|----------|
| [Feature 1] | [N] | [N] | [N] | [Xs] |
| [Feature 2] | [N] | [N] | [N] | [Xs] |

### Failed Tests

| Test | Endpoint | Error | Priority |
|------|----------|-------|----------|
| [Test name] | [POST /api/endpoint] | [Error message] | P[0-2] |

---

## Contract Tests

### API Contract Validation

| Endpoint | Method | Contract | Status |
|----------|--------|----------|--------|
| /api/[path] | [METHOD] | [Valid/Invalid] | [Pass/Fail] |

---

## Manual Tests

### Test Cases

| ID | Test Case | Steps | Expected | Actual | Status |
|----|-----------|-------|----------|--------|--------|
| MT_001 | [Test case name] | [Steps summary] | [Expected result] | [Actual result] | [Pass/Fail] |
| MT_002 | [Test case name] | [Steps summary] | [Expected result] | [Actual result] | [Pass/Fail] |

---

## Visual Tests (Screenshots)

> **How to capture:** `npx playwright screenshot --wait-for-timeout=3000 <URL> <output.png>`
> **Storage:** `docs/releases/v{X.Y.Z}/screenshots/`

### Captured Screenshots

| ID | Page/Component | URL | Screenshot | Expected | Status |
|----|----------------|-----|------------|----------|--------|
| VS_001 | [Page name] | [URL] | [screenshot.png](./screenshots/screenshot.png) | [What should be visible] | [Pass/Fail] |
| VS_002 | [Component] | [URL] | [component.png](./screenshots/component.png) | [Expected state] | [Pass/Fail] |

### Visual Regression Notes

[Document any visual differences from previous version, UI bugs found, etc.]

---

## Bugs Found

### Critical (P0)

| ID | Bug | Component | Repro Steps | Status |
|----|-----|-----------|-------------|--------|
| BUG_001 | [Bug description] | [Component] | [Steps to reproduce] | [Open/Fixed] |

### Major (P1)

| ID | Bug | Component | Status |
|----|-----|-----------|--------|
| BUG_002 | [Bug description] | [Component] | [Open/Fixed] |

### Minor (P2)

| ID | Bug | Component | Status |
|----|-----|-----------|--------|
| BUG_003 | [Bug description] | [Component] | [Open/Deferred] |

---

## Regression Testing

| Feature | Tests | Status |
|---------|-------|--------|
| [Existing feature 1] | [N] | [Pass/Fail] |
| [Existing feature 2] | [N] | [Pass/Fail] |

---

## Test Environment

| Component | Version | Notes |
|-----------|---------|-------|
| Node.js | [version] | |
| Database | [version] | |
| OS | [version] | |
| Browser | [version] | [For E2E tests] |

---

## Quality Gates

| Gate | Threshold | Actual | Status |
|------|-----------|--------|--------|
| Test Coverage | >= 80% | [X]% | [Pass/Fail] |
| Critical Bugs | 0 | [N] | [Pass/Fail] |
| Failed Tests | 0 | [N] | [Pass/Fail] |
| Regression Failures | 0 | [N] | [Pass/Fail] |

**Overall QA Status:** [PASS/FAIL]

---

## Approval

**QA Lead Review:**
- [ ] All test types executed
- [ ] Coverage threshold met
- [ ] No critical bugs open
- [ ] All failed tests documented
- [ ] Regression tests passed
- [ ] Quality gates satisfied

**Approved By:** [Name]
**Approved At:** [YYYY-MM-DD]

---

> **Next Steps:**
> 1. Fix any remaining bugs
> 2. Re-run failed tests
> 3. Get QA Lead approval
> 4. Transition to APPLY_DELTAS phase
> 5. Run: `pcc apply-delta` commands

---

## Workflow: QA Phase

> **Input:** Validated IC contexts
> **Output:** `docs/releases/v{X.Y.Z}/QA_{tool}_v{X}_{Y}_{Z}.md`

### Steps

1. Create QA testing document
2. Execute test plan
3. Document results
4. Get QA Lead approval
5. Transition to APPLY_DELTAS

### Validators

| Validator | Description |
|-----------|-------------|
| `qa_tests_passed` | All tests pass |
| `qa_coverage_met` | Coverage >= 80% |

### Skip Checklist

**Skip allowed if ALL TRUE:**
- [ ] PC and IC were skipped
- [ ] Documentation only changes

**Skip FORBIDDEN if ANY TRUE:**
- [ ] Any code change requires testing
- [ ] **UI changes** → require visual tests (Playwright)
- [ ] **API changes** → require contract tests
- [ ] **Logic changes** → require unit/integration tests
- [ ] **Config changes** → require smoke tests

### QA Test Matrix

| Change Type | Unit | Integration | Contract | Visual | Smoke |
|-------------|------|-------------|----------|--------|-------|
| UI component | ✓ | ✓ | - | **✓** | ✓ |
| API endpoint | ✓ | ✓ | **✓** | - | ✓ |
| Business logic | **✓** | ✓ | - | - | ✓ |
| Configuration | - | - | - | - | **✓** |
| Refactoring | ✓ | ✓ | - | - | ✓ |

### Transition

**QA_TESTING → APPLY_DELTAS** (requires QA Lead approval)
