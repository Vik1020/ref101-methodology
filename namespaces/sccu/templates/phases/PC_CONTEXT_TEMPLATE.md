<!--
INSTRUCTIONS: Before using this template

1. Replace all [placeholders] with actual values:
   - context_id: PC_[section]_[slug] → PC_catalog_productList, PC_auth_loginForm, etc.
   - last_updated: 2025-12-21 → Use today's date (format: YYYY-MM-DD)

2. Update based_on references:
   - business_context.id → Must reference existing BC (e.g., "BC_catalog_main")
   - analytic_context.id → Must reference existing AC (e.g., "AC_catalog_filters")
   - Both 'id' and 'version' are REQUIRED for each

3. CRITICAL: Compliance field
   - ALL 5 mandatory ICs MUST be declared (see below)
   - This is a P0 requirement - validation will fail if any are missing

4. Update the date with today's date (format: YYYY-MM-DD)

5. Remove this instruction block after filling in all values

See also:
- YAML formatting guide: specifications/guides/standards/development/YAML_FRONTMATTER_GUIDE.md
- Error reference: specifications/guides/standards/testing/ERROR_MESSAGES_REFERENCE.md
- IC specifications: specifications/infrastructure/

PHASE RULES (this template is SSOT for PC phase):
- Validators, skip conditions, and transitions are defined in frontmatter below
- PCC reads these rules directly from this template
-->

---
context_id: PC_[section]_[slug]  # Example: PC_catalog_productList, PC_auth_loginForm
version: "1.0.0"                 # Keep quotes!
type: programmatic               # Don't change - PC contexts are always type: programmatic
status: draft                    # draft | active | deprecated
layer: frontend                  # frontend | backend | shared

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE RULES (SSOT) - PCC reads these directly from this template
# ═══════════════════════════════════════════════════════════════════════════════
phase: PC
output_file: "src/{module}/context.md"
output_file_mandatory: false  # Location varies by component
validators:
  - id: pc_has_implementation
    description: Code exists
  - id: pc_has_5_ics
    description: All 5 mandatory ICs declared
  - id: pc_test_coverage_80
    description: Test coverage >= 80%
skip_allowed:
  - Documentation only (no code)
  - Configuration only (package.json, tsconfig.json)
  - No new components
skip_forbidden:
  - Any new code
  - Any existing code modification
transition:
  requires_approval: false
  next_phase: IC
# ═══════════════════════════════════════════════════════════════════════════════

based_on:
  business_context:
    id: "BC_[domain]_[name]"     # Example: "BC_catalog_main" - Must reference existing BC
    version: "1.0.0"              # Must match actual BC version
  analytic_context:
    id: "AC_[domain]_[name]"     # Example: "AC_catalog_filters" - Must reference existing AC
    version: "1.0.0"              # Must match actual AC version
uses_assets:                     # MANDATORY: Project Assets this PC depends on
  - PA_api_internal: "1.0.0"     # Example: REST API endpoints
  - PA_env_config: "1.0.0"       # Example: Environment variables
  # Add all relevant PA contexts or use empty array: []
dependencies:
  internal:                      # Other PC or CCC contexts used
    - PC_shared_ui_Button
    - PC_shared_icons
    # Keep total dependencies ≤ 7 (internal + external)
  external:                      # External packages
    - "GET /api/data"            # API endpoints (if applicable)
    - "react: ^18.0.0"           # NPM packages with versions
compliance:
  # ⚠️ REQUIRED: All PC contexts MUST declare these 5 ICs (P0 requirement)
  # Missing any will block your commit!
  - IC_security_input_sanitization: "1.0.0"  # XSS protection, DOMPurify, input validation
  - IC_security_api_communication: "1.0.0"   # HTTPS, secure API calls, env vars for secrets
  - IC_a11y_standards: "1.0.0"               # WCAG 2.1 AA compliance, screen readers, keyboard nav
  - IC_performance_budgets: "1.0.0"          # LCP < 2.5s, bundle size limits, lazy loading
  - IC_monitoring_logging: "1.0.0"           # Error tracking, analytics, logging
  # Optional: Add more ICs if applicable
  # - IC_testing_coverage: "1.0.0"
tests:
  unit:
    required: true
    files: ["./__tests__/component.test.tsx"]  # Relative paths to test files
  integration:
    required: false
health:
  documentation_coverage: 100   # 0-100 percentage (target: ≥90%)
  test_coverage: 80             # 0-100 percentage (REQUIRED: ≥80% for PC contexts, P0!)
  dependency_health: green      # green | yellow | red
  last_updated: 2025-12-21      # REPLACE with current date (format: YYYY-MM-DD)
  staleness_days: 0             # Auto-calculated by validator
