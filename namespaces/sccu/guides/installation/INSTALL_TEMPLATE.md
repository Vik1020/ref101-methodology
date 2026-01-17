<!--
INSTRUCTIONS: Before using this template

1. Replace all [placeholders] with actual values:
   - node_id: ID from node-templates.yaml (e.g., mcp-tooling, skills)
   - node_name: Human-readable name
   - version: Document version (semver)

2. Fill sections based on role:
   - Provider: Use provider_requirements from node-templates.yaml
   - Consumer: Use consumer_requirements from node-templates.yaml

3. Each step should be atomic and verifiable

4. Remove this instruction block after filling in all values

See also:
- Node Templates: config/node-templates.yaml
- Node Instances: config/node-instances.yaml
-->

---
install_id: INSTALL_[node_id]
node_id: [node_id]
node_name: "[Node Name]"
version: "1.0.0"
status: active
last_updated: YYYY-MM-DD
coupling: structural|semantic
canonical_project: [project_id]
depends_on: []
---

# Installation Guide: [Node Name]

> **Node ID:** `[node_id]`
> **Coupling:** [structural|semantic]
> **Canonical Project:** [canonical_project]
> **Dependencies:** [list of depends_on]

## Overview

[2-3 sentences describing what this node provides and why projects need it]

---

## Prerequisites

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | v18.x | v20.x LTS |
| npm | v9.x | v10.x |
| [Other] | [Version] | [Version] |

### Project Requirements

| Requirement | Description | Check Command |
|-------------|-------------|---------------|
| [Requirement 1] | [What it needs] | `[command to verify]` |

### Dependencies on Other Nodes

| Node | Role | Purpose |
|------|------|---------|
| [dependency-node] | [provider/consumer] | [Why needed] |

---

## Provider Installation

> **Role:** Provider creates and maintains the SSOT (Single Source of Truth)
> **Canonical Project:** [canonical_project]
> **SSOT Pattern:** `[ssot_pattern]`

### Provider Prerequisites

- [ ] You are the designated canonical project
- [ ] No other project is provider for this node
- [ ] Dependencies are installed

### Step 1: [Step Name]

**Requirement ID:** `[requirement_id from node-templates.yaml]`

**What:** [Description of what this step creates]

**Commands:**
```bash
# Command to execute
[command]

# Verify
[verify command]
```

**Expected Result:**
```
[expected output]
```

---

### Provider Configuration

**File:** `[config file path]`

```yaml
# Configuration example
[config]
```

### Provider Validation Rules

| Rule ID | Severity | Description |
|---------|----------|-------------|
| [rule_id] | error/warning | [description] |

**Run validation:**
```bash
make validate-instances
```

---

## Consumer Installation

> **Role:** Consumer connects to the provider's SSOT
> **Typical Setup:** Symlinks, config files, package dependencies

### Consumer Prerequisites

- [ ] Provider project exists and is accessible
- [ ] Provider has completed installation
- [ ] You have path to provider project

### Step 1: [Step Name]

**Requirement ID:** `[requirement_id]`

**What:** [Description]

**Commands:**
```bash
[commands]
```

---

### Consumer Configuration

**File:** `[config file path]`

```json
{
  "example": "config"
}
```

### Consumer Validation Rules

| Rule ID | Severity | Description |
|---------|----------|-------------|
| [rule_id] | error/warning | [description] |

---

## Verification

### Quick Checklist

**For Provider:**
- [ ] SSOT file exists: `[ssot_pattern]`
- [ ] All provider_requirements satisfied
- [ ] Validation passes

**For Consumer:**
- [ ] Connection to provider works
- [ ] All consumer_requirements satisfied
- [ ] Validation passes

### Verification Script

```bash
#!/bin/bash
# verify-[node_id].sh

echo "Verifying [node_name] installation..."

# Check 1: [Description]
[command] && echo "OK" || echo "FAIL"

# Final validation
make validate-instances
```

---

## Troubleshooting

### Issue: [Issue Name]

**Symptom:**
```
[error message]
```

**Cause:** [Explanation]

**Solution:**
```bash
[fix commands]
```

---

## Node Instance Registration

### Provider Registration

```yaml
instances:
  [node_id]@[project_id]:
    template: [node_id]
    project: [project_id]
    role: provider
    ssot: [path/to/ssot]
    status: active
```

### Consumer Registration

```yaml
instances:
  [node_id]@[project_id]:
    template: [node_id]
    project: [project_id]
    role: consumer
    config:
      [key]: [value]
    status: active
```

---

## Related Documentation

- [node-templates.yaml](../../config/node-templates.yaml)
- [node-instances.yaml](../../config/node-instances.yaml)
- [nodes.yaml](../../config/nodes.yaml)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | YYYY-MM-DD | Initial release |
