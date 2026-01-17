# Phase: RULES_DESIGN

> Определение ограничений и условий

## Контекст

**Rules** — логические условия, управляющие процессом.

**Типы Rules:**

| Тип | Когда проверяется | Пример |
|-----|-------------------|--------|
| **Precondition** | До выполнения Action | "Actor имеет права" |
| **Postcondition** | После выполнения Action | "Entity содержит поле X" |
| **Guard** | При попытке перехода | "score > threshold" |
| **Invariant** | Всегда | "status никогда null" |
| **Constraint** | При изменении Entity | "Max 3 итерации" |

**Реакции на нарушение (on_violation):**

| Реакция | Описание |
|---------|----------|
| `Block` | Запретить Action/переход |
| `Redirect` | Перенаправить в другой State |
| `Compensate` | Запустить компенсирующий Action |
| `Alert` | Уведомить и продолжить |
| `Retry` | Повторить Action |

## Вопросы

### 1. Preconditions (до Action)

**Вопрос:** Какие условия должны выполняться ДО действий?

| Rule ID | Condition | Scope (Action) | On Violation |
|---------|-----------|----------------|--------------|
| | | action(xxx) | Block / Alert |
| | | | |
| | | | |

**Примеры:**
- `required_title`: `entity.title != null` → action(submit_draft) → Block
- `has_permission`: `actor.role in ['admin', 'reviewer']` → action(approve) → Block

### 2. Guards (на переходах)

**Вопрос:** Какие условия на переходах между состояниями?

| Rule ID | Condition | Transition | On Violation |
|---------|-----------|------------|--------------|
| | | from → to | Block / Redirect |
| | | | |
| | | | |

**Примеры:**
- `quality_threshold`: `entity.score >= 0.8` → Review → Approved → Redirect(Rejected)
- `max_revisions`: `entity.revision_count < 5` → Review → Drafting → Redirect(Failed)

### 3. Timeouts

**Вопрос:** Какие ограничения по времени?

| State | Timeout | On Timeout |
|-------|---------|------------|
| | 24h / 48h / 7d | Alert / Escalate / Auto-transition |
| | | |
| | | |

**Примеры:**
- Pending Approval: 24h → Escalate to manager
- Review: 48h → Alert reviewer
- Drafting: 7d → Auto-transition to Cancelled

### 4. Constraints (ограничения Entity)

**Вопрос:** Какие общие ограничения на Entity?

| Rule ID | Condition | Description |
|---------|-----------|-------------|
| | | |
| | | |

**Примеры:**
- `max_content_length`: `entity.content.length <= 10000`
- `valid_status`: `entity.status in allowed_statuses`
- `no_empty_title`: `entity.title.trim().length > 0`

### 5. Invariants (всегда истинны)

**Вопрос:** Что всегда должно быть истинным?

| Rule ID | Condition | Description |
|---------|-----------|-------------|
| | | |
| | | |

**Примеры:**
- `id_immutable`: `entity.id never changes after creation`
- `created_at_immutable`: `entity.created_at never changes`
- `history_append_only`: `entity.history only grows`

## Пример заполнения

```yaml
rules:
  # Preconditions
  - id: "required_fields"
    name: "Required Fields Present"
    type: "Precondition"
    condition: "entity.title != null AND entity.content != null"
    scope: "action(submit_draft)"
    on_violation: "Block"
    message: "Title and content are required"

  - id: "has_reviewer_permission"
    name: "Has Reviewer Permission"
    type: "Precondition"
    condition: "actor.permissions.includes('review')"
    scope: "action(approve)"
    on_violation: "Block"
    message: "Only reviewers can approve"

  # Guards
  - id: "quality_threshold"
    name: "Quality Threshold"
    type: "Guard"
    condition: "entity.review_score >= 0.8"
    scope: "transition(review -> approved)"
    on_violation: "Redirect(rejected)"
    message: "Quality score below threshold"

  - id: "max_revisions"
    name: "Maximum Revisions"
    type: "Guard"
    condition: "entity.revision_count < 5"
    scope: "transition(review -> drafting)"
    on_violation: "Redirect(failed)"
    message: "Maximum revision count exceeded"

  # Timeouts
  - id: "approval_timeout"
    name: "Approval Timeout"
    type: "Constraint"
    condition: "time_in_state(pending_approval) < 24h"
    scope: "state(pending_approval)"
    on_violation: "Escalate"
    escalation_actor: "manager"

  - id: "review_timeout"
    name: "Review Timeout"
    type: "Constraint"
    condition: "time_in_state(review) < 48h"
    scope: "state(review)"
    on_violation: "Alert"

  # Constraints
  - id: "content_length"
    name: "Content Length Limit"
    type: "Constraint"
    condition: "entity.content.length <= 10000"
    scope: "entity(document)"
    on_violation: "Block"
    message: "Content exceeds maximum length"

  # Invariants
  - id: "id_immutable"
    name: "ID Immutable"
    type: "Invariant"
    condition: "entity.id == entity.id@creation"
    scope: "entity(document)"
    on_violation: "Block"
```

## Проверка правил

### Тестируемость

Все условия должны быть **детерминированными**:
- Одинаковый вход → одинаковый выход
- Нет side effects
- Не зависят от внешних факторов (кроме времени для timeouts)

### Конфликты

Проверьте, нет ли конфликтующих правил:

| Rule 1 | Rule 2 | Конфликт? |
|--------|--------|-----------|
| | | Да / Нет |

**Приоритет при конфликте:** Invariant > Guard > Precondition > Constraint

## Критерии выхода

- [x] Все Rules имеют testable conditions
- [x] Все Waiting States имеют timeouts
- [x] Нет конфликтующих Rules
- [x] on_violation определён для всех Rules

## Переход

**Предыдущая фаза:** ACTIONS_DESIGN
**Следующая фаза:** VALIDATION
