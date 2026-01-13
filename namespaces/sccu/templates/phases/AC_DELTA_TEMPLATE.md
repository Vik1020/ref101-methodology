<!--
INSTRUCTIONS: Before using this template

1. Replace all [placeholders] with actual values:
   - context_id: AC_delta_v{X_Y_Z}_{domain} → AC_delta_v1_9_0_ui
   - release_target: v{X.Y.Z} → v1.9.0
   - based_on: AC_delta_v{prev}_{domain} → AC_delta_v1_8_0_ui
   - target_domain: AC_DOMAIN_{domain} → AC_DOMAIN_ui

2. Fill in the changes section with Use Cases, API, and Data Model changes

3. Document each change with full technical details

4. Remove this instruction block after filling in all values

See also:
- Living Documentation Guide: specifications/guides/methodology/LIVING_DOCUMENTATION.md
- YAML formatting guide: specifications/guides/standards/development/YAML_FRONTMATTER_GUIDE.md

PHASE RULES (this template is SSOT for AC_delta phase):
- Validators, skip conditions, and transitions are defined in frontmatter below
- PCC reads these rules directly from this template
-->

---
context_id: AC_delta_v[X_Y_Z]_[domain]  # Example: AC_delta_v1_9_0_ui
type: analytical_delta                  # Don't change
version: "1.0.0"                        # Delta document version
status: draft                           # draft | active | deprecated
release_target: v[X.Y.Z]                # Example: v1.9.0 - product release
based_on: AC_delta_v[prev]_[domain]     # Previous delta in chain (null for first)
target_domain: AC_DOMAIN_[domain]       # Domain this delta applies to
related_bc_delta: BC_delta_v[X_Y_Z]_[domain]  # Corresponding BC delta
created_at: 2026-01-04                  # REPLACE with current date

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE RULES (SSOT) - PCC reads these directly from this template
# ═══════════════════════════════════════════════════════════════════════════════
phase: AC_delta
output_file: "docs/releases/v{X.Y.Z}/AC_delta_{tool}_{feature}.md"
output_file_mandatory: true
validators:
  - id: ac_has_use_cases
    description: At least one Use Case defined
  - id: ac_based_on_bc
    description: related_bc_delta field filled
  - id: output_file_exists
    description: Output file exists at specified path
skip_allowed:
  - BC_delta was skipped (no business changes)
  - No changes to Use Cases
  - No changes to API contracts (request/response)
  - No changes to Data Models
  - Pure internal logic refactoring
skip_forbidden:
  - API endpoint change (path, method, params)
  - Request/response structure change
  - Data schema change (DB, state)
  - New Use Case
  - Existing Use Case flow change
transition:
  requires_approval: true
  approver: Tech Lead
  next_phase: PLAN_FINALIZE
# ═══════════════════════════════════════════════════════════════════════════════

changes:
  added:
    - id: UC[XXX]_[use_case_name]        # Use Case ID (Example: UC025_toggle_dark_mode)
      name: "[Use Case Name]"
      actor: "[Actor Name]"
    - id: API_[method]_[endpoint]        # API endpoint (Example: API_POST_queue_validate)
      name: "[Endpoint Name]"
      method: "[HTTP Method]"
      path: "[Path]"
  modified:
    - id: UC[XXX]_[use_case_name]
      change: "[What changed in this Use Case]"
    - id: API_[method]_[endpoint]
      change: "[What changed in this API]"
  deprecated:
    - id: UC[XXX]_[use_case_name]
      reason: "[Why deprecated]"
      replaced_by: UC[XXX]_[new]
  removed: []
checklist:                             # LLM-readable checklist for session recovery
  structure:
    - item: "Overview filled"
      status: pending                  # pending | done
    - item: "Related BC_delta linked"
      status: pending
    - item: "Changes section complete"
      status: pending
  content:
    - item: "Use Cases documented (Main Flow, Alt Flows, Errors)"
      status: pending
    - item: "API Changes documented (Request/Response)"
      status: pending
    - item: "Data Model Changes documented"
      status: pending
  quality:
    - item: "Impact Analysis complete"
      status: pending
    - item: "Testing Requirements listed"
      status: pending
    - item: "Rollback Information documented"
      status: pending
    - item: "Ready for Tech Lead review"
      status: pending
---

# AC Delta: v[X.Y.Z]

> **Release:** v[X.Y.Z]
> **Domain:** [Domain Name]
> **Date:** [YYYY-MM-DD]
> **Related BC Delta:** [BC_delta_v{X_Y_Z}_{domain}](../BC_delta_v{X_Y_Z}_{domain}.md)

## Overview

[Brief summary of analytical changes - Use Cases, APIs, Data Models affected]

---

## Added Use Cases

### UC[XXX]: [Use Case Name]

**Actor:** [Who performs this action]
**Preconditions:**
- [Condition 1]
- [Condition 2]

**Main Flow:**
1. [Actor] [does action]
2. System [validates/processes]
3. System [returns result]
4. [Final state]

**Alternative Flows:**
- **AF1:** If [condition], then [alternative path]

**Postconditions:**
- [State after completion]

