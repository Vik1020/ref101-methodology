# Documentation Scaling Guide

**Version:** 1.0.0
**Last Updated:** 2025-12-22
**Purpose:** Стратегии масштабирования системы документации SCCU от 10 до 1000+ контекстов

---

## Обзор

Этот документ описывает проверенные паттерны масштабирования документации при росте проекта:

**Масштаб проекта:**
- 🟢 **Small** - 10-50 контекстов, 1-3 разработчика
- 🟡 **Medium** - 50-200 контекстов, 3-10 разработчиков
- 🔴 **Large** - 200+ контекстов, 10+ разработчиков

**Ключевые проблемы при масштабировании:**
1. Разрастание доменов (domain proliferation)
2. Рост размеров файлов (file size bloat)
3. Дублирование контента (content duplication)
4. Сложность навигации (navigation complexity)
5. Битые ссылки (broken references)
6. Устаревшая документация (stale docs)

---

## Problem 1: Domain Proliferation

### Симптомы

**Small Scale (not a problem yet):**
- 5-10 доменов, все четко разграничены
- Легко запомнить все домены

**Medium Scale (начинаются проблемы):**
- 15-30 доменов
- Появляются semantic duplicates: `auth` vs `authentication`
- Появляются overly specific domains: `user_login` вместо `authentication`

**Large Scale (critical):**
- 50+ доменов
- Невозможно запомнить все
- Разработчики создают duplicate domains, не зная о существующих
- Semantic overlap > 30% между доменами

### Решение: Domain Registry

**Implement on:** Medium scale (15+ domains)

**Steps:**

1. **Создать DOMAIN_REGISTRY.md**
   - Используйте [DOMAIN_REGISTRY_TEMPLATE.md](../templates/domains/DOMAIN_REGISTRY_TEMPLATE.md)
   - Инвентаризируйте все существующие домены
   - Документируйте scope каждого домена

2. **Установить naming rules**
   - Granularity: domain = functional area (not feature)
   - Avoid abbreviations
   - Singular vs plural conventions
   - Project prefix policy

3. **Внедрить validation**
   - Pre-commit hook: проверка semantic overlap
   - CI check: domain exists in registry
   - Tool: `validate-domain.ts`

4. **Процесс deprecation**
   - Grace period: 6 months
   - Migration guide для каждого deprecated domain
   - Archive старых доменов

**Expected impact:**
- ✅ Semantic duplicates: reduced by 80%
- ✅ Time to find existing domain: reduced from 10 min to 2 min
- ✅ Domain churn: reduced by 60%

---

## Problem 2: File Size Bloat

### Симптомы

**Small Scale (not a problem):**
- Files: 100-200 lines
- Easy to read and edit

**Medium Scale (начинаются проблемы):**
- Some files: 300-500 lines
- Scrolling required, slower to navigate
- Git diffs становятся большими

**Large Scale (critical):**
- Files: 500-1000+ lines
- Hard to find specific section
- Merge conflicts frequent
- IDE slowdown when opening file

### Критерии размера

**Thresholds:**

| Lines | Status | Action |
|-------|--------|--------|
| < 200 | 🟢 Optimal | No action needed |
| 200-400 | 🟡 Warning | Consider decomposition if growing |
| 400-600 | 🟠 Critical | Plan decomposition |
| > 600 | 🔴 Urgent | Decompose immediately |

### Решение: Multi-file Structure

**Implement on:** Files > 400 lines

**Pattern: Stable ID + Multi-file**

**Before:**
```
docs/programmatic/PC_infrastructure_deployment.md (551 lines)
```

**After:**
```
docs/programmatic/PC_infrastructure_deployment/
├── _index.md                    # Main entry point (100 lines)
├── terraform_setup.md           # Terraform configuration (120 lines)
├── deployment_process.md        # CI/CD deployment (100 lines)
├── security.md                  # Security configuration (80 lines)
├── monitoring.md                # Monitoring setup (80 lines)
└── cost_optimization.md         # Cost estimation (70 lines)
```