migration:
  breaking_changes: []
  deprecations: []
  migration_guide: null
self_testing:                    # Claude Self-Testing Protocol (CSP) status
  status: pending                # pending | passed | failed
  last_run: null                 # Date of last test run (YYYY-MM-DD)
  report_path: null              # Path to Self-Testing Report
---

# Component: [Canonical Name]

## Responsibility
[Description of what this component does. Keep it under 50 words. Be specific about the single responsibility.]

**Example:** "Displays a paginated list of products with filtering capabilities. Handles loading states, empty states, and error states. Emits events when user selects a product."

---

## Public Interface

**Props:**
```typescript
interface [ComponentName]Props {
  data: DataType;         // Description of prop
  onAction?: () => void;  // Callback description (optional with ?)
  config?: ConfigType;    // Optional configuration
}
```

**Emits (if applicable):**
- `product-selected(product: Product)` - When user clicks a product
- `filter-changed(filters: FilterState)` - When filters are updated

**Slots (if applicable):**
- `header` - Custom header content
- `footer` - Custom footer content

---

## Scenarios (Mapped from AC)

Map each AC use case to the implementation:

- **UC01:** [Scenario Name from AC] (Handled by `handleAction` method, lines 45-67)
- **UC02:** [Scenario Name from AC] (Handled by `fetchData` method, lines 89-102)

---

## Edge Cases

Document how you handle edge cases:

- **Loading state:** Show skeleton loader while fetching data
- **Error state:** Display error message with retry button
- **Empty state:** Show "No results" message with illustration
- **Offline:** Cache last successful response, show banner when offline
- **Permission denied:** Redirect to login or show access denied message

---

## Compliance Notes

**IC_security_input_sanitization:**
All user inputs are sanitized with DOMPurify before rendering. No `v-html` without sanitization.

**IC_security_api_communication:**
All API calls use HTTPS. API keys stored in environment variables. No hardcoded secrets.

**IC_a11y_standards:**
ARIA labels on interactive elements. Keyboard navigation (Tab, Enter, Escape). Screen reader tested.

**IC_performance_budgets:**
Component bundle < 50KB gzipped. Lazy loaded images. Virtualized list for > 100 items. LCP < 2.5s.

**IC_monitoring_logging:**
Errors logged to Sentry. Analytics events for key user actions. Performance metrics tracked.

---

## Self-Testing Report

> **CSP:** Claude Self-Testing Protocol. See [TESTING_STRATEGY.md Section 8](../guides/standards/testing/TESTING_STRATEGY.md#8-claude-self-testing-protocol)

<!--
Replace this section with actual Self-Testing Report after implementing the component.
Delete the placeholder below and paste the report from Claude.
-->

**Status:** ⏳ Pending

| Check | Status | Notes |
|-------|--------|-------|
| npm test | ⏳ | Not run yet |
| npm run type-check | ⏳ | Not run yet |
| npm run lint | ⏳ | Not run yet |
| npm run build | ⏳ | Not run yet |
| AC Use Case Coverage | ⏳ | Not verified |

---

## Reference Log

> PC contexts use **Reference Log** instead of Migration Log.
> Full changelog is maintained in the source BC/AC contexts.

### v1.0.0 - 2025-12-21 (Initial Version)

**Source:** [AC_domain_name v1.0.0](../analytics/AC_domain_name.md#v100---2025-12-21)

**Changes:** Initial implementation of UC01, UC02 from AC

---

## Workflow: PC Phase

> **Input:** Tasks from PLAN_FINALIZE
> **Output:** `src/*/context.md` files

### Steps

1. Create PC context from template
2. Link to BC/AC contexts
3. Implement component
4. Declare 5 mandatory ICs compliance
5. Run self-testing (CSP)
6. Transition to IC

### Validators

| Validator | Description |
|-----------|-------------|
| `pc_has_implementation` | Code exists |
| `pc_has_5_ics` | All 5 mandatory ICs declared |
| `pc_test_coverage_80` | Test coverage >= 80% |

### Skip Checklist

**Skip allowed if ALL TRUE:**
- [ ] Documentation only (no code)
- [ ] Configuration only (package.json, tsconfig.json)
- [ ] No new components

**Skip FORBIDDEN if ANY TRUE:**
- [ ] Any new code
- [ ] Any existing code modification

### Transition

**PC → IC** (no approval required)
