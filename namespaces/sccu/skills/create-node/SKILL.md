---
name: create-node
description: Создаёт новый bounded context узел по процессу node_creation. Используй при "create node", "создай узел", "новый узел", "/create-node".
---

# Create Node Skill (v1.84.0)

Автоматизация Workflow 1: Node Creation - создание нового bounded context узла.

**Процесс:** `node_creation` (8 фаз, 1 approval)

## Trigger Keywords

- "/create-node"
- "создай узел"
- "новый узел"
- "new node"
- "create node"

## Overview

Этот skill автоматизирует процесс создания нового bounded context узла, включая:
1. Создание NODE_TEMPLATE.md с описанием узла
2. Определение provider/consumer requirements
3. Определение validation rules
4. Генерация validator.ts
5. Обновление конфигурационных файлов
6. Создание документации по установке

## Prerequisites

- Понимание назначения нового узла
- Знание canonical project (где находится SSOT)
- Определённые зависимости от других узлов

## Instructions

### Step 0: Parse Request

Extract from user message or ask:
- **node_id**: snake-case identifier (e.g., "my-new-node")
- **node_name**: Human-readable name (e.g., "My New Node")
- **coupling**: structural or semantic
- **canonical_project**: Project that owns SSOT (e.g., "ref101-pcc")
- **category**: workflow, automation, or documentation

### Step 1: Initialize Release (RELEASE Phase)

```
Call: pcc_init_release
Args: {
  version: "v{X.Y.Z}",
  feature_name: "node_{node_id}",
  process_id: "feature_full_auto",  // Using standard process for now
  problem_statement: "Create new bounded context node: {node_name}"
}
```

### Step 2: NODE_DEFINITION Phase

1. Copy template:
```bash
cp templates/nodes/NODE_TEMPLATE.md docs/releases/v{X.Y.Z}/NODE_DEFINITION_{node_id}.md
```

2. Fill Basic Info section:
   - ID, Name, Coupling, SSOT Pattern, Canonical Project, Category
   - Description (2-3 sentences)
   - Dependencies list

3. Remove instruction comments from template

### Step 3: PATTERN_DEFINITION Phase

1. Analyze canonical project to understand:
   - What files/directories the provider must have
   - What files/directories consumers need

2. Fill Provider Requirements table:
   - id, type (file/directory/symlink/package), pattern, description, optional

3. Fill Consumer Requirements table:
   - Similar structure

### Step 4: RULES_DEFINITION Phase

1. Define validation rules based on requirements:
   - For each requirement, create a validation rule
   - Choose type: script (automated) or semantic (LLM-validated)
   - Set severity: error (blocking) or warning (advisory)

2. Fill Validation Rules table

3. Add Rule Implementations section with:
   - Script rules: shell commands
   - Semantic rules: LLM prompts and context files

### Step 5: VALIDATOR_IMPL Phase

1. Create validator file:
   - Path: `packages/core/src/nodes/{node-id}.validator.ts`
   - Follow template from Validator Instructions section
   - Implement each rule from Rules Definition

2. Register validator:
   - Import in `packages/core/src/nodes/index.ts`
   - Add to VALIDATORS map

### Step 6: CONFIG_UPDATE Phase

1. Add to `registry/namespaces/sccu/nodes/{node-id}.yaml`:
   - Node entry with name, description, coupling, ssot, category, dependencies, rules
   - Follow format of existing node files in registry

2. Add to `config/node-templates.yaml`:
   - Template entry with all requirements and rules

### Step 7: INSTALL_DOC Phase

1. Copy template:
```bash
cp docs/installation/INSTALL_TEMPLATE.md docs/installation/INSTALL_{node-id}.md
```

2. Fill sections based on:
   - Provider requirements → Provider Installation steps
   - Consumer requirements → Consumer Installation steps
   - Verification commands from rules

### Step 8: VALIDATE Phase

1. Run validation:
```bash
make validate
```

2. Fix any errors

3. Get approval (this is the only approval point)

### Step 9: Commit and Complete

```bash
git add .
git commit -m "feat(v{X.Y.Z}): Add {node-name} bounded context node

- Created NODE_TEMPLATE for {node-id}
- Implemented validator with {N} rules
- Added install documentation

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

## Error Handling

### Node ID Already Exists

If node-id already exists in nodes.yaml:
1. Inform user: "Node '{node-id}' already exists"
2. Suggest: "Use a different id or update existing node"

### Validator Compilation Fails

If TypeScript compilation fails:
1. Show compilation errors
2. Fix type issues
3. Retry compilation

### Validation Fails

If `make validate` fails:
1. Show which rules failed
2. Fix implementation
3. Re-run validation

## Example Session

```
User: /create-node api-client "API Client" structural ref101-pcc automation

Claude: Начинаю создание узла api-client.

[Step 1: Initialize Release]
✓ Release v1.85.0 initialized

[Step 2: NODE_DEFINITION]
✓ Created docs/releases/v1.85.0/NODE_DEFINITION_api-client.md
✓ Filled Basic Info section

[Step 3: PATTERN_DEFINITION]
Analyzing ref101-pcc for SSOT patterns...
✓ Found 3 provider requirements
✓ Found 2 consumer requirements

[Step 4: RULES_DEFINITION]
✓ Defined 4 validation rules
  - api-client-exists (script, error)
  - config-valid (script, error)
  - endpoints-documented (semantic, warning)
  - error-handling (semantic, warning)

[Step 5: VALIDATOR_IMPL]
✓ Created packages/core/src/nodes/api-client.validator.ts
✓ Registered in index.ts

[Step 6: CONFIG_UPDATE]
✓ Added to config/nodes.yaml
✓ Added to config/node-templates.yaml

[Step 7: INSTALL_DOC]
✓ Created docs/installation/INSTALL_api-client.md

[Step 8: VALIDATE]
Running make validate...
✓ All 4 rules passed

[Step 9: Commit]
✓ Changes committed

Node api-client created successfully!
Files created:
- packages/core/src/nodes/api-client.validator.ts
- docs/installation/INSTALL_api-client.md
- docs/releases/v1.85.0/NODE_DEFINITION_api-client.md

Config files updated:
- config/nodes.yaml
- config/node-templates.yaml
- packages/core/src/nodes/index.ts
```

## Related

- [NODE_TEMPLATE.md](../../templates/nodes/NODE_TEMPLATE.md) - Node definition template
- [node_creation.json](../../processes/node_creation.json) - Process definition
- [CREATING_NODE.md](../../packages/core/docs/guides/CREATING_NODE.md) - Manual guide
- [section-meta.yaml](../../config/section-meta.yaml) - Workflow 1 steps reference
