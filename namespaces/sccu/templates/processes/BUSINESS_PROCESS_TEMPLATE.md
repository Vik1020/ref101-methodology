# Business Process Template

Use this template to define a new business process that groups related nodes.

## Basic Information

- **Process ID:** `{process_id}` (snake_case, e.g., `payment_processing`)
- **Process Name:** {Human-readable name}
- **Version:** 1.0.0

## Goal

{Describe the business goal this process achieves. What problem does it solve? What value does it provide?}

## Capabilities

List the capabilities needed to achieve this goal:

1. **{Capability 1}** - {Description}
2. **{Capability 2}** - {Description}
3. **{Capability 3}** - {Description}

## Node Decisions

For each capability, decide which nodes are needed:

| Capability | Node ID | Action | Purpose |
|------------|---------|--------|---------|
| {Cap 1} | `{node-id}` | `reuse` / `create_new` | {Why this node?} |
| {Cap 2} | `{node-id}` | `reuse` / `create_new` | {Why this node?} |
| {Cap 3} | `{node-id}` | `reuse` / `create_new` | {Why this node?} |

### Action Legend

- **reuse**: Use existing node as-is from nodes.yaml
- **create_new**: Create new node via `/create-node` skill

## Outputs

What does this process produce?

1. {Output 1}
2. {Output 2}
3. {Output 3}

---

## Generated JSON (for reference)

```json
{
  "process_id": "{process_id}",
  "version": "1.0.0",
  "name": "{Process Name}",
  "type": "business",
  "description": "{Goal description}",
  "goal": "{Business goal statement}",
  "nodes": [
    {
      "id": "{node-id}",
      "action": "reuse",
      "purpose": "{Purpose}"
    }
  ],
  "outputs": [
    "{Output 1}",
    "{Output 2}"
  ]
}
```
