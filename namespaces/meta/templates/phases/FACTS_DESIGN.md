# Phase: FACTS_DESIGN

> Определение событий (переходов между States)

## Контекст

**Facts** — это события, которые переводят Entity из одного State в другой.

**Правила:**
- Имя Fact — глагол в **прошедшем времени** (Created, Submitted, Approved)
- Каждый Fact связывает `from_state → to_state`
- Facts неизменяемы (immutable)
- Каждый не-Terminal State должен иметь минимум один исходящий Fact

## Вопросы

### 1. Переходы между States

**Вопрос:** Какие события переводят Entity между состояниями?

**Инструкция:** Для каждого State (кроме Terminal) определите исходящие события.

| Fact ID | Название (past tense) | From State | To State | Описание |
|---------|----------------------|------------|----------|----------|
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |

### 2. Условные переходы (Guards)

**Вопрос:** Есть ли переходы, зависящие от условий?

**Пример:** "Если score > 80, то Approved, иначе Rejected"

| Fact ID | Условие | True → State | False → State |
|---------|---------|--------------|---------------|
| | | | |
| | | | |

### 3. Проверка полноты

**Самопроверка:**

- [ ] Initial State имеет исходящий Fact
- [ ] Все Working States имеют минимум 1 исходящий Fact
- [ ] Все Waiting States имеют минимум 1 исходящий Fact
- [ ] Все Terminal States достижимы
- [ ] Error State достижим из Working States

## Диаграмма переходов

```
          ┌─────────────────────────────────────┐
          │                                     │
          ▼                                     │
[Initial] ──Fact1──► [Working1] ──Fact2──► [Working2]
                          │                    │
                          │                    ├──Fact3──► [Terminal Success]
                          │                    │
                          └──Fact_Error──► [Error]
                                               │
                                               └──Fact4──► [Terminal Failure]
```

**Ваша диаграмма:**

```
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
```

## Пример заполнения

```yaml
facts:
  - id: "draft_started"
    name: "Draft Started"
    from_state: "created"
    to_state: "drafting"
    triggered_by: "start_draft"

  - id: "draft_submitted"
    name: "Draft Submitted"
    from_state: "drafting"
    to_state: "review"
    triggered_by: "submit_draft"

  - id: "approved"
    name: "Approved"
    from_state: "review"
    to_state: "approved"
    triggered_by: "approve"

  - id: "rejected"
    name: "Rejected"
    from_state: "review"
    to_state: "rejected"
    triggered_by: "reject"

  - id: "revision_requested"
    name: "Revision Requested"
    from_state: "review"
    to_state: "drafting"
    triggered_by: "request_revision"

  - id: "error_occurred"
    name: "Error Occurred"
    from_state: "*"  # any working state
    to_state: "failed"
    triggered_by: "system_error"
```

## Критерии выхода

- [x] Все не-Terminal States имеют минимум 1 исходящий Fact
- [x] Все Facts имеют from_state и to_state
- [x] Нет orphan states (недостижимых)
- [x] Все Facts названы в прошедшем времени

## Переход

**Предыдущая фаза:** STATES_DESIGN
**Следующая фаза:** WORKFORCE_DESIGN
