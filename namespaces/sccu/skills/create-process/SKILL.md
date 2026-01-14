---
name: create-process
description: Создаёт бизнес-процесс с планом узлов. Используй при "создай процесс", "new business process", "/create-process".
---

# Create Process Skill

Создание бизнес-процесса (Business Process) по workflow `process_creation`.

## Trigger Keywords

- "/create-process"
- "создай процесс"
- "new business process"
- "создай бизнес-процесс"

## Instructions

### Step 0: Parse Request

Extract from user message:
- **process_id**: snake_case (e.g., `payment_processing`)
- **process_name**: Human-readable name (e.g., "Payment Processing")

If not provided, ask user for these parameters.

### Step 1: Initialize Release

```
Call: pcc_init_release
Args: {
  version: "v{X.Y.Z}",
  feature_name: "bp_{process_id}",
  process_id: "process_creation",
  problem_statement: "Create business process: {process_name}"
}
```

### Step 2: GOAL_DEFINITION Phase

1. Ask user for business goal:
   - "Какую бизнес-цель решает этот процесс?"

2. Ask for required capabilities:
   - "Какие capabilities нужны для достижения цели? (список)"

3. Document in BUSINESS_PROCESS_TEMPLATE.md format

### Step 3: NODE_PLANNING Phase

For each capability:

1. Search existing nodes in registry:
   ```bash
   grep -E "name:|description:" registry/namespaces/sccu/nodes/*.yaml
   ```

2. Show matching nodes to user

3. For each capability ask:
   - "Для capability '{cap}' - переиспользовать узел '{node}' (reuse) или создать новый (create_new)?"

4. Build nodes array:
   ```json
   {
     "id": "workflow-engine",
     "action": "reuse",
     "purpose": "Orchestration"
   }
   ```

### Step 4: DRAFT_REVIEW Phase

1. Ask for outputs:
   - "Что производит этот процесс? (список outputs)"

2. Generate complete business process JSON:
   ```json
   {
     "process_id": "{process_id}",
     "version": "1.0.0",
     "name": "{process_name}",
     "type": "business",
     "description": "{goal}",
     "goal": "{goal}",
     "nodes": [...],
     "outputs": [...]
   }
   ```

3. Show preview to user for approval

4. Wait for user approval (this phase has `approval: true`)

### Step 5: VALIDATE Phase

1. Write process file:
   ```
   Write file: processes/{process_id}.json
   ```

2. Validate JSON structure

3. Transition to completed:
   ```
   Call: pcc_workflow_transition
   Args: { release_id: "v{X.Y.Z}", to_phase: "DEPLOYED" }
   ```

4. Commit changes:
   ```bash
   git add processes/{process_id}.json
   git commit -m "feat(bp): Add {process_name} business process"
   ```

## Example Session

```
User: /create-process payment_processing

Claude: Создаю бизнес-процесс payment_processing.

Какую бизнес-цель решает этот процесс?

User: Безопасная обработка платежей с полным аудитом

Claude: Какие capabilities нужны для достижения цели?

User: 1. Orchestration 2. Audit logging 3. Transaction validation

Claude: Ищу существующие узлы для capability "Orchestration"...
Найден: workflow-engine - "Core workflow engine"

Для capability "Orchestration" - переиспользовать workflow-engine (reuse) или создать новый (create_new)?

User: reuse

Claude: Для capability "Audit logging" - подходящих узлов не найдено.
Создать новый узел? (create_new)

User: create_new

...

Claude: Вот финальный JSON:
{
  "process_id": "payment_processing",
  "type": "business",
  "goal": "Безопасная обработка платежей с полным аудитом",
  "nodes": [
    {"id": "workflow-engine", "action": "reuse", "purpose": "Orchestration"},
    {"id": "audit-logging", "action": "create_new", "purpose": "Audit logging"}
  ],
  "outputs": ["Transaction record", "Audit log entry"]
}

Подтвердить и сохранить?

User: да

Claude: Сохранено в processes/payment_processing.json
Для узла audit-logging запустите /create-node audit-logging
```

## MCP Tools Reference

| Tool | Usage |
|------|-------|
| `pcc_init_release` | Initialize with process_id: "process_creation" |
| `pcc_workflow_status` | Check current phase |
| `pcc_workflow_transition` | Manual phase transitions |
