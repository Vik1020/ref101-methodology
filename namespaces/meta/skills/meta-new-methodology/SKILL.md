---
name: meta-new-methodology
description: Создаёт новый namespace в namespaces/. Генерирует структуру по 8 элементам мета-методологии. Используй при "создай методологию", "new methodology", "новый namespace".
---

# Meta New Methodology Skill (v1.0.0)

Создание нового namespace по мета-методологии — 8 invariant elements.

## Trigger Keywords

- "Создай методологию {name}"
- "new methodology {name}"
- "новый namespace {name}"
- "/meta-new-methodology {name}"

## Process Overview

```
PARSE → VALIDATE_NAME → GENERATE_STRUCTURE → CREATE_FILES → VERIFY
```

**No MCP required** — файловые операции через Edit/Write.

## When to Use

✅ Создание нового namespace для методологии
✅ Генерация базовой структуры по 8 элементам
✅ Bootstrapping новых процессов

## When NOT to Use

❌ Валидация существующей методологии → `/meta-validate`
❌ Изменение существующего namespace
❌ Экспорт методологии в другой проект → CLI `ref101-init`

---

## Instructions

### 1. Parse Request

Extract from user message:
- **name**: Имя namespace (snake_case, e.g., "my_flow")
- **description**: Краткое описание (опционально)

If name not provided, ask user.

**Validation:**
- Name must be snake_case: `^[a-z][a-z0-9_]*$`
- Name must not exist in `namespaces/`
- Reserved names: `meta`, `sccu`, `node-hub`

### 2. Generate Directory Structure

```bash
namespaces/{name}/
├── namespace.yaml
├── methodology.yaml
├── README.md
├── GLOSSARY.md
├── schema/
│   └── .gitkeep
├── skills/
│   └── .gitkeep
├── processes/
│   └── .gitkeep
├── bundles/
│   └── minimal.yaml
└── templates/
    └── .gitkeep
```

### 3. Create namespace.yaml

```yaml
namespace_id: {name}
version: "1.0.0"
name: "{Name (Title Case)}"
description: |
  {description or "TODO: Add description"}

phases:
  - INIT
  - WORKING
  - DONE

bundles:
  minimal:
    path: bundles/minimal.yaml
    description: "Basic {name} tools"

skills: []

processes: []
```

### 4. Create methodology.yaml (Template)

Generate methodology.yaml with 8 elements as template:

```yaml
# =============================================================================
# METHODOLOGY: {Name}
# =============================================================================
# TODO: Describe this methodology using the 8 invariant elements.
# Reference: namespaces/meta/README.md
# =============================================================================

methodology_id: "{name}"
version: "1.0.0"
name: "{Name}"
meta_version: "3.1"
description: |
  {description or "TODO: Add methodology description"}

# === ENTITIES (Business objects passing through States) ===
entities:
  - id: "primary_entity"
    type: "TODO"
    role: "primary"
    schema:
      id: "string (required)"
      name: "string (required)"

# === STATES (Lifecycle phases) ===
states:
  - id: "INIT"
    name: "Initial"
    type: "Initial"
    allowed_actions:
      - "start_work"
    exit_conditions:
      - "work_started"

  - id: "WORKING"
    name: "Working"
    type: "Working"
    allowed_actions:
      - "do_work"
    entry_conditions:
      - "work_started"
    exit_conditions:
      - "work_completed"

  - id: "DONE"
    name: "Done"
    type: "Terminal"
    allowed_actions: []
    entry_conditions:
      - "work_completed"

# === ACTORS (Executors: Human, AI, System) ===
actors:
  - id: "human_actor"
    name: "Human Actor"
    type: "Human"
    tools:
      - "editor"
    permissions:
      - "start_work"
      - "do_work"

  - id: "ai_actor"
    name: "AI Actor"
    type: "AI"
    tools:
      - "cli"
    permissions:
      - "do_work"

# === TOOLS (Instruments for Actions) ===
tools:
  - id: "editor"
    name: "Editor"
    type: "Script"
    compatible_actors:
      - "Human"
      - "AI"
    operations:
      - "read"
      - "write"

  - id: "cli"
    name: "CLI"
    type: "Script"
    compatible_actors:
      - "AI"
    operations:
      - "execute"

# === ACTIONS (Units of work) ===
actions:
  - id: "start_work"
    name: "Start Work"
    actor: "human_actor"
    tool: "editor"
    input: "primary_entity"
    allowed_in_states:
      - "INIT"
    output:
      fact: "work_started"

  - id: "do_work"
    name: "Do Work"
    actor: "ai_actor"
    tool: "cli"
    input: "primary_entity"
    allowed_in_states:
      - "WORKING"
    output:
      fact: "work_completed"

# === ARTIFACTS (Files/documents created) ===
artifacts:
  - id: "output_file"
    name: "output.md"
    type: "markdown"
    created_by: "do_work"
    entity_id: "primary_entity"

# === FACTS (Events triggering transitions) ===
facts:
  - id: "work_started"
    name: "Work Started"
    from_state: "INIT"
    to_state: "WORKING"
    triggered_by: "start_work"

  - id: "work_completed"
    name: "Work Completed"
    from_state: "WORKING"
    to_state: "DONE"
    triggered_by: "do_work"

# === RULES (Constraints and conditions) ===
rules:
  - id: "must_have_entity"
    name: "Entity Required"
    type: "Precondition"
    condition: "entity != null"
    scope: "action(start_work)"
    on_violation: "Block"

# === PROCESSES (Predefined State compositions) ===
processes: []
```

