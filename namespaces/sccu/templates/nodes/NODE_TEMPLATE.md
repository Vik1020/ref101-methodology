<!--
INSTRUCTIONS: Before using this template

1. Replace all [placeholders] with actual values:
   - node_id: Unique identifier (snake_case, e.g., "workflow-engine")
   - node_name: Human-readable name
   - coupling: structural or semantic
   - ssot_pattern: Glob pattern for SSOT file
   - canonical_project: Project that owns the SSOT

2. Fill sections sequentially:
   - Basic Info → Pattern Definition → Rules Definition → Validator Instructions

3. After completing all sections, create:
   - {node-id}.validator.ts
   - INSTALL_{node-id}.md

4. Remove this instruction block after filling in all values

See also:
- Node Templates: config/node-templates.yaml
- Node Instances: config/node-instances.yaml
- Section Meta: config/section-meta.yaml (Workflow 1 steps)
-->

---
node_id: "[node-id]"
version: "1.0.0"
status: draft
created_at: YYYY-MM-DD
canonical_project: "[project-id]"
coupling: "[structural|semantic]"
---

# Node Definition: [Node Name]

## Basic Info

| Property | Value |
|----------|-------|
| **ID** | `[node-id]` |
| **Name** | [Human readable name - see Naming Guidelines below] |
| **Coupling** | [structural\|semantic] |
| **SSOT Pattern** | `[glob pattern for SSOT file]` |
| **Canonical Project** | [project-id] |
| **Category** | [workflow\|automation\|documentation] |
| **Group** | [workflow-engine\|phase-templates\|process-definitions\|skills\|mcp-servers\|documentation] |

---

## Naming Guidelines

Node names must be **specific and contextual** to avoid ambiguity at scale.

### Pattern: `[Context] [Type]`

| Component | Description | Examples |
|-----------|-------------|----------|
| **Context** | Domain/system prefix | SCCU, PCC, W3C, Node Creation |
| **Type** | Functional category | Phase Templates, Process Definitions, Skills |

### Examples

| Bad (Generic) | Good (Specific) | Why |
|---------------|-----------------|-----|
| Phase Templates | SCCU Development Phase Templates | Specifies which workflow phases |
| Workflow Engine | PCC Workflow Engine | Specifies which system |
| Design Tokens | W3C Design Tokens | Specifies the standard |
| Skills | SCCU Workflow Skills | Specifies what the skills automate |
| Templates | Node Creation Phase Templates | Specifies what the templates are for |

### Rules

1. **Avoid generic names** — "Templates", "Engine", "Skills" alone are ambiguous
2. **Add domain context** — SCCU, PCC, W3C, etc.
3. **Specify scope** — What does this node apply to?
4. **Think at scale** — Will this name be clear among 100+ nodes?

---

### Description

[2-3 sentences describing what this node represents and its purpose in the system]

### Dependencies

| Node ID | Reason |
|---------|--------|
| [dependency-node-id] | [Why this node depends on it] |

---

## Pattern Definition

### Provider Requirements

> **Role:** Provider creates and maintains the SSOT (Single Source of Truth)

| ID | Type | Pattern | Description | Optional |
|----|------|---------|-------------|----------|
| [req-id] | file\|directory\|symlink\|package | [glob/path pattern] | [What this requirement provides] | [true\|false] |

<!-- Example:
| ssot-file | file | packages/core/src/main.ts | Main source of truth file | false |
| config-dir | directory | config/ | Configuration directory | false |
-->

### Consumer Requirements

> **Role:** Consumer connects to provider's SSOT

| ID | Type | Pattern | Description | Optional |
|----|------|---------|-------------|----------|
| [req-id] | file\|directory\|symlink\|config | [glob/path pattern] | [What consumer must have] | [true\|false] |

<!-- Example:
| mcp-config | file | .mcp.json | MCP configuration pointing to provider | false |
| symlink | symlink | tools → ref101-specs/tools | Symlink to provider tools | true |
-->

---

## Rules Definition

### Validation Rules

| Rule ID | Type | Severity | Applies To | Description |
|---------|------|----------|------------|-------------|
| [rule-id] | script\|semantic | error\|warning | provider\|consumer\|both | [What this rule validates] |

<!-- Example:
| ssot-exists | script | error | provider | SSOT file must exist |
| config-valid | script | error | consumer | Config must be valid JSON |
| contract-match | semantic | warning | both | Consumer must match provider contract |
-->

