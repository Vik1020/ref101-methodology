---
name: create-instance
description: Подключает узел к проекту. Используй при "подключи узел", "add instance", "/create-instance", "создай инстанс".
---

# Create Instance Skill

Создание инстанса узла (Node Instance) по workflow `instance_creation`.

## Trigger Keywords

- "/create-instance"
- "подключи узел"
- "add instance"
- "создай инстанс"
- "add node to project"

## Instructions

### Step 0: Parse Request

Extract from user message:
- **node_template**: Node template ID (e.g., `workflow-mcp-server`)
- **project**: Project ID (e.g., `ref101-node-validators`)

If not provided, show available options and ask user.

### Step 1: Initialize Release

```
Call: pcc_init_release
Args: {
  version: "v{X.Y.Z}",
  feature_name: "instance_{node_template}_{project}",
  process_id: "instance_creation",
  problem_statement: "Add {node_template} instance to {project}"
}
```

### Step 2: PROJECT_SELECT Phase

1. Read available projects:
   ```bash
   grep -A2 "^  [a-z]" config/node-instances.yaml | grep -E "^  [a-z]|path:"
   ```

2. Show list to user:
   ```
   Available projects:
   - ref101-pcc (/home/vikto/projects/ref101-pcc)
   - ref101-specs (/home/vikto/projects/ref101-specs)
   - ref101-node-validators (/home/vikto/projects/ref101-node-validators)
   ```

3. Validate selected project exists in node-instances.yaml

### Step 3: NODE_SELECT Phase

1. Read available templates:
   ```bash
   grep "^  [a-z]" config/node-templates.yaml
   ```

2. Show list to user:
   ```
   Available node templates:
   - workflow-engine
   - workflow-phase-templates
   - workflow-mcp-server
   - ...
   ```

3. Validate selected template exists in node-templates.yaml

### Step 4: CONFIG Phase

1. Ask for role:
   ```
   Role for {node_template} in {project}:
   - provider: This project is the SSOT for this node
   - consumer: This project uses the node from another project
   ```

2. If consumer, ask for access method:
   ```
   Access method:
   - symlink: Link to provider project
   - submodule: Git submodule reference
   ```

3. Check requirements from node-templates.yaml:
   - For provider: check provider_requirements
   - For consumer: check consumer_requirements

4. Configure additional settings:
   - `ssot` path (for provider)
   - `config.skills_symlink` pattern (for consumer)
   - `config.mcp_json` path (for MCP consumers)

### Step 5: VALIDATE Phase

1. Generate instance entry:
   ```yaml
   {node_template}@{project}:
     template: {node_template}
     project: {project}
     role: {role}
     status: active
     config:
       access_via: {symlink|submodule}
       # ... additional config
   ```

2. Read current node-instances.yaml

3. Add new instance entry

4. Write updated node-instances.yaml

5. Generate artifacts if needed:
   - Create symlinks
   - Update .mcp.json

6. Validate:
   ```bash
   make validate
   ```

7. Commit:
   ```bash
   git add config/node-instances.yaml
   git commit -m "feat(instance): Add {node_template} to {project}"
   ```

## Example Session

```
User: /create-instance workflow-mcp-server ref101-node-validators

Claude: Создаю инстанс workflow-mcp-server для ref101-node-validators.

Проверяю проект ref101-node-validators... Найден.
Проверяю шаблон workflow-mcp-server... Найден.

Role для workflow-mcp-server в ref101-node-validators:
- provider: Этот проект - SSOT для MCP сервера
- consumer: Использует MCP сервер из другого проекта

User: consumer

Claude: Provider для workflow-mcp-server - ref101-pcc.

Access method:
- symlink: Ссылка на ../ref101-pcc
- submodule: Git submodule

User: Используется через .mcp.json

Claude: Конфигурация:
- mcp_json: .mcp.json
- server_path: ../ref101-pcc/packages/mcp/dist/server.js

Добавляю в node-instances.yaml:

workflow-mcp-server@ref101-node-validators:
  template: workflow-mcp-server
  project: ref101-node-validators
  role: consumer
  status: active
  config:
    mcp_json: .mcp.json
    server_path: ../ref101-pcc/packages/mcp/dist/server.js

Подтвердить?

User: да

Claude: Добавлено. Запускаю make validate...
Валидация пройдена.
```

## MCP Tools Reference

| Tool | Usage |
|------|-------|
| `pcc_init_release` | Initialize with process_id: "instance_creation" |
| `pcc_workflow_status` | Check current phase |
| `pcc_workflow_transition` | Manual phase transitions |

## Files Reference

| File | Purpose |
|------|---------|
| `config/node-templates.yaml` | Available node templates |
| `config/node-instances.yaml` | Instance definitions (update target) |
| `registry/namespaces/sccu/nodes/` | Node definitions SSOT (v3.0.0+) |
