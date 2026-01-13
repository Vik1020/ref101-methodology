<!--
INSTRUCTIONS: Before using this template

1. Replace all [placeholders] with actual values:
   - context_id: BC_delta_v{X_Y_Z}_{domain} → BC_delta_v1_9_0_ui
   - release_target: v{X.Y.Z} → v1.9.0
   - based_on: BC_delta_v{prev}_{domain} → BC_delta_v1_8_0_ui
   - target_domain: BC_DOMAIN_{domain} → BC_DOMAIN_ui

2. Fill in the changes section:
   - added: New features introduced in this version
   - modified: Existing features that changed
   - deprecated: Features marked for removal
   - removed: Features completely removed

3. Document each change with full details in the content sections

4. Remove this instruction block after filling in all values

See also:
- Living Documentation Guide: specifications/guides/methodology/LIVING_DOCUMENTATION.md
- YAML formatting guide: specifications/guides/standards/development/YAML_FRONTMATTER_GUIDE.md

PHASE RULES (this template is SSOT for BC_delta phase):
- Validators, skip conditions, and transitions are defined in frontmatter below
- PCC reads these rules directly from this template
-->

---
context_id: BC_delta_v[X_Y_Z]_[domain]  # Example: BC_delta_v1_9_0_ui
type: business_delta                    # Don't change
version: "1.0.0"                        # Delta document version (not product version)
status: draft                           # draft | active | deprecated
release_target: v[X.Y.Z]                # Example: v1.9.0 - product release this delta belongs to
based_on: BC_delta_v[prev]_[domain]     # Previous delta in chain (null for first version)
target_domain: BC_DOMAIN_[domain]       # Domain this delta applies to (Example: BC_DOMAIN_ui)
created_at: 2026-01-04                  # REPLACE with current date (format: YYYY-MM-DD)

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE RULES (SSOT) - PCC reads these directly from this template
# ═══════════════════════════════════════════════════════════════════════════════
phase: BC_delta
output_file: "docs/releases/v{X.Y.Z}/BC_delta_{tool}_{feature}.md"
output_file_mandatory: true
validators:
  - id: bc_has_goals
    description: At least one goal defined
  - id: bc_has_actors
    description: At least one actor defined
  - id: bc_has_scenarios
    description: At least one scenario per feature
  - id: output_file_exists
    description: Output file exists at specified path
skip_allowed:
  - No changes to business goals
  - No new/modified actors
  - No new/modified scenarios
  - Pure refactoring (no behavior change)
  - Documentation only (README, comments)
  - Configuration only (no behavior impact)
skip_forbidden:
  - New user-facing functionality
  - Change to existing business process
  - Deprecation or removal of functionality
  - Change to access rights / roles
transition:
  requires_approval: true
  approver: Product Owner
  next_phase: AC_DRAFT
# ═══════════════════════════════════════════════════════════════════════════════

changes:
  added:
    - id: F[XXX]_[feature_name]         # Feature ID (Example: F025_dark_mode)
      name: "[Feature Name]"            # Human-readable name
      description: "[Brief description]"
  modified:
    - id: F[XXX]_[feature_name]         # Existing feature ID
      change: "[What changed]"          # Brief description of change
  deprecated:
    - id: F[XXX]_[feature_name]         # Feature being deprecated
      reason: "[Why deprecated]"
      migration: "[How to migrate]"
      removal_version: v[X.Y.Z]         # When it will be removed
  removed: []                           # Features completely removed
checklist:                             # LLM-readable checklist for session recovery
  structure:
    - item: "Overview filled"
      status: pending                  # pending | done
    - item: "Changes section complete (added/modified/deprecated/removed)"
      status: pending
  content:
    - item: "Goals defined for each feature"
      status: pending
    - item: "Actors identified"
      status: pending
    - item: "Scenarios documented"
      status: pending
    - item: "Business Rules documented"
      status: pending
  quality:
    - item: "Impact Analysis complete"
      status: pending
    - item: "Affected Contexts listed"
      status: pending
    - item: "Ready for Product Owner review"
      status: pending
