# Phase: ACTIONS_DESIGN

> Определение действий для каждого Actor в каждом State

## Контекст

**Actions** — единицы работы, выполняемые Actor с помощью Tool.

**Правила:**
- Имя Action — глагол (Create, Review, Approve, Submit)
- Каждый Action привязан к конкретным States (`allowed_in_states`)
- Action производит Fact или изменяет Entity
- Один Action — один ответственный Actor

## Вопросы

### 1. Actions по States

**Инструкция:** Для каждого State определите, какие Actions в нём возможны.

#### State: {state_1}

| Action ID | Название | Actor | Tool | Результат |
|-----------|----------|-------|------|-----------|
| | | | | Fact / Entity change |
| | | | | |

#### State: {state_2}

| Action ID | Название | Actor | Tool | Результат |
|-----------|----------|-------|------|-----------|
| | | | | |
| | | | | |

#### State: {state_n}

| Action ID | Название | Actor | Tool | Результат |
|-----------|----------|-------|------|-----------|
| | | | | |
| | | | | |

### 2. Матрица State × Action

**Проверка:** Все States покрыты Actions?

| State | Allowed Actions |
|-------|-----------------|
| | |
| | |
| | |

### 3. Матрица Actor × Action

**Проверка:** Все Actors имеют Actions?

| Actor | Permissions (Actions) |
|-------|-----------------------|
| | |
| | |
| | |

### 4. Actions с Retry

**Вопрос:** Какие Actions могут завершиться ошибкой и требуют retry?

| Action | Max Attempts | Delay | On Exhausted |
|--------|--------------|-------|--------------|
| | 3 | exponential | → Error State |
| | | | |

## Пример заполнения

```yaml
actions:
  - id: "create_draft"
    name: "Create Draft"
    actor: "author"
    tool: "editor_ui"
    input: "document"
    allowed_in_states: ["created"]
    output:
      fact: "draft_started"

  - id: "edit_draft"
    name: "Edit Draft"
    actor: "author"
    tool: "editor_ui"
    input: "document"
    allowed_in_states: ["drafting"]
    output:
      entity_change: "document.content"

  - id: "submit_draft"
    name: "Submit Draft"
    actor: "author"
    tool: "editor_ui"
    input: "document"
    allowed_in_states: ["drafting"]
    output:
      fact: "draft_submitted"
    preconditions:
      - "document.title != null"
      - "document.content.length > 0"

  - id: "auto_review"
    name: "Auto Review"
    actor: "ai_checker"
    tool: "llm_api"
    input: "document"
    allowed_in_states: ["review"]
    output:
      entity_change: "document.review_score"
    retry:
      max_attempts: 3
      delay: "exponential(base=1s, max=30s)"
      on_exhausted: "error_occurred"

  - id: "approve"
    name: "Approve"
    actor: "reviewer"
    tool: "review_ui"
    input: "document"
    allowed_in_states: ["review", "pending_approval"]
    output:
      fact: "approved"

  - id: "reject"
    name: "Reject"
    actor: "reviewer"
    tool: "review_ui"
    input: "document"
    allowed_in_states: ["review", "pending_approval"]
    output:
      fact: "rejected"
    requires:
      - "rejection_reason"

  - id: "request_revision"
    name: "Request Revision"
    actor: "reviewer"
    tool: "review_ui"
    input: "document"
    allowed_in_states: ["review"]
    output:
      fact: "revision_requested"
    requires:
      - "revision_comments"
```

## Проверка связей

### Facts ↔ Actions

| Fact | Triggered By Action |
|------|---------------------|
| draft_started | create_draft |
| draft_submitted | submit_draft |
| approved | approve |
| rejected | reject |
| revision_requested | request_revision |

**Все Facts должны иметь triggering Action!**

## Критерии выхода

- [x] Все Actions имеют actor и tool
- [x] Все States имеют минимум 1 allowed action
- [x] Все Facts triggered by некоторый Action
- [x] Actor-Tool совместимость проверена

## Переход

**Предыдущая фаза:** WORKFORCE_DESIGN
**Следующая фаза:** RULES_DESIGN
