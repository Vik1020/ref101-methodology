---
name: meta-new-methodology
description: Создаёт новый namespace в namespaces/. Генерирует структуру по 8 элементам мета-методологии. Используй при "создай методологию", "new methodology", "новый namespace".
---

# Meta New Methodology Skill (Wizard v3.0.0)

Интерактивное создание методологии по мета-методологии — 8 invariant elements.

**Два режима работы:**
- **Quick mode** — быстрое создание шаблона (MCP-first)
- **Wizard mode** — интерактивный процесс с вопросами на каждом шаге

## Trigger Keywords

- "Создай методологию {name}" → Quick mode
- "new methodology {name}" → Quick mode
- "/meta-new-methodology {name}" → Quick mode
- "Создай методологию" (без имени) → Wizard mode
- "/meta-new-methodology --wizard" → Wizard mode
- "Проведи меня через создание методологии" → Wizard mode

## Process Overview

### Quick Mode
```
PARSE → CREATE (MCP) → VALIDATE (MCP) → REPORT
```

### Wizard Mode
```
CONCEPTION → ENTITY → STATES → FACTS → WORKFORCE → ACTIONS → RULES → VALIDATION → COMPLETE
     ↓          ↓        ↓        ↓         ↓          ↓        ↓          ↓
   [Q&A]     [Q&A]    [Q&A]    [Q&A]     [Q&A]      [Q&A]    [Q&A]    [Validate]
```

---

## Mode Selection

При запуске определи режим:

| Условие | Режим |
|---------|-------|
| Указано имя (`/meta-new-methodology auth_flow`) | Quick |
| Указан флаг `--wizard` | Wizard |
| Имя не указано | **Спросить пользователя** |

**Если имя не указано, спросить:**

```
Как создать методологию?

1. Quick mode — создать шаблон и заполнить вручную
2. Wizard mode — интерактивный процесс с вопросами

Выберите режим:
```

---

## Quick Mode Instructions

### 1. Parse Request

Extract:
- **name**: snake_case (e.g., "auth_flow")
- **description**: опционально

### 2. Create via MCP

```
Call: meta_create_namespace
Args: { name: "{name}", description: "{description}" }
```

### 3. Validate via MCP

```
Call: meta_validate
Args: { namespace: "{name}", level: "all" }
```

### 4. Report

```
✅ Namespace '{name}' создан в namespaces/{name}/

Следующие шаги:
1. Отредактируй methodology.yaml
2. Запусти /meta-validate {name}
```

---

## Wizard Mode Instructions

**Процесс:** `methodology_creation` (см. `processes/methodology_creation.yaml`)

### Phase 1: CONCEPTION

**Цель:** Собрать базовую информацию.

**Вопросы:**

1. **Название** (snake_case)
   - "Как называется методология?"
   - Валидация: `^[a-z][a-z0-9_]*$`

2. **Человекочитаемое название**
   - "Как называть для людей?"

3. **Домен**
   - "К какой области относится?"
   - Варианты: development, marketing, legal, operations, hr, finance, custom

4. **Проблема**
   - "Какую проблему решает?"

5. **Участники (preview)**
   - "Кто будет участвовать?"
   - Варианты: Human only, AI only, Human+AI, Human+AI+System

**После ответов:**
```
Call: meta_create_namespace
Args: { name: "{name}", description: "{problem}" }
```

**Шаблон:** `templates/phases/CONCEPTION.md`

---

### Phase 2: ENTITY_DESIGN

**Цель:** Определить центральную сущность.

**Контекст для пользователя:**
> Entity — бизнес-объект, проходящий через все States.
> Примеры: Document, Order, Ticket, Campaign, Release.

**Вопросы:**

1. **Тип Entity**
   - "Какой объект проходит через процесс?"

2. **Поля (Schema)**
   - "Какие поля у объекта?"
   - Формат: имя, тип, required, описание

3. **Secondary Entities**
   - "Будут ли дополнительные сущности?"

**После ответов:** Обновить `methodology.yaml → entities[]`

**Шаблон:** `templates/phases/ENTITY_DESIGN.md`

---

### Phase 3: STATES_DESIGN

**Цель:** Определить жизненный цикл.

**Контекст:**
> States: Initial (начальный), Working (работа), Waiting (ожидание),
> Terminal (конечный), Error (ошибка).

**Вопросы:**

1. **Initial State** — "Начальное состояние?"
2. **Working States** — "Рабочие фазы?"
3. **Waiting States** — "Фазы ожидания?"
4. **Terminal Success** — "Успешное завершение?"
5. **Terminal Failure** — "Варианты неуспеха?"
6. **Error State** — "Состояние ошибки?"

**Шаблон:** `templates/phases/STATES_DESIGN.md`

---

### Phase 4: FACTS_DESIGN

**Цель:** Определить переходы между States.

**Контекст:**
> Facts — события в прошедшем времени (Created, Submitted, Approved).
> Каждый Fact: from_state → to_state.

**Вопросы:**

1. **Transitions** — "Какие переходы между состояниями?"
2. **Conditional Transitions** — "Есть ли переходы с условиями?"

**Шаблон:** `templates/phases/FACTS_DESIGN.md`

---

### Phase 5: WORKFORCE_DESIGN

**Цель:** Определить участников и инструменты.

**Контекст:**
> Actors: Human, AI, System.
> Tools: UI, API, LLM, Script, MCP, Manual.

**Вопросы:**

1. **Human Actors** — "Какие роли у людей?"
2. **AI Actors** — "Какие AI-агенты?"
3. **System Actors** — "Системные участники?"
4. **Tools** — "Какие инструменты?"

**Проверка:** Actor-Tool совместимость.

**Шаблон:** `templates/phases/WORKFORCE_DESIGN.md`

---