### Rule Implementations

#### [rule-id]

**Type:** script

**Check Command:**
```bash
cd {project_root} && [shell command that returns 0 on success]
```

**What it validates:** [Description of what this rule checks]

---

#### [rule-id]

**Type:** semantic

**Prompt:**
```
[LLM prompt describing what to validate]
```

**Context Files:**
- [path/to/file1]
- [path/to/file2]

**What it validates:** [Description of what this rule checks]

---

## Validator Instructions

### Step 1: Create Validator File

**File:** `packages/core/src/nodes/[node-id].validator.ts`

**Template:**
```typescript
import type { NodeValidator, ValidationResult, ValidationRule } from '../lib/types'
import { loadNodeFromRegistry } from '../config/adapter'

const rules: ValidationRule[] = [
  // Add rules from Rules Definition section
]

export const [nodeIdCamelCase]: NodeValidator = {
  nodeId: '[node-id]',
  name: '[Node Name]',

  async validate(projectRoot: string): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []
    const config = loadNodeFromRegistry('[node-id]')

    // Implement validation logic for each rule

    return results
  },

  rules,
}
```

### Step 2: Register Validator

**File:** `packages/core/src/nodes/index.ts`

**Add import:**
```typescript
import { [nodeIdCamelCase] } from './[node-id].validator'
```

**Add to VALIDATORS map:**
```typescript
export const VALIDATORS: Map<string, NodeValidator> = new Map([
  // ... existing validators
  ['[node-id]', [nodeIdCamelCase]],
])
```

### Step 3: Add to Registry

**File:** `registry/namespaces/sccu/nodes/[node-id].yaml`

**Create node entry:**
```yaml
node_id: [node-id]
namespace: sccu
version: "1.0.0"
name: "[Node Name]"
description: "[Description]"

coupling: [structural|semantic]
ssot_pattern: "[ssot-file-pattern]"

components:
  code:
    source: [canonical-project]
    ref: "v1.0.0"
    paths:
      - path/to/source/files/*.ts
    excluded:
      - "*.test.ts"

  validation:
    source: ref101-node-validators
    ref: "v1.0.0"
    paths:
      - packages/core/src/nodes/[node-id].validator.ts

dependencies: []
  # Add qualified dependencies: namespace:node-id

provides:
  services:
    - [service-name]

rules:
  - id: [rule-id]
    description: "[Rule description]"
    severity: [error|warning]
    applies_to: [provider|consumer|both]
```

### Step 4: Add to node-templates.yaml

**File:** `config/node-templates.yaml`

**Add template entry:**
```yaml
templates:
  [node-id]:
    name: "[Node Name]"
    description: "[Description]"
    coupling: [structural|semantic]
    canonical_project: [project-id]
    canonical_role: provider
    ssot_pattern: "[glob pattern]"
    depends_on: [list of dependencies]
    provider_requirements:
      # From Provider Requirements section
    consumer_requirements:
      # From Consumer Requirements section
    rules:
      # From Rules Definition section
```

### Step 5: Create Install Documentation

**File:** `docs/installation/INSTALL_[node-id].md`

Use `docs/installation/INSTALL_TEMPLATE.md` as base and fill in:
- Node-specific prerequisites
- Provider installation steps
- Consumer installation steps
- Verification commands

---

## Checklist

- [ ] Basic Info section complete
- [ ] All provider requirements defined
- [ ] All consumer requirements defined
- [ ] All validation rules defined with implementations
- [ ] Validator file created: `packages/core/src/nodes/[node-id].validator.ts`
- [ ] Validator registered in `packages/core/src/nodes/index.ts`
- [ ] Node added to `registry/namespaces/sccu/nodes/[node-id].yaml`
- [ ] Template added to `config/node-templates.yaml`
- [ ] Install doc created: `docs/installation/INSTALL_[node-id].md`
- [ ] `make validate` passes

---

## Related Documentation

- [Registry Nodes](../../registry/namespaces/sccu/nodes/) - Node definitions SSOT
- [Node Templates](../../config/node-templates.yaml)
- [Node Instances](../../config/node-instances.yaml)
- [Section Meta - Workflow 1](../../config/section-meta.yaml)
- [CREATING_NODE Guide](../../packages/core/docs/guides/CREATING_NODE.md)
