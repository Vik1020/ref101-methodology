---
name: meta-validate
description: Валидирует methodology.yaml по схеме meta-methodology.schema.yaml. Проверяет связи между элементами и статический анализ. Используй при "проверь методологию", "validate methodology".
---

# Meta Validate Skill (v1.0.0)

Валидация methodology.yaml — 3 уровня проверки (L1/L2/L3).

## Trigger Keywords

- "Проверь методологию {namespace}"
- "validate methodology {namespace}"
- "/meta-validate {namespace}"
- "валидация {namespace}"

## Validation Levels

```
L1: SCHEMA → L2: LINKS → L3: STATIC_ANALYSIS → REPORT
```

| Level | Name | Description |
|-------|------|-------------|
| L1 | Schema | Required fields, patterns, enums |
| L2 | Links | Referential integrity between elements |
| L3 | Static | Reachability, deadlocks, termination |

**Read-only** — can run in plan mode.

## When to Use

✅ После создания/редактирования methodology.yaml
✅ Перед коммитом изменений в методологию
✅ Самовалидация: `/meta-validate meta`
✅ CI/CD validation

## When NOT to Use

❌ Создание новой методологии → `/meta-new-methodology`
❌ Валидация не-methodology файлов

---

## Instructions

### 1. Parse Request

Extract from user message:
- **namespace**: Name of namespace to validate (e.g., "sccu", "meta")
- **level**: Validation level (optional, default: all)

If namespace not provided, ask user.

### 2. Locate Files

Find methodology files:
```
namespaces/{namespace}/methodology.yaml  ← Target
namespaces/meta/schema/meta-methodology.schema.yaml  ← Schema
```

**Verify files exist:**
- If methodology.yaml not found → error
- If schema not found → error (critical)

### 3. L1: Schema Validation

Check against `meta-methodology.schema.yaml`:

**Required fields:**
- `methodology_id` (string)
- `version` (string, semver pattern)
- `name` (string)
- `meta_version` (string)
- `states` (array, min 2)
- `actors` (array, min 1)
- `actions` (array, min 1)
- `facts` (array, min 1)

**Patterns:**
- `methodology_id`: `^[a-z][a-z0-9_-]*$`
- `version`: `^\d+\.\d+\.\d+$`
- State types: `Initial | Working | Terminal | Error`
- Actor types: `Human | AI | System`
- Rule types: `Precondition | Postcondition | Invariant | Constraint`

**Collect errors:**
```yaml
L1_errors:
  - field: "methodology_id"
    error: "Required field missing"
  - field: "states[0].type"
    error: "Invalid value 'Start', expected: Initial|Working|Terminal|Error"
```

### 4. L2: Link Validation

Check referential integrity:

**State ← Fact → State:**
```yaml
facts:
  - id: "work_done"
    from_state: "WORKING"   # ← Must exist in states
    to_state: "DONE"        # ← Must exist in states
```

**Action → Actor:**
```yaml
actions:
  - id: "do_work"
    actor: "ai_actor"       # ← Must exist in actors
```

**Actor → Tool:**
```yaml
actors:
  - id: "ai_actor"
    tools:
      - "cli"               # ← Must exist in tools
```

**Action → Tool:**
```yaml
actions:
  - id: "do_work"
    tool: "editor"          # ← Must exist in tools
```

**Action → State (allowed_in_states):**
```yaml
actions:
  - id: "do_work"
    allowed_in_states:
      - "WORKING"           # ← Must exist in states
```

**Artifact → Action (created_by):**
```yaml
artifacts:
  - id: "report"
    created_by: "generate"  # ← Must exist in actions
```

**Collect errors:**
```yaml
L2_errors:
  - type: "broken_link"
    source: "facts[0].from_state"
    target: "WORKING"
    error: "State 'WORKING' not found in states"
```

### 5. L3: Static Analysis

Analyze state machine properties:

**5.1 Reachability:**
- Every state must be reachable from Initial state
- Unreachable states → warning

**5.2 Deadlocks:**
- Non-Terminal states must have exit transitions
- States with no outgoing facts → error

**5.3 Termination:**
- At least one Terminal state must be reachable
- No path to Terminal → error

**5.4 Orphan Elements:**
- Actions not triggered by any flow
- Tools not used by any actor
- Actors with no permissions

**Algorithm (simplified):**
```
1. Find Initial state
2. BFS/DFS from Initial using facts as edges
3. Mark visited states
4. Check: all non-Error states visited?
5. Check: Terminal state in visited set?
6. Check: non-Terminal states have outgoing transitions
```

**Collect warnings/errors:**
```yaml
L3_analysis:
  reachable_states: ["INIT", "WORKING", "DONE"]
  unreachable_states: ["ORPHAN_STATE"]
  deadlock_states: []
  terminal_reachable: true
  orphan_elements:
    actions: ["unused_action"]
    tools: []
```

### 6. Generate Report

Format validation results:

