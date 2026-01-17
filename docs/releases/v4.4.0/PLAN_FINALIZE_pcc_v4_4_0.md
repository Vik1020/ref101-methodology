# PLAN_FINALIZE: SSOT Glossaries for Methodologies

**Release:** v4.4.0
**Date:** 2026-01-17
**Status:** Approved

---

## Tasks

| ID | Title | File | Complexity |
|----|-------|------|------------|
| T1 | Create meta/GLOSSARY.md with 8 basic elements | meta/GLOSSARY.md | Medium |
| T2 | Migrate core/GLOSSARY.md to namespaces/sccu/ | namespaces/sccu/GLOSSARY.md | High |
| T3 | Create namespaces/node-hub/GLOSSARY.md | namespaces/node-hub/GLOSSARY.md | Low |
| T4 | Update meta/README.md (remove Appendix A, add link) | meta/README.md | Medium |
| T5 | Delete core/GLOSSARY.md | core/GLOSSARY.md | Low |
| T6 | Update core/QUICK_REFERENCE.md links | core/QUICK_REFERENCE.md | Low |

---

## Task Details

### T1: Create meta/GLOSSARY.md
**Source:** meta/README.md Приложение A (строки 1543-1559)
**Terms to include:**
1. State - Именованная фаза жизненного цикла Entity
2. Actor - Исполнитель (Human/AI/System) с набором Tools
3. Tool - Инструмент для выполнения Action
4. Action - Единица работы, изменяющая Entity или создающая Fact
5. Entity - Бизнес-объект, проходящий через States
6. Artifact - Файл/документ, привязанный к Entity
7. Fact - Неизменяемое событие, триггер перехода
8. Rule - Логическое условие, ограничивающее процесс

**Additional terms from Appendix A:**
9. Bounded Context
10. Event Storming
11. Guard
12. Compensation
13. Saga

### T2: Migrate SCCU Glossary
**Source:** core/GLOSSARY.md (706 lines)
**Target:** namespaces/sccu/GLOSSARY.md
**Actions:**
1. Copy full content
2. Add inheritance section at top
3. Update version to 2.0.0
4. Update Last Updated date

### T3: Create Node Hub Glossary
**Template-based creation with:**
- Inheritance section
- Empty sections for future terms
- Version 1.0.0

### T4: Update meta/README.md
**Changes:**
- Remove lines 1541-1766 (Приложение A: Глоссарий and below)
- Add link: `- [A. Глоссарий](GLOSSARY.md)`

### T5: Delete core/GLOSSARY.md
**Pre-check:** Ensure namespaces/sccu/GLOSSARY.md is created
**Action:** `rm core/GLOSSARY.md`

### T6: Update core/QUICK_REFERENCE.md
**Change:** Line 188
- From: `Glossary: specifications/GLOSSARY.md`
- To: `Glossary: ../namespaces/sccu/GLOSSARY.md`

---

## Dependencies

```
T1 ─────────────────────────────────┐
                                    ├──► T4 (update README)
T2 (migrate SCCU) ──► T5 (delete) ──┤
                                    └──► T6 (update links)
T3 (node-hub) ──────────────────────┘
```

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Broken links | Medium | Grep "GLOSSARY" before commit |
| Missing terms | High | Compare line counts |
| Format inconsistency | Low | Use template |

---

## Verification

After implementation:
```bash
# Check files exist
ls -la meta/GLOSSARY.md
ls -la namespaces/sccu/GLOSSARY.md
ls -la namespaces/node-hub/GLOSSARY.md

# Check old file deleted
! test -f core/GLOSSARY.md

# Check no broken links
grep -r "core/GLOSSARY" --include="*.md" | wc -l  # Should be 0
```
