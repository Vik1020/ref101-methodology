---
context_id: GUIDE_workflow_enforcement
version: "1.1.0"
type: guide
status: draft
audience: developers
language: ru
owner: DevOps
last_updated: 2026-01-07
related_documents:
  - WORKFLOW.md
  - VALIDATORS_GUIDE.md
  - PROCESS_COMPOSER_GUIDE.md
changelog:
  - version: "1.1.0"
    date: 2026-01-07
    changes: |
      MCP-first архитектура (v1.20.0):
      - Добавлен инструмент pcc_init_release (атомарно создаёт state + RELEASE.md)
      - Добавлен параметр auto_transition к pcc_create_artifact
      - Добавлена документация PHASE_ARTIFACT_MAP
  - version: "1.0.0"
    date: 2026-01-07
    changes: |
      Начальная версия:
      - 3-уровневая архитектура Enforcement
      - Контракт MCP-инструментов
      - Дизайн хранилища состояния
      - Конфигурация прав доступа
---

# Руководство по принудительному выполнению Workflow

> **Для разработчиков PCC.** Как гарантировать выполнение workflow с валидаторами,
> исключив возможность обхода процесса со стороны LLM.

---

## Содержание

1. [Постановка проблемы](#постановка-проблемы)
2. [Архитектура Enforcement](#архитектура-enforcement)
3. [Дизайн хранилища состояния](#дизайн-хранилища-состояния)
4. [Контракт MCP-инструментов](#контракт-mcp-инструментов)
5. [Интеграция валидаторов](#интеграция-валидаторов)
6. [Конфигурация прав доступа](#конфигурация-прав-доступа)
7. [Руководство по настройке](#руководство-по-настройке)
8. [Устранение неполадок](#устранение-неполадок)

---

## Постановка проблемы

### Почему LLM может обойти workflow?

В текущей архитектуре (v1.16.0) LLM является **оркестратором workflow**:

```
┌─────────────────────────────────────────────────────────────┐
│  RELEASE-файл (YAML frontmatter) — SSOT для прогресса       │
│                                                              │
│  workflow_state:     # Текущая фаза                          │
│  phase_history:      # Завершённые фазы + валидаторы         │
│  transition_log:     # Переходы + согласования               │
└─────────────────────────────────────────────────────────────┘
          ▲                              ▲
          │ записывает                   │ читает
┌─────────────────────┐      ┌─────────────────────┐
│   Claude (LLM)      │      │   PCC Web/CLI       │
│   Основной драйвер  │      │   UI-отображение    │
└─────────────────────┘      └─────────────────────┘
```

**Проблема:** LLM имеет прямой доступ к инструменту `Edit` и может:
- Редактировать RELEASE.md без выполнения валидаторов
- Пропустить phase_history, оставив его пустым
- Перейти к следующей фазе без согласования

### Реальный пример: v1.16.0

Релиз v1.16.0 был выполнен с пустым `phase_history`:

```yaml
# БЫЛО (ошибка)
workflow_state:
  current_phase: DEPLOYED
phase_history: []        # ПУСТО!
transition_log: []       # ПУСТО!
```

**Результат в UI:** «Отслеживание workflow недоступно для этого релиза»

**Причина:** Claude выполнил workflow «в уме», не обновляя phase_history.
Валидатор `current_phase_has_history` существует, но имеет обратную совместимость
(пропускает пустую историю для старых релизов).

### Что теряем без enforcement?

| Потеря | Последствие |
|--------|-------------|
| Пропущенные валидаторы | Невалидные артефакты в production |
| Пустой phase_history | Нет audit trail, нет timeline в UI |
| Пропущенные согласования | Нарушение процесса, compliance-риски |
| Несогласованное состояние | RELEASE.md расходится с реальностью |

---

## Архитектура Enforcement

### 3 уровня защиты

```
┌───────────────────────────────────────────────────────────────────┐
│                     Уровень 1: MCP-инструменты                    │
│                     (Основной интерфейс)                          │
│                                                                   │
│   pcc_workflow_status    pcc_transition    pcc_create_artifact   │
│          │                     │                   │              │
│          └─────────────────────┼───────────────────┘              │
│                                │                                  │
│                                ▼                                  │
├───────────────────────────────────────────────────────────────────┤
│                     Уровень 2: Хранилище состояния                │
│                     (директория .pcc/)                            │
│                                                                   │
│   .pcc/                                                           │
│   ├── workflow.json        ← Источник истины                      │
│   └── releases/                                                   │
│       └── v1.17.0.json     ← Состояние релиза                    │
│                                                                   │
│   RELEASE.md               ← Генерируемый артефакт (только чтение)│
├───────────────────────────────────────────────────────────────────┤
│                     Уровень 3: Запрет прав                        │
│                     (Резервное принуждение)                       │
│                                                                   │
│   .claude/settings.local.json:                                    │
│   {                                                               │
│     "permissions": {                                              │
│       "deny": [                                                   │
│         "Edit(file:.pcc/**)",                                     │
│         "Write(file:.pcc/**)"                                     │
│       ]                                                           │
│     }                                                             │
│   }                                                               │
└───────────────────────────────────────────────────────────────────┘
```

### Как это гарантирует enforcement?

| Уровень | Что делает | Что предотвращает |
|---------|------------|-------------------|
| **MCP-инструменты** | Единственный интерфейс для операций workflow | Прямые вызовы Edit/Write для state |
| **Хранилище состояния** | Отдельное хранилище, недоступное через Edit | Повреждение через редактирование RELEASE.md |
| **Запрет прав** | Блокирует Edit/Write для .pcc/ | Последний рубеж, если MCP обойдён |

### Поток данных

```
┌─────────┐     MCP-вызов     ┌─────────┐     валидирует     ┌───────────┐
│  Claude │ ─────────────────>│   PCC   │ ─────────────────>│ Валидаторы│
│  (LLM)  │                   │  Server │                   │           │
└─────────┘                   └─────────┘                   └───────────┘
                                   │                              │
                                   │ если пройдено                │
                                   ▼                              │
                            ┌─────────────┐                       │
                            │ .pcc/state  │<──────────────────────┘
                            │  (запись)   │   обновить state
                            └─────────────┘
                                   │
                                   │ регенерировать
                                   ▼
                            ┌─────────────┐
                            │ RELEASE.md  │
                            │ (артефакт)  │
                            └─────────────┘
```

---

## Дизайн хранилища состояния

### Директория `.pcc/`

```
.pcc/
├── workflow.json           # Глобальная конфигурация workflow
├── releases/
│   ├── v1.17.0.json       # Состояние релиза (current_phase, history, validators)
│   └── v1.18.0.json
└── lock                    # Предотвращает одновременные изменения
```

### workflow.json — глобальная конфигурация

```json
{
  "version": "1.0.0",
  "default_process": "feature_full",
  "active_release": "v1.17.0",
  "last_updated": "2026-01-07T10:00:00+03:00"
}
```

### releases/v1.17.0.json — состояние релиза

```json
{
  "release_id": "RELEASE_v1_17_0_enforcement",
  "version": "1.17.0",
  "process_id": "feature_full",

  "workflow_state": {
    "current_phase": "BC_DRAFT",
    "started_at": "2026-01-07T10:00:00+03:00"
  },

  "phase_history": [
    {
      "phase": "RELEASE",
      "entered_at": "2026-01-07T10:00:00+03:00",
      "exited_at": "2026-01-07T10:15:00+03:00",
      "validators": {
        "release_has_problem": { "status": "passed" },
        "release_has_scope": { "status": "passed" }
      },
      "skipped": false
    }
  ],

  "transition_log": [
    {
      "from": "RELEASE",
      "to": "BC_DRAFT",
      "timestamp": "2026-01-07T10:15:00+03:00",
      "approval_by": null,
      "validators_passed": ["release_has_problem", "release_has_scope"]
    }
  ]
}
```

### Почему разделение необходимо?

| Аспект | RELEASE.md | .pcc/releases/*.json |
|--------|------------|---------------------|
| **Назначение** | Артефакт для людей (Markdown) | State для машины (JSON) |
| **Источник** | Генерируется из .pcc/ | Источник истины |
| **Редактирование** | Только PCC Server | Только PCC Server |
| **Git** | Коммитится | `.gitignore` (опционально) |
| **Доступ LLM** | Только чтение | Запрещён |

### Регенерация артефактов

После каждого изменения state PCC регенерирует RELEASE.md:

```typescript
// После успешного перехода
await stateStorage.save(releaseId, newState);
await artifactGenerator.regenerate(releaseId, newState);
```

---

## Контракт MCP-инструментов

### Обзор инструментов (v1.20.0+)

| Инструмент | Назначение | Требуемая фаза |
|------------|------------|----------------|
| `pcc_init_release` | **НОВЫЙ** Создать релиз (state + RELEASE.md атомарно) | - |
| `pcc_workflow_status` | Получить текущее состояние | - |
| `pcc_workflow_validate` | Проверить валидаторы фазы | - |
| `pcc_workflow_transition` | Перейти к следующей фазе | Текущая фаза |
| `pcc_create_artifact` | Создать артефакт с auto-transition | PHASE_ARTIFACT_MAP |

> **MCP-first (v1.20.0+):** Используйте `pcc_init_release` + `pcc_create_artifact` с `auto_transition: true`.
> Это гарантирует 100% запись workflow state (против ~20% при использовании Edit напрямую).

---

### pcc_init_release (v1.20.0)

Атомарно создаёт state-файл (`.pcc/releases/vX.Y.Z.json`) и `RELEASE.md`.
Гарантирует, что каждый релиз имеет отслеживание workflow с первой секунды.

**Запрос:**
```json
{
  "tool": "pcc_init_release",
  "arguments": {
    "version": "v1.21.0",
    "feature_name": "dark_theme",
    "process_id": "feature_full_auto",
    "problem_statement": "Нужен тёмный режим для лучшего UX",
    "solution_summary": "Добавить CSS-переменные для тем"
  }
}
```

**Параметры:**

| Параметр | Обязательный | Описание |
|----------|--------------|----------|
| `version` | Да | Формат vX.Y.Z (например, «v1.21.0» или «1.21.0») |
| `feature_name` | Да | snake_case имя для файла |
| `process_id` | Нет | `feature_full_auto`, `feature_full`, `bugfix_simple` |
| `problem_statement` | Да | Описание проблемы |
| `solution_summary` | Нет | Обзор решения |

**Ответ (успех):**
```json
{
  "success": true,
  "release_id": "RELEASE_v1_21_0_dark_theme",
  "state_path": ".pcc/releases/v1.21.0.json",
  "release_path": "docs/releases/v1.21.0/RELEASE_v1_21_0_dark_theme.md",
  "current_phase": "RELEASE"
}
```

**Ответ (ошибка):**
```json
{
  "success": false,
  "error": "RELEASE_EXISTS",
  "hint": "Релиз v1.21.0 уже существует"
}
```

---

### pcc_workflow_status

Возвращает текущее состояние workflow.

**Запрос:**
```json
{
  "tool": "pcc_workflow_status",
  "arguments": {
    "release_id": "v1.17.0"
  }
}
```

**Ответ:**
```json
{
  "release_id": "v1.17.0",
  "current_phase": "BC_DRAFT",
  "process_id": "feature_full",
  "started_at": "2026-01-07T10:00:00+03:00",
  "phase_history": [...],
  "available_transitions": [
    {
      "to": "BC_APPROVED",
      "requires_approval": true,
      "validators": ["bc_has_goals", "bc_has_actors", "bc_has_scenarios"]
    }
  ]
}
```

---

### pcc_workflow_validate

Проверяет валидаторы текущей или указанной фазы.

**Запрос:**
```json
{
  "tool": "pcc_workflow_validate",
  "arguments": {
    "release_id": "v1.17.0",
    "phase": "BC_DRAFT"
  }
}
```

**Ответ:**
```json
{
  "phase": "BC_DRAFT",
  "all_passed": false,
  "validators": [
    { "id": "bc_has_goals", "status": "passed" },
    { "id": "bc_has_actors", "status": "failed", "reason": "BC должен определить акторов" },
    { "id": "bc_has_scenarios", "status": "passed" }
  ],
  "can_transition": false,
  "blocking_validators": ["bc_has_actors"]
}
```

---

### pcc_workflow_transition

Выполняет переход к следующей фазе с валидацией.

**Запрос:**
```json
{
  "tool": "pcc_workflow_transition",
  "arguments": {
    "release_id": "v1.17.0",
    "to_phase": "BC_APPROVED",
    "approval_note": "BC одобрен пользователем"
  }
}
```

**Ответ (успех):**
```json
{
  "success": true,
  "from_phase": "BC_DRAFT",
  "to_phase": "BC_APPROVED",
  "validators_passed": ["bc_has_goals", "bc_has_actors", "bc_has_scenarios"],
  "artifact_regenerated": true,
  "next_phase": "AC_DRAFT"
}
```

**Ответ (ошибка):**
```json
{
  "success": false,
  "error": "VALIDATORS_FAILED",
  "from_phase": "BC_DRAFT",
  "to_phase": "BC_APPROVED",
  "blocking_validators": [
    { "id": "bc_has_actors", "reason": "BC должен определить акторов" }
  ],
  "hint": "Добавьте секцию акторов в файл BC_delta"
}
```

---

### pcc_create_artifact (расширен в v1.20.0)

Создаёт артефакт (BC_delta, AC_delta и т.д.) с проверкой фазы и **опциональным auto-transition**.

**Запрос:**
```json
{
  "tool": "pcc_create_artifact",
  "arguments": {
    "release_id": "v1.17.0",
    "artifact_type": "BC_delta",
    "content": "---\ncontext_id: BC_delta_dark_theme\n...",
    "auto_transition": true
  }
}
```

**Параметры:**

| Параметр | Обязательный | По умолчанию | Описание |
|----------|--------------|--------------|----------|
| `release_id` | Да | — | Строка версии (например, «v1.21.0») |
| `artifact_type` | Да | — | BC_delta, AC_delta, PLAN_FINALIZE, PC, IC, QA |
| `content` | Да | — | Полное содержимое файла |
| `auto_transition` | Нет | `true` | Автоматически переходить к следующей фазе |

**Валидация (PHASE_ARTIFACT_MAP):**
1. Проверяет, что `artifact_type` разрешён для `current_phase` (см. PHASE_ARTIFACT_MAP)
2. Если не разрешён — ошибка PHASE_MISMATCH
3. Если `auto_transition: true` — автоматически переходит к следующей фазе

**Ответ (успех с auto_transition):**
```json
{
  "success": true,
  "artifact_path": "docs/releases/v1.21.0/BC_delta_dark_theme.md",
  "artifact_type": "BC_delta",
  "transitioned": true,
  "new_phase": "BC_DRAFT",
  "previous_phase": "RELEASE"
}
```

**Ответ (неправильная фаза):**
```json
{
  "success": false,
  "error": "PHASE_MISMATCH",
  "current_phase": "QA_TESTING",
  "allowed_artifacts": ["QA"],
  "requested_artifact": "BC_delta",
  "hint": "Используйте pcc_workflow_status для проверки текущей фазы"
}
```

---

### PHASE_ARTIFACT_MAP (v1.20.0)

Определяет, какие артефакты можно создавать в каждой фазе:

| Текущая фаза | Разрешённые артефакты | Auto-Transition к |
|--------------|----------------------|-------------------|
| RELEASE | BC_delta | BC_DRAFT |
| BC_DRAFT | BC_delta, AC_delta | AC_DRAFT |
| BC_APPROVED | BC_delta, AC_delta | AC_DRAFT |
| AC_DRAFT | AC_delta, PLAN_FINALIZE | PLAN_FINALIZE |
| AC_APPROVED | AC_delta, PLAN_FINALIZE | PLAN_FINALIZE |
| PLAN_FINALIZE | PLAN_FINALIZE, PC | PC_DEVELOPMENT |
| PC_DEVELOPMENT | PC, IC | IC_VALIDATION |
| PC_REVIEW | PC, IC | IC_VALIDATION |
| IC_VALIDATION | IC, QA | QA_TESTING |
| QA_TESTING | QA | — |

**Пример workflow (MCP-first):**
```
1. pcc_init_release(version: "v1.21.0", ...) → фаза: RELEASE

2. pcc_create_artifact(artifact_type: "BC_delta", auto_transition: true)
   → создаёт BC_delta → переходит к BC_DRAFT

3. pcc_create_artifact(artifact_type: "AC_delta", auto_transition: true)
   → создаёт AC_delta → переходит к AC_DRAFT

4. ... и так далее через все фазы
```

---

## Интеграция валидаторов

### Когда выполняются валидаторы?

```
pcc_workflow_transition(to_phase: BC_APPROVED)
          │
          ▼
┌─────────────────────────────────┐
│  1. Загрузить определение       │
│     процесса (feature_full.json)│
└─────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│  2. Получить валидаторы для     │
│     BC_DRAFT                    │
│     ["bc_has_goals", ...]       │
└─────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│  3. Запустить каждый валидатор  │
│     - Загрузить файл BC_delta   │
│     - Распарсить контекст       │
│     - Выполнить функцию         │
└─────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│  4. Проверить результаты        │
│     - Все пройдены? → Разрешить │
│     - Есть ошибки? → Блок + отчёт│
└─────────────────────────────────┘
```

### Предусловия из TRANSITIONS

Валидаторы определяются в определении процесса:

```json
// feature_full.json
{
  "phases": [
    {
      "id": "BC_DRAFT",
      "validators": ["bc_has_goals", "bc_has_actors", "bc_has_scenarios"],
      "approval": {
        "required": true,
        "approvers": ["product_owner"]
      }
    }
  ]
}
```

### Обработка ошибок

При ошибке валидации MCP возвращает структурированный ответ:

```json
{
  "success": false,
  "error": "VALIDATORS_FAILED",
  "blocking_validators": [
    {
      "id": "bc_has_actors",
      "status": "failed",
      "reason": "BC должен определить хотя бы одного актора",
      "hint": "Добавьте секцию ## Actors с определениями акторов"
    }
  ],
  "passed_validators": ["bc_has_goals", "bc_has_scenarios"],
  "documentation": "См. VALIDATORS_GUIDE.md для требований валидаторов"
}
```

LLM получает конкретные инструкции для исправления.

---

## Конфигурация прав доступа

### Настройки Claude Code

**Файл:** `.claude/settings.local.json`

```json
{
  "permissions": {
    "deny": [
      "Edit(file:.pcc/**)",
      "Write(file:.pcc/**)",
      "Bash(rm -rf .pcc)",
      "Bash(rm .pcc/**)"
    ],
    "allow": [
      "Read(file:.pcc/**)"
    ]
  }
}
```

### Что блокируется?

| Паттерн | Что блокирует |
|---------|---------------|
| `Edit(file:.pcc/**)` | Редактирование state-файлов |
| `Write(file:.pcc/**)` | Создание/перезапись state-файлов |
| `Bash(rm .pcc/**)` | Удаление через bash |

### Что разрешено?

| Действие | Зачем |
|----------|-------|
| `Read(file:.pcc/**)` | LLM может читать state для отладки |
| MCP-инструменты | Единственный способ изменить state |

### Escape Hatches для администраторов

Если нужен ручной доступ к state (восстановление, отладка):

```bash
# Временно отключить enforcement
export PCC_ADMIN_MODE=true
pcc state-edit v1.17.0 --phase=BC_DRAFT

# Или через PCC CLI
pcc admin unlock v1.17.0
# ... ручные правки ...
pcc admin lock v1.17.0
```

---

## Руководство по настройке

### Предварительные требования

- PCC v1.17.0+ (с поддержкой MCP)
- Node.js 18+
- Claude Code CLI

### Шаг 1: Запуск MCP-сервера

```bash
# В директории проекта
cd tools/command-center
npm run mcp-server

# Или с указанием порта
npm run mcp-server -- --port 3031
```

**Вывод:**
```
PCC MCP Server запущен на stdio
Доступные инструменты: pcc_workflow_status, pcc_workflow_validate, pcc_workflow_transition, pcc_create_artifact
```

### Шаг 2: Конфигурация Claude Code

**Файл:** `.claude/settings.local.json`

```json
{
  "mcpServers": {
    "pcc": {
      "type": "stdio",
      "command": "node",
      "args": ["tools/command-center/dist/mcp/server.js"],
      "env": {
        "PROJECT_ROOT": "${workspaceFolder}"
      }
    }
  },
  "permissions": {
    "deny": [
      "Edit(file:.pcc/**)",
      "Write(file:.pcc/**)"
    ]
  }
}
```

### Шаг 3: Инициализация .pcc/

```bash
# Создать структуру директорий
pcc init --enforcement

# Вывод:
# Создан .pcc/workflow.json
# Создан .pcc/releases/
# Добавлен .pcc/ в .gitignore (опционально)
# Обновлён .claude/settings.local.json с правилами запрета
```

### Шаг 4: Первый workflow с enforcement

```bash
# Создать релиз
pcc release create v1.17.0 --process=feature_full

# Claude теперь может только через MCP:
# 1. pcc_workflow_status — узнать текущую фазу
# 2. pcc_create_artifact — создать BC_delta
# 3. pcc_workflow_validate — проверить валидаторы
# 4. pcc_workflow_transition — перейти к следующей фазе
```

### Проверка enforcement

```bash
# Попробовать напрямую отредактировать state
claude "Edit .pcc/releases/v1.17.0.json and change current_phase to DEPLOYED"

# Ожидаемый результат:
# ❌ Доступ запрещён: Edit(file:.pcc/**) заблокирован
# Используйте MCP-инструмент pcc_workflow_transition вместо этого
```

---

## Устранение неполадок

### «MCP-сервер не запущен»

**Симптом:** Claude не видит инструменты pcc_*

**Причины:**
1. MCP-сервер не запущен
2. Неправильный путь в настройках

**Решение:**
```bash
# Проверить, что сервер запущен
pgrep -f "mcp/server.js"

# Проверить конфиг
cat .claude/settings.local.json | jq '.mcpServers.pcc'

# Перезапустить
npm run mcp-server
```

---

### «Доступ запрещён» при попытке перехода

**Симптом:** `VALIDATORS_FAILED` или `PHASE_MISMATCH`

**Причины:**
1. Валидаторы не прошли
2. Неправильная текущая фаза

**Решение:**
```bash
# Проверить текущее состояние
pcc status v1.17.0

# Проверить валидаторы
pcc validate v1.17.0

# Исправить артефакт и повторить
```

---

### «Состояние повреждено»

**Симптом:** Ошибка парсинга JSON в .pcc/

**Причины:**
1. Ручное редактирование state
2. Прерванная операция

**Решение:**
```bash
# Восстановить из бэкапа
cp .pcc/releases/v1.17.0.json.bak .pcc/releases/v1.17.0.json

# Или пересоздать из RELEASE.md
pcc admin rebuild-state v1.17.0 --from-release

# Или сбросить к фазе
pcc admin reset v1.17.0 --to-phase=BC_DRAFT
```

---

### «Валидатор не найден»

**Симптом:** `Unknown validator: custom_validator`

**Причины:**
1. Валидатор не зарегистрирован в validators.ts
2. Опечатка в определении процесса

**Решение:**
```bash
# Список всех валидаторов
pcc validators list

# Проверить определение процесса
cat processes/feature_full.json | jq '.phases[].validators'
```

---

## Миграция с текущей архитектуры

### Для существующих релизов

```bash
# Создать .pcc/ state из RELEASE.md
pcc migrate --from-release docs/releases/v1.16.0/RELEASE_*.md

# Проверить
pcc status v1.16.0
```

### Для новых релизов

Новые релизы автоматически используют enforcement после настройки MCP.

---

## Связанная документация

| Документ | Связь |
|----------|-------|
| [WORKFLOW.md](../../WORKFLOW.md) | Фазы и переходы (SSOT) |
| [VALIDATORS_GUIDE.md](VALIDATORS_GUIDE.md) | Детали логики валидаторов |
| [PROCESS_COMPOSER_GUIDE.md](PROCESS_COMPOSER_GUIDE.md) | Определения процессов |
