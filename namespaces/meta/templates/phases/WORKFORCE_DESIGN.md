# Phase: WORKFORCE_DESIGN

> Определение участников (Actors) и их инструментов (Tools)

## Контекст

**Actors** — исполнители, выполняющие Actions.

| Тип | Описание | Пример |
|-----|----------|--------|
| **Human** | Принимает решения, использует UI | Product Manager, Reviewer |
| **AI** | Выполняет по инструкции, использует API | AI Analyst, AI Generator |
| **System** | Автоматический триггер | Scheduler, Notifier |

**Tools** — инструменты для выполнения Actions.

| Тип | Описание | Совместим с |
|-----|----------|-------------|
| **UI** | Пользовательский интерфейс | Human |
| **API** | Программный интерфейс | AI, System |
| **LLM** | Языковая модель | AI |
| **Script** | Автоматизированный скрипт | AI, System |
| **MCP** | Model Context Protocol | AI |
| **Manual** | Ручное действие | Human |

**Правила:**
- Actor без Tools не может выполнять Actions
- Tool типа UI несовместим с AI Actor
- Tool типа API несовместим с Human (без UI-обёртки)

## Вопросы

### 1. Human Actors

**Вопрос:** Какие роли у людей в процессе?

| Actor ID | Название | Инструменты | Описание |
|----------|----------|-------------|----------|
| | | | |
| | | | |
| | | | |

### 2. AI Actors

**Вопрос:** Какие AI-агенты участвуют?

| Actor ID | Название | Инструменты | Что делает |
|----------|----------|-------------|------------|
| | | | |
| | | | |

### 3. System Actors

**Вопрос:** Есть ли автоматические (системные) участники?

| Actor ID | Триггер | Описание |
|----------|---------|----------|
| | cron / webhook / event | |
| | | |

### 4. Tools

**Вопрос:** Какие инструменты используются?

| Tool ID | Название | Тип | Кто использует |
|---------|----------|-----|----------------|
| | | UI / API / LLM / Script / MCP / Manual | Human / AI / System |
| | | | |
| | | | |
| | | | |

## Матрица совместимости

Проверьте, что все пары Actor-Tool совместимы:

|  | UI | API | LLM | Script | MCP | Manual |
|--|:--:|:---:|:---:|:------:|:---:|:------:|
| **Human** | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **AI** | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ |
| **System** | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |

## Пример заполнения

```yaml
actors:
  - id: "author"
    name: "Author"
    type: "Human"
    tools: ["editor_ui"]
    permissions: ["create_draft", "edit_draft", "submit_draft"]

  - id: "reviewer"
    name: "Reviewer"
    type: "Human"
    tools: ["review_ui"]
    permissions: ["review", "approve", "reject", "request_revision"]

  - id: "ai_checker"
    name: "AI Quality Checker"
    type: "AI"
    tools: ["llm_api", "lint_api"]
    permissions: ["auto_review"]

  - id: "notifier"
    name: "Notification Service"
    type: "System"
    tools: ["email_api", "slack_api"]
    permissions: ["send_notification"]

tools:
  - id: "editor_ui"
    name: "Document Editor"
    type: "UI"
    compatible_actors: ["Human"]
    operations: ["create", "edit", "delete"]

  - id: "review_ui"
    name: "Review Interface"
    type: "UI"
    compatible_actors: ["Human"]
    operations: ["view", "comment", "approve", "reject"]

  - id: "llm_api"
    name: "Claude API"
    type: "LLM"
    compatible_actors: ["AI"]
    operations: ["analyze", "generate", "summarize"]

  - id: "email_api"
    name: "Email Service"
    type: "API"
    compatible_actors: ["System"]
    operations: ["send"]
```

## Критерии выхода

- [x] Минимум 1 Actor определён
- [x] Все Actors имеют минимум 1 Tool
- [x] Все Tools имеют compatible_actors
- [x] Совместимость Actor-Tool проверена

## Переход

**Предыдущая фаза:** FACTS_DESIGN
**Следующая фаза:** ACTIONS_DESIGN