**_index.md structure:**

```yaml
---
context_id: PC_infrastructure_deployment  # ID STABLE!
version: "2.0.0"                          # Breaking change: multi-file
type: programmatic
structure: multi-file
parts:
  - terraform_setup.md
  - deployment_process.md
  - security.md
  - monitoring.md
  - cost_optimization.md
---

# PC Infrastructure Deployment

## Overview
(Brief description, 50-100 lines)

## Documentation Parts
- [Terraform Setup](terraform_setup.md) - Infrastructure as Code configuration
- [Deployment Process](deployment_process.md) - CI/CD pipeline and deployment steps
- [Security Configuration](security.md) - Security policies and compliance
- [Monitoring Setup](monitoring.md) - Observability and alerting
- [Cost Optimization](cost_optimization.md) - Cost estimation and optimization

## Quick Start
(Quick reference with links to parts)
```

**Benefits:**
- ✅ ID stable (`PC_infrastructure_deployment`) - links don't break
- ✅ Files manageable size (70-120 lines each)
- ✅ Git history preserved (git mv --follow)
- ✅ Easier to edit (no scrolling through 500 lines)

**Drawbacks:**
- ⚠️ More files to navigate
- ⚠️ Need tooling to "compile" multi-file contexts for LLM

### Migration Process

**Step-by-step:**

1. **Backup original file**
   ```bash
   cp PC_infrastructure_deployment.md PC_infrastructure_deployment.md.backup
   ```

2. **Create directory**
   ```bash
   mkdir PC_infrastructure_deployment
   ```

3. **Split content**
   - Identify logical sections (100-150 lines each)
   - Create separate .md files for each section
   - Preserve YAML frontmatter only in _index.md

4. **Create _index.md**
   - Overview + links to parts
   - Update version (breaking change!)
   - Add `structure: multi-file` field

5. **Update references**
   - Links `[[PC_infrastructure_deployment]]` still work (ID unchanged)
   - Internal links: update to point to specific parts

6. **Git commit**
   ```bash
   git mv PC_infrastructure_deployment.md PC_infrastructure_deployment/_original.md
   git add PC_infrastructure_deployment/
   git commit -m "refactor(docs): split PC_infrastructure_deployment into multi-file structure"
   ```

---

## Problem 3: Content Duplication

### Симптомы

**Common pattern:**
- Formal docs: `docs/programmatic/PC_frontend_implementation.md` (400 lines)
- Local context: `src/components/context.md` (228 lines)
- **Overlap:** 65-70%

**Problems:**
- Developer updates `context.md`, forgets to update `PC_*.md`
- Formal documentation becomes stale
- Stakeholders get outdated information

### Решение: Reference-based Local Context

**Implement on:** Any project with dual documentation (formal + local)

**Pattern: context.md as "cheat sheet"**

**Before (228 lines, 70% overlap):**
```markdown
# Programmatic Context: Frontend Navigation & Search

## Metadata
context_id: PC_frontend_navigation_search
version: "1.0.0"
based_on:
  - BC_yandex_kb_deployment: "1.0.0"

## Responsibility
(100 lines describing what component does)

## Component Structure
(50 lines listing all files)

## Compliance
(30 lines describing IC compliance)

## Testing
(48 lines describing testing strategy)
```

**After (80 lines, 20% overlap):**
```markdown
# Programmatic Context: Frontend Navigation & Search

## Full Documentation
📖 **See:** [PC_frontend_implementation.md](../../docs/programmatic/PC_frontend_implementation.md)

## Quick Reference

**Context ID:** PC_frontend_implementation
**Version:** 1.0.0
**Based on:** BC_yandex_kb_deployment:1.0.0

### Components
- `Sidebar.tsx` - Navigation sidebar
- `Search.tsx` - Search functionality
- `MDXRenderer.tsx` - Markdown rendering

### Key Hooks
- `useMarkdownContent()` - Load markdown files
- `useNavigation()` - Navigation state
- `useSearch()` - Search functionality

## Local Development

### Running locally
```bash
npm run dev
```

### Testing
```bash
npm run test:components
```

### Common tasks
- Add new article: Create .md in public/articles/
- Update navigation: Edit src/data/navigation.ts
- Debug search: Check useSearch hook

---

**📖 Full documentation:** [PC_frontend_implementation.md](../../docs/programmatic/PC_frontend_implementation.md#testing)
```

