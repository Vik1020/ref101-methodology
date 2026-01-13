<!--
INSTRUCTIONS: Before using this template

1. Replace all [placeholders] with actual values:
   - context_id: APPLY_DELTAS_v{X_Y_Z} (e.g., APPLY_DELTAS_v1_9_0)
   - release: RELEASE_v{X_Y_Z}_{feature}

2. Apply all BC_delta and AC_delta to their respective DOMAIN files

3. Verify that domain files reflect all changes from deltas

4. Remove this instruction block after completing

See also:
- Workflow: specifications/WORKFLOW.md (Subprocess: APPLY_DELTAS)
- Living Documentation: specifications/guides/methodology/LIVING_DOCUMENTATION.md

PHASE RULES (this template is SSOT for APPLY_DELTAS phase):
- Validators, skip conditions, and transitions are defined in frontmatter below
- PCC reads these rules directly from this template
-->

---
context_id: APPLY_DELTAS_v[X_Y_Z]          # Example: APPLY_DELTAS_v1_9_0
type: apply_deltas                         # Don't change
version: "1.0.0"                           # Document version
release: RELEASE_v[X_Y_Z]_[feature]        # Link to Release context
status: pending                            # pending | in_progress | completed
created_at: 2026-01-07                     # REPLACE with current date
completed_at: null                         # Set when deltas are applied

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE RULES (SSOT) - PCC reads these directly from this template
# ═══════════════════════════════════════════════════════════════════════════════
phase: APPLY_DELTAS
output_file: "docs/releases/v{X.Y.Z}/APPLY_DELTAS_{tool}_v{X}_{Y}_{Z}.md"
output_file_mandatory: false               # Optional - deltas can be applied without artifact
validators:
  - id: deltas_applied
    description: BC/AC deltas applied to DOMAIN files
  - id: output_file_exists
    description: Output file exists at specified path
skip_allowed:
  - BC_delta and AC_delta were skipped
  - No changes to domain-level documentation
skip_forbidden:
  - BC_delta was created and must be applied to BC_DOMAIN
  - AC_delta was created and must be applied to AC_DOMAIN
  - Refactoring affected structure described in AC
transition:
  requires_approval: false
  approver: null
  next_phase: DEPLOYED
# ═══════════════════════════════════════════════════════════════════════════════

applied_deltas:
  bc_deltas:
    - delta_id: BC_delta_v[X_Y_Z]_[domain]
      target_domain: BC_DOMAIN_[domain]
      status: pending                      # pending | applied | skipped
      applied_at: null
  ac_deltas:
    - delta_id: AC_delta_v[X_Y_Z]_[domain]
      target_domain: AC_DOMAIN_[domain]
      status: pending
      applied_at: null
---

# APPLY_DELTAS: [Feature Name] v[X.Y.Z]

## Summary

This document tracks the application of BC/AC deltas to their respective DOMAIN files.

---

## Applied Deltas

### BC_delta → BC_DOMAIN

| Delta | Target Domain | Status | Applied At |
|-------|---------------|--------|------------|
| BC_delta_v[X_Y_Z]_[domain] | BC_DOMAIN_[domain] | pending | - |

### AC_delta → AC_DOMAIN

| Delta | Target Domain | Status | Applied At |
|-------|---------------|--------|------------|
| AC_delta_v[X_Y_Z]_[domain] | AC_DOMAIN_[domain] | pending | - |

---

## Verification

- [ ] BC_DOMAIN reflects all changes from BC_delta
- [ ] AC_DOMAIN reflects all changes from AC_delta
- [ ] No conflicts with existing domain content
- [ ] Cross-references updated (if any)

---

## Notes

<!-- Add any notes about the delta application process -->