---

# BC Delta: v[X.Y.Z]

> **Release:** v[X.Y.Z]
> **Domain:** [Domain Name]
> **Date:** [YYYY-MM-DD]

## Overview

[Brief summary of changes in this version - 2-3 sentences]

---

## Added Features

### F[XXX]: [Feature Name]

**Domain:** [Domain Name]
**Description:** [What this feature does - 1-2 sentences]

#### Goals
- [Goal 1: Business objective this feature achieves]
- [Goal 2: Value it provides]

#### Actors
- [Actor 1: Who uses this feature]

#### Scenarios
- **S1:** [User does X to achieve Y]
- **S2:** [User does X to achieve Y]

#### Business Rules
- **BR-1:** [Rule description]
- **BR-2:** [Rule description]

---

## Modified Features

### F[XXX]: [Feature Name] (modified)

**Previous Behavior:**
[How feature worked before]

**New Behavior:**
[How feature works now]

**Reason for Change:**
[Why this change was needed]

**Affected Scenarios:**
- S[X]: [Updated scenario description]

---

## Deprecated Features

### F[XXX]: [Feature Name] (deprecated)

**Deprecated Since:** v[X.Y.Z]
**Removal Planned:** v[X.Y.Z]
**Replaced By:** F[XXX]_[new_feature] (if applicable)

**Migration Guide:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

---

## Removed Features

### F[XXX]: [Feature Name] (removed)

**Removed In:** v[X.Y.Z]
**Reason:** [Why removed]
**Alternative:** [What to use instead]

---

## Impact Analysis

### Affected Contexts

| Context | Type | Required Action | Status |
|---------|------|-----------------|--------|
| AC_DOMAIN_[domain] | AC | Add/update Use Cases | Pending |
| PC_[module]_[component] | PC | Implement changes | Pending |

### Dependencies

- **Requires:** [Any prerequisites]
- **Enables:** [What this delta enables]

---

## Rollback Information

**Can Rollback:** Yes/No
**Rollback Steps:**
1. [Step 1]
2. [Step 2]

**Data Migration:** [If any data migration is needed]

---

> **Next Steps:**
> 1. Apply this delta: `pcc apply-delta BC_delta_v[X_Y_Z]_[domain].md --domain=[domain]`
> 2. Create corresponding AC delta: `AC_delta_v[X_Y_Z]_[domain].md`
> 3. Validate: `pcc validate-domains --domain=[domain]`

---

## Workflow: BC_delta Phase

> **Input:** Release scope from RELEASE context
> **Output:** `docs/releases/v{X.Y.Z}/BC_delta_{domain}.md`

### Steps

1. Create BC_delta file from BC_DELTA_TEMPLATE.md
2. Fill changes section (added, modified, deprecated, removed)
3. Document Goals, Actors, Scenarios for each feature
4. Complete Impact Analysis
5. Get Product Owner approval
6. Transition to AC_DRAFT

### Validators

| Validator | Description |
|-----------|-------------|
| `bc_has_goals` | At least one goal defined |
| `bc_has_actors` | At least one actor defined |
| `bc_has_scenarios` | At least one scenario per feature |

### Skip Checklist

**Skip allowed if ALL TRUE:**
- [ ] No changes to business goals
- [ ] No new/modified actors
- [ ] No new/modified scenarios
- [ ] Pure refactoring (no behavior change)
- [ ] Documentation only (README, comments)
- [ ] Configuration only (no behavior impact)

**Skip FORBIDDEN if ANY TRUE:**
- [ ] New user-facing functionality
- [ ] Change to existing business process
- [ ] Deprecation or removal of functionality
- [ ] Change to access rights / roles

### Transition

**BC_DRAFT → BC_APPROVED** (requires Product Owner approval)
