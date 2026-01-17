<!--
INSTRUCTIONS:
1. Replace IC_[domain]_[name] with actual ID (e.g., IC_security_input_sanitization)
2. Update last_updated with today's date (YYYY-MM-DD)
3. Remove this block after filling

See: specifications/guides/standards/development/YAML_FRONTMATTER_GUIDE.md

PHASE RULES (this template is SSOT for IC phase):
- Validators, skip conditions, and transitions are defined in frontmatter below
- PCC reads these rules directly from this template
-->

---
context_id: IC_[domain]_[name]  # Example: IC_security_input_sanitization
version: "1.0.0"
type: infrastructure
status: active                  # draft | active | deprecated
category: security | accessibility | performance | monitoring | reliability

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE RULES (SSOT) - PCC reads these directly from this template
# ═══════════════════════════════════════════════════════════════════════════════
phase: IC
output_file: "docs/releases/v{X.Y.Z}/IC_VALIDATION_{tool}_v{X}_{Y}_{Z}.md"
output_file_mandatory: true
validators:
  - id: no_p0_violations
    description: No security, a11y, performance issues
  - id: all_ics_validated
    description: All 5 mandatory ICs pass
  - id: output_file_exists
    description: Output file exists at specified path
skip_allowed:
  - PC was skipped (no code changes)
  - Documentation/configuration only
skip_forbidden:
  - Any code change requires validation of 5 mandatory ICs
transition:
  requires_approval: false
  next_phase: QA
# ═══════════════════════════════════════════════════════════════════════════════

applies_to:                     # Which context types this IC applies to
  - programmatic                # All PC contexts (most common)
  - analytical                  # Optional: AC contexts if applicable
enforcement:
  level: mandatory              # mandatory | recommended | optional
  check: pre_commit             # pre_commit | ci_cd | manual
health:
  documentation_coverage: 100
  last_updated: 2025-12-21      # REPLACE with current date (YYYY-MM-DD)
  staleness_days: 0
related_contexts:               # Optional: Related ICs
  - IC_[related_id]
migration:
  breaking_changes: []
  deprecations: []
  migration_guide: null
---

# Infrastructure Context: [Name]

## Purpose
[Brief description of what non-functional requirement this context addresses. Under 50 words.]

---

## Requirements

### Mandatory
1. [Requirement 1 - Be specific and measurable]
2. [Requirement 2]

### Recommended
1. [Best practice 1]

### Optional
1. [Nice-to-have 1]

---

## Compliance Check

**How to verify compliance:**
1. [Step 1 to check]
2. [Step 2 to check]

**Automated checks:**
- [Tool/command to run]

---

## Migration Log

### v1.0.0 - 2025-12-21
**Changes:** Initial definition
**Migration Steps:** N/A
**Affected Contexts:** None

---

## Workflow: IC Phase

> **Input:** PC contexts with compliance declarations
> **Output:** `docs/releases/v{X.Y.Z}/IC_VALIDATION_{tool}_v{X}_{Y}_{Z}.md`

### Steps

1. Validate each IC declaration in PC contexts
2. Run IC-specific validators
3. Check P0 violations (security, a11y, performance)
4. Transition to QA

### Validators

| Validator | Description |
|-----------|-------------|
| `no_p0_violations` | No security, a11y, performance issues |
| `all_ics_validated` | All 5 mandatory ICs pass |

### Skip Checklist

**Skip allowed if ALL TRUE:**
- [ ] PC was skipped (no code changes)
- [ ] Documentation/configuration only

**Skip FORBIDDEN if ANY TRUE:**
- [ ] Any code change requires validation of 5 mandatory ICs:
  - IC_security_input_sanitization
  - IC_security_api_communication
  - IC_a11y_standards
  - IC_performance_budgets
  - IC_monitoring_logging

### Transition

**IC → QA** (no approval, automated)
