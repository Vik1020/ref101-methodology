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
      MCP-first Architecture (v1.20.0):
      - Add pcc_init_release tool (atomically creates state + RELEASE.md)
      - Add auto_transition parameter to pcc_create_artifact
      - Add PHASE_ARTIFACT_MAP documentation
  - version: "1.0.0"
    date: 2026-01-07
    changes: |
      Initial version:
      - 3-Layer Enforcement Architecture
      - MCP Tools Contract
      - State Storage Design
      - Permission Configuration
---

# Workflow Enforcement Guide

> **Для разработчиков PCC.** Как гарантировать выполнение workflow с валидаторами,
> исключив возможность обхода процесса со стороны LLM.

---

## Содержание

1. [Постановка проблемы](#постановка-проблемы)
2. [Архитектура Enforcement](#архитектура-enforcement)
3. [State Storage Design](#state-storage-design)
4. [MCP Tools Contract](#mcp-tools-contract)
5. [Интеграция валидаторов](#интеграция-валидаторов)
6. [Конфигурация прав доступа](#конфигурация-прав-доступа)
7. [Руководство по настройке](#руководство-по-настройке)
8. [Troubleshooting](#troubleshooting)

---

## Постановка проблемы

### Почему LLM может обойти workflow?

В текущей архитектуре (v1.16.0) LLM является **оркестратором workflow**:

```
┌─────────────────────────────────────────────────────────────┐
│  RELEASE file (YAML frontmatter) - SSOT for progress        │
│                                                              │
│  workflow_state:     # Current phase                         │
│  phase_history:      # Completed phases + validators         │
│  transition_log:     # Transitions + approvals               │
└─────────────────────────────────────────────────────────────┘
          ▲                              ▲
          │ writes                       │ reads
┌─────────────────────┐      ┌─────────────────────┐
│   Claude (LLM)      │      │   PCC Web/CLI       │
│   Primary driver    │      │   UI display        │
└─────────────────────┘      └─────────────────────┘
```

**Проблема:** LLM имеет прямой доступ к `Edit` tool и может:
- Редактировать RELEASE.md без выполнения валидаторов
- Пропустить phase_history, оставив его пустым
- Перейти к следующей фазе без approval

### Реальный пример: v1.16.0

Релиз v1.16.0 был выполнен с пустым `phase_history`:

```yaml
# БЫЛО (ошибка)
workflow_state:
  current_phase: DEPLOYED
phase_history: []        # ПУСТО!
transition_log: []       # ПУСТО!
```

**Результат в UI:** "Workflow tracking not available for this release"

**Причина:** Claude выполнил workflow "в уме", не обновляя phase_history.
Валидатор `current_phase_has_history` существует, но имеет backward-compat
(пропускает пустой history для старых релизов).

### Что теряем без enforcement?

| Потеря | Последствие |
|--------|-------------|
| Пропущенные валидаторы | Невалидные артефакты в production |
| Пустой phase_history | Нет audit trail, нет timeline в UI |
| Skipped approvals | Нарушение процесса, compliance риски |
| Inconsistent state | RELEASE.md расходится с реальностью |

---

## Архитектура Enforcement

### 3 уровня защиты

```
┌───────────────────────────────────────────────────────────────────┐
│                     Layer 1: MCP Tools                            │
│                     (Primary Interface)                           │
│                                                                   │
│   pcc_workflow_status    pcc_transition    pcc_create_artifact   │
│          │                     │                   │              │
│          └─────────────────────┼───────────────────┘              │
│                                │                                  │
│                                ▼                                  │
├───────────────────────────────────────────────────────────────────┤
│                     Layer 2: State Storage                        │
│                     (.pcc/ directory)                             │
│                                                                   │
│   .pcc/                                                           │
│   ├── workflow.json        ← Source of Truth                      │
│   └── releases/                                                   │
│       └── v1.17.0.json     ← Per-release state                   │
│                                                                   │
│   RELEASE.md               ← Generated artifact (read-only)      │
├───────────────────────────────────────────────────────────────────┤
│                     Layer 3: Permission Deny                      │
│                     (Backup Enforcement)                          │
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

| Слой | Что делает | Что предотвращает |
|------|------------|-------------------|
| **MCP Tools** | Единственный интерфейс для workflow операций | Прямые вызовы Edit/Write для state |
| **State Storage** | Отдельное хранилище, недоступное через Edit | Corruption через RELEASE.md editing |
| **Permission Deny** | Блокирует Edit/Write для .pcc/ | Последний рубеж, если MCP обойден |

### Поток данных

```
┌─────────┐     MCP call      ┌─────────┐     validates     ┌───────────┐
│  Claude │ ─────────────────>│   PCC   │ ─────────────────>│ Validators│
│  (LLM)  │                   │  Server │                   │           │
└─────────┘                   └─────────┘                   └───────────┘
                                   │                              │
                                   │ if passed                    │
                                   ▼                              │
                            ┌─────────────┐                       │
                            │ .pcc/state  │<──────────────────────┘
                            │  (write)    │   update state
                            └─────────────┘
                                   │
                                   │ regenerate
                                   ▼
                            ┌─────────────┐
                            │ RELEASE.md  │
                            │ (artifact)  │
                            └─────────────┘
```

---

## State Storage Design

### Директория `.pcc/`

```
.pcc/
├── workflow.json           # Global workflow config
├── releases/
│   ├── v1.17.0.json       # Release state (current_phase, history, validators)
│   └── v1.18.0.json
└── lock                    # Prevents concurrent modifications
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
| **Источник** | Генерируется из .pcc/ | Source of Truth |
| **Редактирование** | Только PCC Server | Только PCC Server |
| **Git** | Коммитится | `.gitignore` (опционально) |
| **Доступ LLM** | Read-only | Denied |

### Регенерация артефактов

После каждого изменения state, PCC регенерирует RELEASE.md:

```typescript
// После успешного transition
await stateStorage.save(releaseId, newState);
await artifactGenerator.regenerate(releaseId, newState);
```

---

## MCP Tools Contract

### Обзор tools (v1.20.0+)

| Tool | Назначение | Requires Phase |
|------|------------|----------------|
| `pcc_init_release` | **NEW** Создать релиз (state + RELEASE.md атомарно) | - |
| `pcc_workflow_status` | Получить текущее состояние | - |
| `pcc_workflow_validate` | Проверить валидаторы фазы | - |
| `pcc_workflow_transition` | Перейти к следующей фазе | Current phase |
| `pcc_create_artifact` | Создать артефакт с auto-transition | PHASE_ARTIFACT_MAP |

> **MCP-first (v1.20.0+):** Используйте `pcc_init_release` + `pcc_create_artifact` с `auto_transition: true`.
> Это гарантирует 100% запись workflow state (vs ~20% при использовании Edit напрямую).

---

### pcc_init_release (v1.20.0)

Атомарно создаёт state file (`.pcc/releases/vX.Y.Z.json`) и `RELEASE.md`.
Гарантирует, что каждый релиз имеет workflow tracking с первой секунды.

**Request:**
```json
{
  "tool": "pcc_init_release",
  "arguments": {
    "version": "v1.21.0",
    "feature_name": "dark_theme",
    "process_id": "feature_full_auto",
    "problem_statement": "Need dark mode for better UX",
    "solution_summary": "Add CSS variables for theming"
  }
}
```

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `version` | Yes | vX.Y.Z format (e.g., "v1.21.0" or "1.21.0") |
| `feature_name` | Yes | snake_case name for filename |
| `process_id` | No | `feature_full_auto`, `feature_full`, `bugfix_simple` |
| `problem_statement` | Yes | Problem description |
| `solution_summary` | No | Solution overview |

**Response (success):**
```json
{
  "success": true,
  "release_id": "RELEASE_v1_21_0_dark_theme",
  "state_path": ".pcc/releases/v1.21.0.json",
  "release_path": "docs/releases/v1.21.0/RELEASE_v1_21_0_dark_theme.md",
  "current_phase": "RELEASE"
}
```

**Response (error):**
```json
{
  "success": false,
  "error": "RELEASE_EXISTS",
  "hint": "Release v1.21.0 already exists"
}
```

---

### pcc_workflow_status

Возвращает текущее состояние workflow.

**Request:**
```json
{
  "tool": "pcc_workflow_status",
  "arguments": {
    "release_id": "v1.17.0"
  }
}
```

**Response:**
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

**Request:**
```json
{
  "tool": "pcc_workflow_validate",
  "arguments": {
    "release_id": "v1.17.0",
    "phase": "BC_DRAFT"
  }
}
```

**Response:**
```json
{
  "phase": "BC_DRAFT",
  "all_passed": false,
  "validators": [
    { "id": "bc_has_goals", "status": "passed" },
    { "id": "bc_has_actors", "status": "failed", "reason": "BC must define actors" },
    { "id": "bc_has_scenarios", "status": "passed" }
  ],
  "can_transition": false,
  "blocking_validators": ["bc_has_actors"]
}
```

---

### pcc_workflow_transition

Выполняет переход к следующей фазе с валидацией.

**Request:**
```json
{
  "tool": "pcc_workflow_transition",
  "arguments": {
    "release_id": "v1.17.0",
    "to_phase": "BC_APPROVED",
    "approval_note": "BC approved by user"
  }
}
```

**Response (success):**
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

**Response (failure):**
```json
{
  "success": false,
  "error": "VALIDATORS_FAILED",
  "from_phase": "BC_DRAFT",
  "to_phase": "BC_APPROVED",
  "blocking_validators": [
    { "id": "bc_has_actors", "reason": "BC must define actors" }
  ],
  "hint": "Add actors section to BC_delta file"
}
```

---

### pcc_create_artifact (v1.20.0 enhanced)

Создаёт артефакт (BC_delta, AC_delta, etc) с проверкой фазы и **опциональным auto-transition**.

**Request:**
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

**Parameters:**

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `release_id` | Yes | — | Version string (e.g., "v1.21.0") |
| `artifact_type` | Yes | — | BC_delta, AC_delta, PLAN_FINALIZE, PC, IC, QA |
| `content` | Yes | — | Full file content |
| `auto_transition` | No | `true` | Automatically transition to next phase |

**Validation (PHASE_ARTIFACT_MAP):**
1. Проверяет, что `artifact_type` разрешён для `current_phase` (см. PHASE_ARTIFACT_MAP)
2. Если не разрешён — ошибка PHASE_MISMATCH
3. Если `auto_transition: true` — автоматически переходит к следующей фазе

**Response (success with auto_transition):**
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

**Response (wrong phase):**
```json
{
  "success": false,
  "error": "PHASE_MISMATCH",
  "current_phase": "QA_TESTING",
  "allowed_artifacts": ["QA"],
  "requested_artifact": "BC_delta",
  "hint": "Use pcc_workflow_status to check current phase"
}
```

---

### PHASE_ARTIFACT_MAP (v1.20.0)

Определяет, какие артефакты можно создавать в каждой фазе:

| Current Phase | Allowed Artifacts | Auto-Transition To |
|---------------|-------------------|-------------------|
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
1. pcc_init_release(version: "v1.21.0", ...) → phase: RELEASE

2. pcc_create_artifact(artifact_type: "BC_delta", auto_transition: true)
   → creates BC_delta → transitions to BC_DRAFT

3. pcc_create_artifact(artifact_type: "AC_delta", auto_transition: true)
   → creates AC_delta → transitions to AC_DRAFT

4. ... и так далее через все фазы
```

---

## Интеграция валидаторов

### Когда выполняются валидаторы?

```
pcc_workflow_transition(to_phase: BC_APPROVED)
          │
          ▼
┌─────────────────────────────────────┐
│  1. Load process definition          │
│     (feature_full.json)              │
└─────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│  2. Get validators for BC_DRAFT      │
│     ["bc_has_goals", "bc_has_actors",│
│      "bc_has_scenarios"]             │
└─────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│  3. Run each validator               │
│     - Load BC_delta file             │
│     - Parse context                  │
│     - Execute validator function     │
└─────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│  4. Check results                    │
│     - All passed? → Allow transition │
│     - Any failed? → Block + report   │
└─────────────────────────────────────┘
```

### Preconditions из TRANSITIONS

Валидаторы определяются в process definition:

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

### Error Handling

При ошибке валидации MCP возвращает структурированный ответ:

```json
{
  "success": false,
  "error": "VALIDATORS_FAILED",
  "blocking_validators": [
    {
      "id": "bc_has_actors",
      "status": "failed",
      "reason": "BC must define at least one actor",
      "hint": "Add ## Actors section with actor definitions"
    }
  ],
  "passed_validators": ["bc_has_goals", "bc_has_scenarios"],
  "documentation": "See VALIDATORS_GUIDE.md for validator requirements"
}
```

LLM получает конкретные инструкции для исправления.

---

## Конфигурация прав доступа

### Claude Code Settings

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

| Pattern | Что блокирует |
|---------|---------------|
| `Edit(file:.pcc/**)` | Редактирование state files |
| `Write(file:.pcc/**)` | Создание/перезапись state files |
| `Bash(rm .pcc/**)` | Удаление через bash |

### Что разрешено?

| Action | Зачем |
|--------|-------|
| `Read(file:.pcc/**)` | LLM может читать state для отладки |
| MCP tools | Единственный способ изменить state |

### Escape Hatches для администраторов

Если нужен ручной доступ к state (recovery, debugging):

```bash
# Временно отключить enforcement
export PCC_ADMIN_MODE=true
pcc state-edit v1.17.0 --phase=BC_DRAFT

# Или через PCC CLI
pcc admin unlock v1.17.0
# ... manual edits ...
pcc admin lock v1.17.0
```

---

## Руководство по настройке

### Prerequisite

- PCC v1.17.0+ (с MCP support)
- Node.js 18+
- Claude Code CLI

### Шаг 1: Запуск MCP Server

```bash
# В директории проекта
cd tools/command-center
npm run mcp-server

# Или с указанием порта
npm run mcp-server -- --port 3031
```

**Output:**
```
PCC MCP Server started on stdio
Available tools: pcc_workflow_status, pcc_workflow_validate, pcc_workflow_transition, pcc_create_artifact
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

# Output:
# Created .pcc/workflow.json
# Created .pcc/releases/
# Added .pcc/ to .gitignore (optional)
# Updated .claude/settings.local.json with deny rules
```

### Шаг 4: Первый workflow с enforcement

```bash
# Создать релиз
pcc release create v1.17.0 --process=feature_full

# Claude теперь может только через MCP:
# 1. pcc_workflow_status - узнать текущую фазу
# 2. pcc_create_artifact - создать BC_delta
# 3. pcc_workflow_validate - проверить валидаторы
# 4. pcc_workflow_transition - перейти к следующей фазе
```

### Проверка enforcement

```bash
# Попробовать напрямую отредактировать state
claude "Edit .pcc/releases/v1.17.0.json and change current_phase to DEPLOYED"

# Expected:
# ❌ Permission denied: Edit(file:.pcc/**) is blocked
# Use pcc_workflow_transition MCP tool instead
```

---

## Troubleshooting

### "MCP server not running"

**Симптом:** Claude не видит pcc_* tools

**Причины:**
1. MCP server не запущен
2. Неправильный путь в settings

**Решение:**
```bash
# Проверить, что server запущен
pgrep -f "mcp/server.js"

# Проверить конфиг
cat .claude/settings.local.json | jq '.mcpServers.pcc'

# Перезапустить
npm run mcp-server
```

---

### "Permission denied" при попытке transition

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

### "State corrupted"

**Симптом:** JSON parse error в .pcc/

**Причины:**
1. Ручное редактирование state
2. Прерванная операция

**Решение:**
```bash
# Восстановить из backup
cp .pcc/releases/v1.17.0.json.bak .pcc/releases/v1.17.0.json

# Или пересоздать из RELEASE.md
pcc admin rebuild-state v1.17.0 --from-release

# Или сбросить к фазе
pcc admin reset v1.17.0 --to-phase=BC_DRAFT
```

---

### "Validator not found"

**Симптом:** `Unknown validator: custom_validator`

**Причины:**
1. Validator не зарегистрирован в validators.ts
2. Опечатка в process definition

**Решение:**
```bash
# Список всех валидаторов
pcc validators list

# Проверить process definition
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

## Related Documentation

| Document | Relationship |
|----------|--------------|
| [WORKFLOW.md](../../WORKFLOW.md) | Phases and transitions (SSOT) |
| [VALIDATORS_GUIDE.md](VALIDATORS_GUIDE.md) | Validator logic details |
| [PROCESS_COMPOSER_GUIDE.md](PROCESS_COMPOSER_GUIDE.md) | Process definitions |
