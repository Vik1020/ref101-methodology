# Quick Reference

**Version:** 1.3.0
**Last Updated:** 2026-01-05

Краткий справочник для Claude - загружается вместо полных specifications/ (экономия ~8,000 токенов).

---

## Mandatory ICs (P0 - блокируют deployment)

1. **IC_security_input_sanitization** - Use DOMPurify for HTML, validate forms, NO XSS
2. **IC_security_api_communication** - HTTPS, env vars for secrets, NO hardcoded keys
3. **IC_a11y_standards** - WCAG 2.1 AA, keyboard navigation, ARIA, color contrast ≥ 4.5:1
4. **IC_performance_budgets** - LCP < 2.5s, bundle < 50KB, code splitting
5. **IC_monitoring_logging** - Structured logs, error tracking, NO sensitive data

Full docs: `specifications/infrastructure/`

---

## Workflow (MANDATORY)

> **Full documentation:** [WORKFLOW.md](WORKFLOW.md)

**Phases:** RELEASE → BC → AC → PLAN → PC → IC → QA → APPLY → DEPLOY

**Approvals required:** BC, AC, PLAN, QA

| Phase | Location |
|-------|----------|
| RELEASE | `docs/releases/` |
| BC_delta | `docs/releases/v{X}/BC_delta_*.md` |
| AC_delta | `docs/releases/v{X}/AC_delta_*.md` |
| PC | `src/*/context.md` |
| DOMAIN (SSOT) | `docs/domains/BC_DOMAIN_*.md`, `docs/domains/AC_DOMAIN_*.md` |

**Delta = working document** until APPLY_DELTAS. User MUST approve BC, AC, PLAN_FINALIZE, QA.

### Mandatory Artifacts

Each phase creates a file. **Location:** See template → `output_file` field.

**Example (v1.13.0):**
```
docs/releases/v1.13.0/
├── RELEASE_v1_13_0_pcc_ui_cleanup.md
├── BC_delta_pcc_ui_cleanup.md
├── AC_delta_pcc_ui_cleanup.md
├── PLAN_FINALIZE_v1_13_0.md
├── IC_VALIDATION_v1_13_0.md
└── QA_pcc_v1_13_0.md                ← MUST CREATE!
```

**Templates:** [WORKFLOW → Phase Details](WORKFLOW.md#phase-details)

---

## P0 Violations (Deployment Blockers)

- Missing IC compliance declarations
- Test coverage < 80%
- XSS vulnerability (dangerouslySetInnerHTML without DOMPurify)
- Hardcoded secrets/API keys
- Accessibility score < 100
- Performance: LCP ≥ 2.5s or bundle ≥ 50KB

---

## Context.md Template

```yaml
---
context_id: PC_[section]_[slug]
version: "1.0.0"
type: programmatic
based_on:
  business_context: { id: "BC_...", version: "1.0.0" }
  analytic_context: { id: "AC_...", version: "1.0.0" }
compliance:
  - IC_security_input_sanitization: "1.0.0"
  - IC_security_api_communication: "1.0.0"
  - IC_a11y_standards: "1.0.0"
  - IC_performance_budgets: "1.0.0"
  - IC_monitoring_logging: "1.0.0"
---
```

Full templates: `specifications/templates/`

---

## Code Review Checklist (Quick)

**Security (P0):**
- [ ] No hardcoded secrets
- [ ] All user input sanitized (DOMPurify)
- [ ] No dangerouslySetInnerHTML without sanitization

**Accessibility (P0):**
- [ ] Keyboard accessible
- [ ] ARIA labels
- [ ] Color contrast ≥ 4.5:1

**Performance (P0):**
- [ ] LCP < 2.5s
- [ ] Bundle < 50KB

**Testing (P0):**
- [ ] Coverage ≥ 80%

Full checklist: `specifications/guides/standards/development/CODE_REVIEW_CHECKLIST.md`

---

## YAML Formatting Quick Rules

### Required Quotes
- ✅ `version: "1.0.0"` (quoted)
- ❌ `version: 1.0.0` (unquoted)

### Date Format
- ✅ `last_updated: 2025-12-21` (YYYY-MM-DD)
- ❌ `last_updated: YYYY-MM-DD` (placeholder)

### Context ID Pattern
- Pattern: `(BC|AC|PC|IC|CCC)_[a-zA-Z_]+`
- ✅ `BC_catalog_main`
- ❌ `BC-catalog-main` (hyphens)
- ❌ `BC_{domain}_{name}` (braces)

**Full guide:** `specifications/guides/standards/development/YAML_FRONTMATTER_GUIDE.md`

---

## Validation Errors Quick Reference

| Error | Cause | Fix |
|-------|-------|-----|
| "No frontmatter found" | Missing `---` markers | Add YAML block at top |
| "Invalid version format" | Unquoted version | Add quotes: `"1.0.0"` |
| "Invalid date: YYYY-MM-DD" | Literal placeholder | Replace with actual date |
| "Invalid context_id" | Wrong pattern | Use BC_[slug] format |
| "Missing compliance" | No IC declarations | Add 5 required ICs |
| "Missing mandatory IC" | Missing one of 5 ICs | Add missing IC to array |

**Full reference:** `specifications/guides/standards/testing/ERROR_MESSAGES_REFERENCE.md`

---

## Living Documentation (10+ Releases)

### When to Use
- Project has 10+ releases
- Multiple BC/AC documents accumulating
- Need single source of truth for current state

### 3-Tier Architecture
```
docs/
├── OVERVIEW.md                    # Tier 1: навигация (~200 строк)
├── domains/
│   ├── BC_DOMAIN_*.md            # Tier 2: BC текущее состояние
│   └── AC_DOMAIN_*.md            # Tier 2: AC текущее состояние
└── deltas/v{X.Y.Z}/              # Tier 3: архив изменений
```

### Commands
```bash
pcc apply-delta <delta-file> --domain=<name>   # Apply changes
pcc validate-domains                            # Check for gaps
pcc rebuild-domain <name>                       # Recovery
```

### Checklist for New Release
- [ ] Create BC_delta + AC_delta for changes
- [ ] Apply delta to domain files
- [ ] Verify applied_deltas in domain files
- [ ] Run `pcc validate-domains`

**Full guide:** `specifications/guides/methodology/LIVING_DOCUMENTATION.md`

---

## Navigation

- Full index: `specifications/INDEX.md`
- Glossary: `specifications/GLOSSARY.md`
- Setup guide: `specifications/SETUP_GUIDE.md`
- All templates: `specifications/templates/`
- All ICs: `specifications/infrastructure/`
- [Progress Tracking](WORKFLOW.md#progress-tracking-v240) — Workflow progress in RELEASE files