```markdown
# Validation Report: {namespace}

**File:** `namespaces/{namespace}/methodology.yaml`
**Date:** {timestamp}
**Status:** {VALID | INVALID | WARNINGS}

## Summary

| Level | Status | Errors | Warnings |
|-------|--------|--------|----------|
| L1: Schema | ✅ PASS | 0 | 0 |
| L2: Links | ✅ PASS | 0 | 0 |
| L3: Static | ⚠️ WARN | 0 | 2 |

## L1: Schema Validation

✅ All required fields present
✅ All patterns valid
✅ All enums valid

## L2: Link Validation

✅ All state references valid
✅ All actor references valid
✅ All tool references valid

## L3: Static Analysis

### State Machine

- Initial state: `INIT`
- Terminal states: `DONE`
- Total states: 3

### Reachability

✅ All states reachable from INIT

### Deadlock Analysis

✅ No deadlock states found

### Warnings

⚠️ Unused action: `legacy_action`
⚠️ Unused tool: `old_tool`

---

**Result:** {VALID | INVALID}
```

### 7. Output Result

**If VALID:**
```
✅ Methodology '{namespace}' is VALID

L1: Schema     ✓
L2: Links      ✓
L3: Static     ✓ (2 warnings)
```

**If INVALID:**
```
❌ Methodology '{namespace}' is INVALID

L1: Schema     ✗ (3 errors)
L2: Links      ✓
L3: Static     -

Errors:
1. [L1] methodology_id: Required field missing
2. [L1] states: Must have at least 2 states
3. [L1] states[0].type: Invalid value 'Start'

Fix these errors and re-run /meta-validate {namespace}
```

---

## CLI Integration

The skill can optionally use `tools/meta/` CLI:

```bash
npx ts-node tools/meta/src/index.ts validate namespaces/{namespace}/methodology.yaml
```

CLI provides:
- `--level L1|L2|L3|all` — validation level
- `--format json|markdown` — output format
- `--strict` — treat warnings as errors

---

## Error Handling

### Namespace Not Found

```
❌ Namespace '{namespace}' not found

Check:
1. Directory exists: namespaces/{namespace}/
2. File exists: namespaces/{namespace}/methodology.yaml

Available namespaces:
- meta
- sccu
- node-hub
```

### YAML Parse Error

```
❌ YAML parse error in methodology.yaml

Line 45: Unexpected token
  states:
    - id: INIT
      type: Initial  # ← missing quotes?

Fix YAML syntax and re-run validation.
```

### Schema Not Found

```
❌ Schema file not found

Expected: namespaces/meta/schema/meta-methodology.schema.yaml

This is a critical error. Ensure meta namespace is properly installed.
```

---

## Example Sessions

### Valid Methodology

```
User: /meta-validate sccu

Claude: Валидирую методологию 'sccu'...

[L1] Schema validation...
  ✓ methodology_id: sccu
  ✓ version: 3.0.0
  ✓ states: 9 states
  ✓ actors: 3 actors

[L2] Link validation...
  ✓ 18 fact transitions valid
  ✓ 12 action-actor links valid
  ✓ 8 tool references valid

[L3] Static analysis...
  ✓ Initial: RELEASE
  ✓ Terminal: DEPLOYED
  ✓ All states reachable
  ✓ No deadlocks

✅ Methodology 'sccu' is VALID

L1: Schema     ✓
L2: Links      ✓
L3: Static     ✓
```

### Self-Validation

```
User: /meta-validate meta

Claude: Валидирую мета-методологию (самовалидация)...

[L1] Schema validation...
  ✓ methodology_id: meta
  ✓ meta_version: 3.1
  ✓ states: 4 (DESIGN, VALIDATE, PUBLISH, ERROR)

[L2] Link validation...
  ✓ 4 fact transitions valid
  ✓ Actor→Tool links valid

[L3] Static analysis...
  ✓ Initial: DESIGN
  ✓ Terminal: PUBLISH
  ✓ Error recovery: ERROR → VALIDATE

✅ Meta-methodology is self-valid!

This demonstrates self-applicability:
meta-methodology describes itself using its own 8 elements.
```

### Invalid Methodology

```
User: /meta-validate broken_flow

Claude: Валидирую методологию 'broken_flow'...

[L1] Schema validation...
  ✗ version: Invalid format '1.0' (expected X.Y.Z)
  ✗ states: Only 1 state (minimum 2)

❌ Methodology 'broken_flow' is INVALID

Errors (2):
1. [L1] version: Invalid format '1.0', expected semver X.Y.Z
2. [L1] states: Must have at least 2 states (found 1)

Fix these errors and re-run: /meta-validate broken_flow
```

---

## Reference

- Meta-methodology spec: `namespaces/meta/README.md`
- Schema: `namespaces/meta/schema/meta-methodology.schema.yaml`
- CLI: `tools/meta/src/commands/validate.ts`
- Create methodology: `/meta-new-methodology`
