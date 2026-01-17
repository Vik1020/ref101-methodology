# AC_delta: SSOT Glossaries for Methodologies

**Release:** v4.4.0
**Date:** 2026-01-17
**Status:** Draft

---

## Use Cases

### UC1: Create Meta Glossary
**Actor:** Methodology Author
**Preconditions:** meta/README.md contains Appendix A with glossary
**Flow:**
1. Extract 8 basic terms from Appendix A
2. Create `meta/GLOSSARY.md` with extended format
3. Add version header, examples, changelog
4. Update meta/README.md to link to new file

**Postconditions:** meta/GLOSSARY.md exists with 8 terms

### UC2: Migrate SCCU Glossary
**Actor:** Methodology Author
**Preconditions:** core/GLOSSARY.md exists (706 lines)
**Flow:**
1. Copy content from core/GLOSSARY.md
2. Create `namespaces/sccu/GLOSSARY.md`
3. Add inheritance section linking to meta/GLOSSARY.md
4. Update version to 2.0.0 (major: location change)

**Postconditions:** namespaces/sccu/GLOSSARY.md contains all SCCU terms

### UC3: Create Node Hub Glossary
**Actor:** Methodology Author
**Preconditions:** namespaces/node-hub/ exists
**Flow:**
1. Create minimal `namespaces/node-hub/GLOSSARY.md`
2. Add inheritance section
3. Add placeholder for future terms

**Postconditions:** namespaces/node-hub/GLOSSARY.md exists

### UC4: Cleanup Old Files
**Actor:** Methodology Author
**Preconditions:** Migration complete
**Flow:**
1. Delete core/GLOSSARY.md
2. Update core/QUICK_REFERENCE.md links
3. Remove Appendix A from meta/README.md

**Postconditions:** No duplicate glossary files

---

## Data Flow

```
meta/GLOSSARY.md (8 базовых элементов)
       │
       ├── extends ──► namespaces/sccu/GLOSSARY.md
       │                    │
       │                    └── (SCCU + A11y + XSS + все из core/)
       │
       └── extends ──► namespaces/node-hub/GLOSSARY.md
                            │
                            └── (Node Hub specific terms)
```

---

## File Structure

### meta/GLOSSARY.md
```yaml
Version: 1.0.0
Terms: 8 (State, Actor, Tool, Action, Entity, Artifact, Fact, Rule)
Format: Extended (definition + examples + see_also)
```

### namespaces/sccu/GLOSSARY.md
```yaml
Version: 2.0.0
Inherits: meta/GLOSSARY.md
Terms: ~70 (migrated from core/GLOSSARY.md)
Sections:
  - Основные концепции (SCCU, Vibe Coding, Four Layers)
  - Типы контекстов (BC, AC, PC, IC, CCC, PA, PDC, EPA)
  - Аббревиатуры (A11y, ARIA, CSP, CSRF, LCP, FID, CLS, PII, XSS)
  - Технические термины
  - Метрики и измерения
  - Процессы разработки
```

### namespaces/node-hub/GLOSSARY.md
```yaml
Version: 1.0.0
Inherits: meta/GLOSSARY.md
Terms: 0 (placeholder)
Status: Ready for extension
```

---

## Contracts

### Glossary File Format
```markdown
# Глоссарий: {Namespace Name}

**Namespace:** {namespace-id}
**Version:** X.Y.Z
**Last Updated:** YYYY-MM-DD

## Наследование
> Расширяет: `{parent}/GLOSSARY.md`

## Быстрый поиск
- [Category 1](#category-1)

## Category 1

### Term
**Full Name**
Definition.
**Примеры:** ...
**См. также:** ...

## Changelog
### vX.Y.Z - YYYY-MM-DD
- Changes
```

### SSOT Validation Rules
| Rule | Check |
|------|-------|
| No duplicates | Each term defined in exactly one file |
| Inheritance valid | Parent file exists and is readable |
| Version format | SemVer (X.Y.Z) |
| Changelog present | ## Changelog section exists |

---

## Dependencies

| From | To | Type |
|------|----|------|
| namespaces/sccu/GLOSSARY.md | meta/GLOSSARY.md | extends |
| namespaces/node-hub/GLOSSARY.md | meta/GLOSSARY.md | extends |
| core/QUICK_REFERENCE.md | namespaces/sccu/GLOSSARY.md | links_to |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Broken links after migration | Grep for "core/GLOSSARY" before commit |
| Missing terms during migration | Diff line count before/after |
| Inconsistent format | Use template for all glossaries |