**Benefits:**
- ✅ Duplication reduced from 70% to 20%
- ✅ Single source of truth: PC_*.md
- ✅ context.md as quick reference for developers
- ✅ Easy to keep in sync (only links to update)

### Validation Rule

**CI check:**
```javascript
// scripts/check-duplication.js
const maxOverlap = 25%; // threshold

if (overlap(contextMd, pcMd) > maxOverlap) {
  throw new Error(`Overlap ${overlap}% exceeds ${maxOverlap}%`);
}
```

---

## Problem 4: Navigation Complexity

### Симптомы

**Small Scale:**
```
docs/
├── business/ (5 files)
├── analytics/ (8 files)
└── programmatic/ (12 files)
```
Easy to navigate!

**Medium Scale:**
```
docs/
├── business/ (25 files)
├── analytics/ (40 files)
└── programmatic/ (60 files)
```
Hard to find specific file, but manageable.

**Large Scale:**
```
docs/
├── business/ (100+ files in flat list)
├── analytics/ (150+ files in flat list)
└── programmatic/ (200+ files in flat list)
```
**Problems:**
- IDE slowdown when opening folder
- Hard to find files (need search)
- No logical grouping

### Решение: Hierarchical Structure

**Implement on:** > 20 files in a folder

**Pattern: Group by functional area**

**Trigger:** `find docs/programmatic -name "*.md" | wc -l` > 20

**Before:**
```
docs/programmatic/
├── PC_frontend_navigation.md
├── PC_frontend_search.md
├── PC_frontend_rendering.md
├── PC_auth_login.md
├── PC_auth_logout.md
├── PC_auth_2fa.md
├── PC_catalog_filters.md
├── PC_catalog_sorting.md
... (50+ files)
```

**After:**
```
docs/programmatic/
├── _INDEX.md                        # Auto-generated index
├── frontend/
│   ├── PC_frontend_navigation.md
│   ├── PC_frontend_search.md
│   └── PC_frontend_rendering.md
├── authentication/
│   ├── PC_auth_login.md
│   ├── PC_auth_logout.md
│   └── PC_auth_2fa.md
└── catalog/
    ├── PC_catalog_filters.md
    └── PC_catalog_sorting.md
```

**Important:** ID stays `PC_frontend_navigation` (not `PC_frontend_frontend_navigation`)!

**Auto-generate _INDEX.md:**

```bash
npm run generate-index
```

**Output:**
```markdown
# Programmatic Contexts Index

## By Category

### Frontend (3 contexts)
- [PC_frontend_navigation](frontend/PC_frontend_navigation.md) - v1.0.0 - ✅ Active
- [PC_frontend_search](frontend/PC_frontend_search.md) - v1.2.0 - ✅ Active
- [PC_frontend_rendering](frontend/PC_frontend_rendering.md) - v1.1.0 - ✅ Active

### Authentication (3 contexts)
- [PC_auth_login](authentication/PC_auth_login.md) - v2.0.0 - ✅ Active
- [PC_auth_logout](authentication/PC_auth_logout.md) - v1.0.0 - ✅ Active
- [PC_auth_2fa](authentication/PC_auth_2fa.md) - v1.5.0 - ✅ Active

## Statistics
- Total contexts: 52
- Average file size: 287 lines
- Files > 400 lines: 3 (needs refactoring)
```

---

## Problem 5: Broken References

### Симптомы

**Common causes:**
- File renamed, links not updated
- based_on points to non-existent version
- Multi-file refactoring breaks internal links

**Example:**
```markdown
based_on:
  - AC_infrastructure_main: "1.0.0"  # AC updated to v2.0.0!
```