**Business Rules Applied:**
- BR-[X] from BC_delta_v[X_Y_Z]_[domain]

**Error Handling:**
- [Error condition] → [Error response]

---

## Modified Use Cases

### UC[XXX]: [Use Case Name] (modified)

**Previous Flow:**
1. [Old step 1]
2. [Old step 2]

**New Flow:**
1. [New step 1]
2. **[NEW]** [Added step]
3. [Updated step]

**Reason for Change:**
[Why this Use Case was modified]

**Backward Compatibility:**
- [Compatible/Breaking]
- [Migration notes if breaking]

---

## Deprecated Use Cases

### UC[XXX]: [Use Case Name] (deprecated)

**Deprecated Since:** v[X.Y.Z]
**Replaced By:** UC[XXX]_[new_use_case]
**Removal Planned:** v[X.Y.Z]

**Migration:**
- Use [new Use Case] instead
- [Specific migration steps]

---

## API Changes

### Added Endpoints

#### [METHOD] /api/[path] (NEW)

**Description:** [What this endpoint does]

**Request:**
```json
{
  "field": "type",
  "required_field": "value"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "field": "value"
  }
}
```

**Validation Rules:**
- `field`: [Validation rule]
- `required_field`: [Validation rule]

**Error Responses:**
| Code | Description | When |
|------|-------------|------|
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Not authenticated |
| 404 | Not Found | Resource not found |

**Rate Limiting:** [If applicable]

---

### Modified Endpoints

#### [METHOD] /api/[path] (modified)

**Previous Behavior:**
- [How it worked before]

**New Behavior:**
- [How it works now]

**Request Changes:**
```diff
{
  "existing_field": "type",
+ "new_field": "type",        // Added in v[X.Y.Z]
- "removed_field": "type"     // Removed in v[X.Y.Z]
}
```

**Response Changes:**
```diff
{
+ "new_data": {...},
  "existing_data": {...}
}
```

**Backward Compatibility:**
- [Compatible/Breaking]
- [Version header if needed]

---

### Deprecated Endpoints

#### [METHOD] /api/[path] (deprecated)

**Deprecated Since:** v[X.Y.Z]
**Sunset Date:** v[X.Y.Z]
**Replacement:** [METHOD] /api/[new_path]

**Migration Guide:**
1. Update client to use new endpoint
2. [Specific migration steps]

---

## Data Model Changes

### Added Models

```typescript
/**
 * [Model Name]
 * Added in v[X.Y.Z]
 * Purpose: [What this model represents]
 */
interface [ModelName] {
  id: string;
  field: Type;
  createdAt: Date;
}
```

### Modified Models

```typescript
/**
 * [Model Name] - Modified in v[X.Y.Z]
 */
interface [ModelName] {
  id: string;
  existingField: Type;
  newField: Type;      // Added in v[X.Y.Z]
  // removedField: Type; // Removed in v[X.Y.Z]
}
```

**Migration Notes:**
- [Data migration required: yes/no]
- [Migration script: path/to/script]

---

## Impact Analysis

### Affected Components

| Component | File | Change Required |
|-----------|------|-----------------|
| [Component 1] | [path/to/file] | [What to update] |
| [Component 2] | [path/to/file] | [What to update] |

### Testing Requirements

- [ ] Unit tests for new Use Cases
- [ ] Integration tests for new APIs
- [ ] Contract tests for modified endpoints
- [ ] Data migration tests

---

## Rollback Information

**Can Rollback:** Yes/No
**Data Migration Rollback:** [Reversible/Irreversible]

**Rollback Steps:**
1. [Step 1]
2. [Step 2]

---

> **Next Steps:**
> 1. Apply this delta: `pcc apply-delta AC_delta_v[X_Y_Z]_[domain].md --domain=[domain]`
> 2. Update PC contexts with new Use Cases
> 3. Implement API changes
> 4. Validate: `pcc validate-domains --domain=[domain]`

---

## Workflow: AC_delta Phase

> **Input:** Approved BC_delta
> **Output:** `docs/releases/v{X.Y.Z}/AC_delta_{domain}.md`

### Steps

1. Create AC_delta file from AC_DELTA_TEMPLATE.md
2. Link to related BC_delta
3. Document Use Cases, API changes, Data Model changes
4. Complete Impact Analysis
5. Get Tech Lead approval
6. Transition to PLAN_FINALIZE

### Validators

| Validator | Description |
|-----------|-------------|
| `ac_has_use_cases` | At least one Use Case defined |
| `ac_based_on_bc` | related_bc_delta field filled |

### Skip Checklist

**Skip allowed if ALL TRUE:**
- [ ] BC_delta was skipped (no business changes)
- [ ] No changes to Use Cases
- [ ] No changes to API contracts (request/response)
- [ ] No changes to Data Models
- [ ] Pure internal logic refactoring

**Skip FORBIDDEN if ANY TRUE:**
- [ ] API endpoint change (path, method, params)
- [ ] Request/response structure change
- [ ] Data schema change (DB, state)
- [ ] New Use Case
- [ ] Existing Use Case flow change

### Transition

**AC_DRAFT → AC_APPROVED** (requires Tech Lead approval)