### 5. Create README.md

```markdown
# {Name} Methodology

> Version: 1.0.0

## Overview

{description or "TODO: Add overview"}

## 8 Elements

| Element | Count | Description |
|---------|-------|-------------|
| Entities | 1 | Business objects |
| States | 3 | Lifecycle phases |
| Actors | 2 | Human, AI |
| Tools | 2 | Editor, CLI |
| Actions | 2 | Work units |
| Artifacts | 1 | Output files |
| Facts | 2 | Transitions |
| Rules | 1 | Constraints |

## Quick Start

1. Edit `methodology.yaml` to define your process
2. Run `/meta-validate {name}` to check validity
3. Add skills in `skills/`
4. Add processes in `processes/`

## Files

- `namespace.yaml` — Namespace definition
- `methodology.yaml` — 8-element methodology spec
- `GLOSSARY.md` — Domain terms
- `bundles/minimal.yaml` — Basic bundle
```

### 6. Create GLOSSARY.md

```markdown
# {Name} Glossary

## Core Terms

| Term | Definition |
|------|------------|
| Entity | Business object that passes through states |
| State | Lifecycle phase of an entity |
| Actor | Executor (Human, AI, System) |
| Tool | Instrument used by actors |
| Action | Unit of work performed by actor |
| Artifact | File or document created |
| Fact | Event that triggers state transition |
| Rule | Constraint or condition |

## Domain Terms

<!-- Add domain-specific terms here -->
```

### 7. Create bundles/minimal.yaml

```yaml
bundle_id: {name}-minimal
methodology: {name}
version: "1.0.0"
description: "Basic {name} tools"

includes:
  skills: []
  processes: []
```

### 8. Create .gitkeep files

Create empty `.gitkeep` in: `schema/`, `skills/`, `processes/`, `templates/`

### 9. Verify Structure

After creation, verify:
1. All directories exist
2. All files created
3. methodology.yaml is valid YAML

Report to user:
```
✅ Namespace '{name}' created at namespaces/{name}/

Files:
- namespace.yaml
- methodology.yaml
- README.md
- GLOSSARY.md
- bundles/minimal.yaml

Next steps:
1. Edit methodology.yaml to define your 8 elements
2. Run /meta-validate {name} to check validity
3. Add skills and processes as needed
```

---

## Error Handling

### Name Already Exists

```
❌ Namespace '{name}' already exists at namespaces/{name}/

Options:
1. Choose a different name
2. Delete existing namespace first (rm -rf namespaces/{name}/)
```

### Invalid Name Format

```
❌ Invalid namespace name: '{name}'

Requirements:
- snake_case format: ^[a-z][a-z0-9_]*$
- Examples: my_flow, auth_process, data_pipeline
```

### Write Permission Error

```
❌ Cannot create directory: namespaces/{name}/

Check write permissions for the namespaces/ directory.
```

---

## Example Session

```
User: /meta-new-methodology auth_flow

Claude: Создаю namespace 'auth_flow' по мета-методологии.

[1/9] Parse: name=auth_flow, description=null
[2/9] Validate: name OK, not exists ✓
[3/9] Create directories...
[4/9] Create namespace.yaml...
[5/9] Create methodology.yaml (template)...
[6/9] Create README.md...
[7/9] Create GLOSSARY.md...
[8/9] Create bundles/minimal.yaml...
[9/9] Verify structure...

✅ Namespace 'auth_flow' created at namespaces/auth_flow/

Files created:
- namespaces/auth_flow/namespace.yaml
- namespaces/auth_flow/methodology.yaml
- namespaces/auth_flow/README.md
- namespaces/auth_flow/GLOSSARY.md
- namespaces/auth_flow/bundles/minimal.yaml
- namespaces/auth_flow/schema/.gitkeep
- namespaces/auth_flow/skills/.gitkeep
- namespaces/auth_flow/processes/.gitkeep
- namespaces/auth_flow/templates/.gitkeep

Next steps:
1. Edit methodology.yaml to define your 8 elements
2. Run /meta-validate auth_flow to check validity
3. Add skills and processes as needed
```

---

## Reference

- Meta-methodology spec: `namespaces/meta/README.md`
- Schema: `namespaces/meta/schema/meta-methodology.schema.yaml`
- Validation: `/meta-validate`