### Решение: Validation Tools + CI

**Implement on:** Medium scale (50+ contexts)

**Tools:**

1. **validate-contexts.js**
   ```bash
   npm run validate-contexts
   ```

   **Checks:**
   - All `based_on` references exist
   - All `[[context_id]]` links resolve
   - All internal links (e.g., `[link](file.md#section)`) valid
   - No circular dependencies

2. **CI integration**
   ```yaml
   # .github/workflows/validate-docs.yml
   - name: Validate context references
     run: npm run validate-contexts
   ```

3. **Pre-commit hook**
   ```bash
   # .husky/pre-commit
   npm run validate-contexts -- --fast
   ```

**Expected impact:**
- ✅ Broken links: 0 (caught before merge)
- ✅ Time debugging broken references: reduced by 90%

---

## Problem 6: Stale Documentation

### Симптомы

**Medium Scale:**
- Some docs not updated for 3-6 months
- Code evolved, docs didn't

**Large Scale:**
- 20-30% of docs outdated
- Developers don't trust documentation
- Stakeholders get wrong information

### Решение: Health Metrics + Quarterly Review

**Implement on:** Medium scale

**1. Add staleness metric**

```yaml
---
context_id: PC_frontend_navigation
last_updated: "2025-12-22"
last_reviewed: "2025-12-22"
---
```

**2. Automated staleness check**

```bash
npm run check-staleness
```

**Output:**
```
🟢 Fresh (< 30 days): 25 contexts
🟡 Aging (30-90 days): 15 contexts
🔴 Stale (> 90 days): 5 contexts

Stale contexts requiring review:
- PC_old_component (last updated: 2025-06-15, 189 days ago)
- PC_legacy_service (last updated: 2025-07-01, 174 days ago)
```

**3. Quarterly review process**

**Schedule:** Every 3 months

**Steps:**
1. Run `npm run check-staleness`
2. Review all 🔴 stale contexts
3. Update or mark as deprecated
4. Update `last_reviewed` field

**4. Health dashboard**

```bash
npm run docs-dashboard
```

**Generates HTML report:**
- Staleness distribution chart
- List of contexts needing update
- Metrics trends over time

---

## Scaling Roadmap

### Phase 1: Foundation (10-50 contexts)

**Setup:**
- ✅ Basic templates (BC, AC, PC, IC, CCC)
- ✅ Flat directory structure
- ✅ Manual validation

**Tools:**
- None required yet

**Time investment:** 1-2 days initial setup

---

### Phase 2: Governance (50-200 contexts)

**Implement:**
- ✅ DOMAIN_REGISTRY.md
- ✅ File size monitoring (warning at 400 lines)
- ✅ Reference-based local contexts
- ✅ Basic CI validation (broken links)

**Tools:**
- `validate-contexts.js` (basic)
- `check-file-sizes.js`

**Time investment:** 1-2 weeks

---

### Phase 3: Automation (200-500 contexts)

**Implement:**
- ✅ Multi-file structure for large docs
- ✅ Hierarchical directory structure
- ✅ Auto-generated indexes
- ✅ Domain validation (semantic overlap)
- ✅ Staleness tracking

**Tools:**
- `validate-domain.ts`
- `context-graph.ts`
- `check-duplication.ts`
- `generate-index.js`

**Time investment:** 3-4 weeks

---

### Phase 4: Advanced (500+ contexts)

**Implement:**
- ✅ Docs dashboard (interactive)
- ✅ Dependency graph visualization
- ✅ Automated migration guides
- ✅ AI-assisted doc generation
- ✅ Quarterly review automation

**Tools:**
- Full dashboard with trends
- Mermaid diagram generation
- Breaking change detector

**Time investment:** 2-3 months

---

## Metrics & KPIs

### Small Scale (10-50 contexts)

**Track manually:**
- Total contexts
- Average file size

**Target:**
- Average file size < 250 lines

---

### Medium Scale (50-200 contexts)

