# Phase: STATES_DESIGN

> Определение жизненного цикла (фаз) Entity

## Контекст

**States** — это фазы жизненного цикла Entity.

**Типы States:**

| Тип | Описание | Пример |
|-----|----------|--------|
| **Initial** | Начальный, создаётся автоматически | Created, New |
| **Working** | Активная работа | Drafting, Review |
| **Waiting** | Ожидание внешнего события | Pending Approval |
| **Terminal** | Конечный, выхода нет | Completed, Approved |
| **Error** | Обработка сбоя | Failed, Blocked |

**Правила:**
- Ровно один Initial State
- Минимум один Terminal (успешный)
- Минимум один Error State
- Каждый не-Terminal State должен иметь выход

## Вопросы

### 1. Initial State

**Вопрос:** Как называется начальное состояние?

**Default:** Created

```
Initial state: _______________
```

### 2. Working States

**Вопрос:** Какие рабочие фазы проходит объект?

**Инструкция:** Перечислите фазы активной работы.

| State ID | Название | Описание |
|----------|----------|----------|
| | | |
| | | |
| | | |

### 3. Waiting States

**Вопрос:** Есть ли фазы ожидания?

**Примеры:** Pending Approval, Waiting Payment, External Review

| State ID | Название | Чего ждём? | Timeout |
|----------|----------|------------|---------|
| | | | |
| | | | |

### 4. Terminal States (Success)

**Вопрос:** Как называется успешное завершение?

**Default:** Completed

```
Terminal success: _______________
```

**Есть ли альтернативные успешные завершения?**

| State ID | Название | Когда используется |
|----------|----------|--------------------|
| | | |

### 5. Terminal States (Failure)

**Вопрос:** Какие варианты неуспешного завершения?

| State ID | Название | Когда используется |
|----------|----------|--------------------|
| rejected | Rejected | Отклонено ревьюером |
| cancelled | Cancelled | Отменено автором |
| | | |

### 6. Error State

**Вопрос:** Как называется состояние ошибки?

**Default:** Failed

```
Error state: _______________
```

## Визуализация

Нарисуйте схему переходов:

```
[Initial] → [Working1] → [Working2] → [Terminal]
                ↓            ↓
             [Error]      [Failed]
```

```
Ваша схема:

_______________________________________________
_______________________________________________
_______________________________________________
```

## Пример заполнения

```yaml
states:
  - id: "created"
    name: "Created"
    type: "Initial"
    allowed_actions: ["start_draft"]
    exit_conditions: ["draft_started"]

  - id: "drafting"
    name: "Drafting"
    type: "Working"
    allowed_actions: ["edit_draft", "submit_draft"]
    entry_conditions: ["draft_started"]
    exit_conditions: ["draft_submitted"]

  - id: "review"
    name: "Under Review"
    type: "Working"
    allowed_actions: ["review", "approve", "reject", "request_revision"]
    entry_conditions: ["draft_submitted"]
    exit_conditions: ["approved", "rejected", "revision_requested"]

  - id: "pending_approval"
    name: "Pending Approval"
    type: "Waiting"
    timeout: "24h"
    on_timeout: "escalate"
    allowed_actions: ["approve", "reject"]
    entry_conditions: ["review_passed"]
    exit_conditions: ["approved", "rejected"]

  - id: "approved"
    name: "Approved"
    type: "Terminal"
    entry_conditions: ["approved"]

  - id: "rejected"
    name: "Rejected"
    type: "Terminal"
    entry_conditions: ["rejected"]

  - id: "failed"
    name: "Failed"
    type: "Error"
    entry_conditions: ["error_occurred"]
```

## Критерии выхода

- [x] Ровно 1 Initial state
- [x] Минимум 1 Terminal success state
- [x] Минимум 1 Error state
- [x] Все states имеют уникальные id
- [x] Waiting states имеют timeout

## Переход

**Предыдущая фаза:** ENTITY_DESIGN
**Следующая фаза:** FACTS_DESIGN