### Phase 6: ACTIONS_DESIGN

**Цель:** Определить действия.

**Контекст:**
> Actions — единицы работы (глаголы: Create, Review, Approve).
> Каждый Action: actor + tool + allowed_in_states.

**Вопросы:**

1. **Actions per State** — "Какие действия в каждом State?"
2. **Retry config** — "Какие Actions требуют retry?"

**Проверки:**
- Все States имеют Actions
- Все Facts triggered by Actions

**Шаблон:** `templates/phases/ACTIONS_DESIGN.md`

---

### Phase 7: RULES_DESIGN

**Цель:** Определить ограничения.

**Контекст:**
> Rules: Precondition, Guard, Timeout, Constraint, Invariant.
> on_violation: Block, Redirect, Alert, Escalate.

**Вопросы:**

1. **Preconditions** — "Условия ДО действий?"
2. **Guards** — "Условия на переходах?"
3. **Timeouts** — "Ограничения по времени?"
4. **Constraints** — "Общие ограничения?"

**Шаблон:** `templates/phases/RULES_DESIGN.md`

---

### Phase 8: VALIDATION

**Цель:** Проверить методологию.

```
Call: meta_validate
Args: { namespace: "{name}", level: "all" }
```

**Уровни:**
- L1: Schema validation
- L2: Link validation
- L3: Static analysis

**При ошибках:** Показать ошибки, предложить вернуться к фазе.

**Шаблон:** `templates/phases/VALIDATION.md`

---

### Phase 9: COMPLETE

**Цель:** Финальный отчёт.

```
✅ Методология '{name}' создана!

Файлы:
- namespace.yaml
- methodology.yaml (8 элементов заполнены)
- README.md
- GLOSSARY.md

Сводка:
- Entities: {count}
- States: {count}
- Actors: {count}
- Tools: {count}
- Actions: {count}
- Facts: {count}
- Rules: {count}

Следующие шаги:
1. Добавить skills/
2. Добавить processes/
3. Интегрировать с MCP
```

**Шаблон:** `templates/phases/COMPLETE.md`

---

## MCP Tools Reference

| Tool | Purpose |
|------|---------|
| `meta_create_namespace` | Создать namespace со структурой |
| `meta_validate` | Валидировать methodology.yaml |

---

## Error Handling

### MCP Server Unavailable

```
❌ MCP сервер недоступен. Wizard mode требует MCP.
Запустите: node tools/command-center/dist/mcp/server.js
```

### Namespace Already Exists

```
❌ Namespace '{name}' уже существует.
Варианты:
1. Выбрать другое имя
2. Удалить существующий
3. Использовать /meta-validate для проверки
```

### Validation Failed

```
⚠️ Валидация выявила ошибки:

{errors}

Вернуться к фазе {phase}?
```

---

## Example Session (Wizard Mode)

```
User: /meta-new-methodology --wizard

Claude: Начинаем создание методологии в режиме Wizard.

═══════════════════════════════════════════════════════
  Phase 1/9: CONCEPTION
═══════════════════════════════════════════════════════

Собираем базовую информацию о методологии.

❓ Как называется методология? (snake_case)

User: document_approval

Claude: ✓ Название: document_approval

❓ Человекочитаемое название?

User: Document Approval Process

Claude: ✓ Название: Document Approval Process

❓ К какой области относится?
1. Development
2. Marketing
3. Legal
4. Operations
5. Other

User: 4

Claude: ✓ Домен: Operations

❓ Какую проблему решает эта методология?

User: Согласование документов занимает слишком много времени, статусы непрозрачны

Claude: ✓ Проблема зафиксирована

❓ Кто будет участвовать?
1. Только люди
2. Только AI
3. Люди + AI совместно
4. Люди + AI + Автоматизация

User: 3

Claude: ✓ Участники: Human + AI collaboration

[meta_create_namespace] → success

═══════════════════════════════════════════════════════
  Phase 2/9: ENTITY_DESIGN
═══════════════════════════════════════════════════════

Определяем центральную сущность процесса.

ℹ️ Entity — бизнес-объект, проходящий через все States.
   Примеры: Document, Order, Ticket, Campaign.

❓ Какой объект проходит через весь процесс?

User: Document

Claude: ✓ Entity: Document

❓ Какие поля у Document? (формат: имя: тип)
   Типы: string, number, boolean, date, enum[...]

User:
- title: string (required)
- content: string (required)
- author_id: string (required)
- status: enum[draft, review, approved, rejected]
- created_at: date

Claude: ✓ Schema определена (5 полей)

... [продолжение по всем фазам] ...

═══════════════════════════════════════════════════════
  Phase 8/9: VALIDATION
═══════════════════════════════════════════════════════

[meta_validate] → L1 ✓ L2 ✓ L3 ✓

═══════════════════════════════════════════════════════
  Phase 9/9: COMPLETE
═══════════════════════════════════════════════════════

✅ Методология 'document_approval' создана!

Сводка:
- Entities: 1 (Document)
- States: 6 (Created → Drafting → Review → Approved/Rejected/Failed)
- Actors: 3 (Author, Reviewer, AI Checker)
- Tools: 4 (Editor UI, Review UI, LLM API, Email API)
- Actions: 8
- Facts: 7
- Rules: 5

Файлы: namespaces/document_approval/

Следующие шаги:
1. Просмотреть methodology.yaml
2. Добавить skills/ для автоматизации
3. Добавить processes/ для типовых сценариев
```

---

## Reference

- Process definition: `namespaces/meta/processes/methodology_creation.yaml`
- Phase templates: `namespaces/meta/templates/phases/`
- Meta-methodology spec: `namespaces/meta/README.md`
- Schema: `namespaces/meta/schema/meta-methodology.schema.yaml`
- Validation skill: `/meta-validate`
