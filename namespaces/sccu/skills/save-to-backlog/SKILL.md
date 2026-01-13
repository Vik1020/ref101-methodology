---
name: save-to-backlog
description: Сохраняет идею/план в backlog из текущего диалога. Анализирует контекст, извлекает problem_statement и proposed_solution. Используй при "Сохрани в backlog", "save to backlog", "добавь в backlog", "запомни эту идею", "/backlog".
---

# Save to Backlog Skill (v1.0.0)

Автоматическое сохранение идей и планов из диалога в структурированный backlog.

**ВАЖНО:** Этот Skill НЕ использует MCP tools — backlog находится ВНЕ workflow.

## Trigger Keywords

- "Сохрани в backlog"
- "save to backlog"
- "добавь в backlog"
- "запомни эту идею"
- "/backlog"
- "save this idea"
- "add to backlog"

## Process Overview

```
Dialog Analysis → Extract Problem/Solution → Generate ID → Create File → Confirm
```

**NO MCP tools used** — backlog is outside workflow system.

---

## Instructions

### 1. Analyze Current Dialog

Extract from conversation:
- **Problem Statement**: What problem was discussed? What pain point?
- **Proposed Solution**: What approach was suggested? (optional)
- **Context**: What led to this discussion?
- **Related Contexts**: Any BC/AC/PC/IC mentioned?

### 2. Generate Item ID

**Format:** `BACKLOG_[YYYYMMDD]_[slug]`

Where:
- `YYYYMMDD` = current date (e.g., 20260107)
- `slug` = snake_case summary, max 3-4 words (e.g., `auto_approve_hook`, `dark_theme`)

**Examples:**
- `BACKLOG_20260107_mcp_session_fix`
- `BACKLOG_20260108_auth_flow_improvement`

### 3. Classify Item

Determine:

| Field | Default | Options |
|-------|---------|---------|
| `priority` | P2 | P0 (critical), P1 (high), P2 (normal) |
| `category` | feature | feature, bugfix, refactor, docs, config |
| `estimated_effort` | null | XS, S, M, L, XL |

**Priority rules:**
- P0 → User explicitly says "critical" or "urgent"
- P1 → User says "important" or it blocks other work
- P2 → Default for all other ideas

### 4. Create File

**Path:** `docs/backlog/BACKLOG_[YYYYMMDD]_[slug].md`

**Use template from:** `specifications/templates/backlog/BACKLOG_ITEM_TEMPLATE.md`

**Fill required fields:**
```yaml
item_id: BACKLOG_[YYYYMMDD]_[slug]
type: backlog_item
version: "1.0.0"
priority: [determined]
status: new
category: [determined]
created_date: [today]
updated_date: [today]
affected_domains: [if identified]
related_contexts: [if identified]
```

**Fill markdown sections:**
- Problem Statement (REQUIRED)
- Proposed Solution (if discussed)
- Context / Background (conversation reference)
- Acceptance Criteria (if clear)

### 5. Confirm to User

Show summary:

```
✅ Saved to backlog:

File: docs/backlog/BACKLOG_[id].md
Problem: [1-2 sentence summary]
Solution: [1-2 sentence summary or "Not specified"]
Priority: P[X]
Category: [category]
Status: new
```

---

## Error Handling

### No Clear Problem in Dialog

If problem statement is unclear:

1. Ask user: "Какую проблему решает эта идея? Опишите в 1-2 предложениях."
2. Wait for response
3. Then proceed with saving

### Similar Item May Exist

If filename would match existing:

1. Check `docs/backlog/` for similar slugs
2. If found, ask: "Найден похожий item: [filename]. Обновить его или создать новый?"
3. Options: Update existing / Create new

### No Solution Discussed

If only problem was discussed (no solution):

- Set `Proposed Solution` section to: "To be determined"
- This is acceptable — backlog items can be problems without solutions yet

---

## Lifecycle

### Status Flow

```
new → in_review → accepted → converted_to_release
                ↓
            rejected
```

| Status | Meaning | Next Action |
|--------|---------|-------------|
| `new` | Just created, needs review | PO reviews |
| `in_review` | Being evaluated | Decide accept/reject |
| `accepted` | Approved for future work | Wait for slot |
| `rejected` | Will not implement | Add rejection reason in Notes |
| `converted_to_release` | Became a release | Link to RELEASE_* |

### Converting to Release

When backlog item is approved for implementation:

1. Update backlog item:
   ```yaml
   status: converted_to_release
   converted_date: [today]
   converted_to: RELEASE_v{X}_{Y}_{Z}_{feature}
   ```

2. Use `/new-release-auto` or `/new-feature` to create release

3. In RELEASE.md, reference backlog item in Problem Statement:
   ```
   See: docs/backlog/BACKLOG_[id].md
   ```

---

## Fields Reference

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `item_id` | Yes | - | Auto-generated: BACKLOG_YYYYMMDD_slug |
| `type` | Yes | backlog_item | Don't change |
| `version` | Yes | "1.0.0" | Item version |
| `priority` | Yes | P2 | P0/P1/P2 |
| `status` | Yes | new | Lifecycle status |
| `category` | Yes | feature | feature/bugfix/refactor/docs/config |
| `created_date` | Yes | today | YYYY-MM-DD |
| `updated_date` | Yes | today | YYYY-MM-DD |
| `converted_date` | No | null | When converted to release |
| `affected_domains` | No | [] | BC_DOMAIN/AC_DOMAIN links |
| `related_contexts` | No | [] | PC/IC links |
| `related_releases` | No | [] | Related version numbers |
| `estimated_effort` | No | null | XS/S/M/L/XL |
| `blocked_by` | No | [] | Blocking items |
| `converted_to` | No | null | RELEASE_* when converted |

---

## Example Session

```
User: Мы обсуждали что нужно добавить поддержку темной темы для комфортной
работы ночью. Сохрани в backlog.

Claude: Анализирую диалог для сохранения в backlog...

Извлечено:
- Problem: Пользователям неудобно работать с приложением в темное время суток
- Solution: Добавить темную тему с переключателем в настройках
- Category: feature
- Priority: P2

[Write] docs/backlog/BACKLOG_20260107_dark_theme.md

✅ Saved to backlog:

File: docs/backlog/BACKLOG_20260107_dark_theme.md
Problem: Пользователям неудобно работать в темное время суток
Solution: Добавить темную тему с переключателем
Priority: P2
Category: feature
Status: new
```

---

## Related Documentation

- [WORKFLOW.md → Backlog Management](../../ref101/WORKFLOW.md#backlog-management)
- [BACKLOG_ITEM_TEMPLATE](../../../specifications/templates/backlog/BACKLOG_ITEM_TEMPLATE.md)
- [PRIORITY_SYSTEM.md](../../ref101/guides/standards/deployment/PRIORITY_SYSTEM.md)