**Track with tools:**
- Total contexts by type (BC/AC/PC/IC/CCC)
- Average file size
- Files > 400 lines (should be 0)
- Broken links (should be 0)
- Domains count

**Targets:**
- Average file size < 300 lines
- Files > 400 lines: 0
- Broken links: 0
- Domains: < 30

---

### Large Scale (200+ contexts)

**Track on dashboard:**
- All medium scale metrics +
- Staleness distribution
- Duplication percentage
- Domain churn rate
- Time to find context (developer survey)

**Targets:**
- Stale contexts (> 90 days): < 10%
- Duplication overlap: < 25%
- Domain churn: < 2 new domains/month
- Time to find context: < 3 minutes

---

## Best Practices

### 1. Incremental Adoption

**Don't try to implement everything at once!**

**Order:**
1. Domain Registry (prevents chaos)
2. File size monitoring (prevents bloat)
3. Reference-based context.md (reduces duplication)
4. CI validation (prevents broken links)
5. Multi-file structure (when needed)
6. Hierarchical structure (when needed)
7. Dashboard (nice to have)

### 2. Automate Early

**Manual processes don't scale**

**Automate:**
- Link validation (CI)
- File size checks (pre-commit)
- Index generation (weekly cron)
- Staleness reports (quarterly)

### 3. Make it Easy to Do the Right Thing

**Friction = non-compliance**

**Reduce friction:**
- Provide templates
- Automate validation
- Generate boilerplate
- Clear error messages

**Example:**
```bash
$ npm run create-context -- PC_new_component

✅ Created src/components/NewComponent/context.md
✅ Created docs/programmatic/PC_new_component.md
✅ Added to DOMAIN_REGISTRY.md
✅ Validated: no semantic overlap

Next steps:
1. Fill in component details
2. Implement compliance with IC contexts
3. Run: npm run validate-context -- PC_new_component
```

### 4. Review Quarterly

**Set calendar reminder: every 3 months**

**Review:**
- Stale contexts (update or deprecate)
- Large files (> 400 lines → split)
- Domain registry (any duplicates?)
- Metrics (are we hitting targets?)

---

## Common Pitfalls

### ❌ Pitfall 1: Over-engineering Early

**Problem:** Implementing hierarchical structure when you have 15 files

**Solution:** Wait until > 20 files per folder

---

### ❌ Pitfall 2: Ignoring File Size

**Problem:** Letting files grow to 800+ lines before action

**Solution:** Set up CI warning at 400 lines

---

### ❌ Pitfall 3: No Domain Governance

**Problem:** Letting developers create domains ad-hoc

**Solution:** Require domain registry update in PR

---

### ❌ Pitfall 4: Manual Validation

**Problem:** Relying on code review to catch broken links

**Solution:** Automate in CI

---

## Related Documentation

- [DOMAIN_REGISTRY_TEMPLATE.md](../templates/domains/DOMAIN_REGISTRY_TEMPLATE.md) - Domain management
- [PC_CONTEXT_TEMPLATE.md](../templates/phases/PC_CONTEXT_TEMPLATE.md) - Context template
- [CODE_REVIEW_CHECKLIST.md](../guides/standards/development/CODE_REVIEW_CHECKLIST.md) - Review checklist
- [CONTEXT_HEALTH_METRICS.md](../guides/standards/testing/CONTEXT_HEALTH_METRICS.md) - Health metrics

---

## Tool Reference

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `validate-domain.ts` | Check domain naming rules | Before creating new domain |
| `validate-contexts.ts` | Check broken links, dependencies | CI, pre-commit |
| `check-file-sizes.js` | Warn on large files | CI, quarterly review |
| `check-duplication.ts` | Detect content overlap | CI, quarterly review |
| `context-graph.ts` | Visualize dependencies | On-demand, dashboard |
| `generate-index.js` | Auto-generate indexes | Weekly cron, on-demand |

---

**Status:** 🟢 Active
**Owner:** Architecture Team
**Feedback:** Create issue or PR for improvements
