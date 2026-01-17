---
install_id: INSTALL_node-creation-templates
node_id: node-creation-templates
node_name: "Node Creation Templates"
version: "1.0.0"
status: active
last_updated: 2026-01-11
coupling: structural
canonical_project: ref101-node-validators
depends_on: []
---

# Installation Guide: Node Creation Templates

> **Node ID:** `node-creation-templates`
> **Coupling:** structural
> **Canonical Project:** ref101-node-validators
> **Dependencies:** None

## Overview

This node provides templates for Workflow 1: Node Creation process. It contains two key templates:
1. **NODE_TEMPLATE.md** - Template for defining new bounded context nodes
2. **INSTALL_TEMPLATE.md** - Template for creating installation guides

These templates are used by the `/create-node` skill to automate node creation.

---

## Prerequisites

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | v18.x | v20.x LTS |
| npm | v9.x | v10.x |

### Project Requirements

| Requirement | Description | Check Command |
|-------------|-------------|---------------|
| ref101-node-validators | This project must be cloned | `test -d templates/nodes` |

### Dependencies on Other Nodes

This node has no dependencies on other nodes.

---

## Provider Installation

> **Role:** Provider creates and maintains the SSOT (Single Source of Truth)
> **Canonical Project:** ref101-node-validators
> **SSOT Pattern:** `templates/nodes/NODE_TEMPLATE.md`

### Provider Prerequisites

- [x] You are working in ref101-node-validators project
- [x] Templates directory exists

### Step 1: Verify NODE_TEMPLATE.md

**Requirement ID:** `node-template`

**What:** Verify the node definition template exists

**Commands:**
```bash
# Verify template exists
test -f templates/nodes/NODE_TEMPLATE.md && echo "OK" || echo "FAIL"

# Check frontmatter
head -30 templates/nodes/NODE_TEMPLATE.md
```

**Expected Result:**
```
OK
---
node_id: "[node-id]"
version: "1.0.0"
...
```

---

### Step 2: Verify INSTALL_TEMPLATE.md

**Requirement ID:** `install-template`

**What:** Verify the installation guide template exists

**Commands:**
```bash
# Verify template exists
test -f docs/installation/INSTALL_TEMPLATE.md && echo "OK" || echo "FAIL"

# Check frontmatter
head -30 docs/installation/INSTALL_TEMPLATE.md
```

**Expected Result:**
```
OK
---
install_id: INSTALL_[node_id]
node_id: [node_id]
...
```

---

### Provider Validation Rules

| Rule ID | Severity | Description |
|---------|----------|-------------|
| node-template-exists | error | NODE_TEMPLATE.md must exist in templates/nodes/ |
| install-template-exists | error | INSTALL_TEMPLATE.md must exist in docs/installation/ |
| template-has-frontmatter | error | Both templates must have valid YAML frontmatter |
| template-has-placeholders | warning | Templates should contain [placeholder] markers |

**Run validation:**
```bash
make validate
```

---

## Consumer Installation

> **Role:** This node does not have consumer requirements
> **Note:** Templates are used locally within ref101-node-validators

This node is self-contained and does not require consumer setup. Other projects use the `/create-node` skill which references these templates directly.

---

## Verification

### Quick Checklist

**For Provider:**
- [x] NODE_TEMPLATE.md exists: `templates/nodes/NODE_TEMPLATE.md`
- [x] INSTALL_TEMPLATE.md exists: `docs/installation/INSTALL_TEMPLATE.md`
- [x] Both templates have YAML frontmatter
- [x] Templates contain `[placeholder]` markers
- [x] Validation passes

### Verification Script

```bash
#!/bin/bash
# verify-node-creation-templates.sh

echo "Verifying Node Creation Templates..."

# Check 1: NODE_TEMPLATE.md exists
test -f templates/nodes/NODE_TEMPLATE.md && echo "OK: NODE_TEMPLATE.md" || echo "FAIL: NODE_TEMPLATE.md"

# Check 2: INSTALL_TEMPLATE.md exists
test -f docs/installation/INSTALL_TEMPLATE.md && echo "OK: INSTALL_TEMPLATE.md" || echo "FAIL: INSTALL_TEMPLATE.md"

# Check 3: Frontmatter exists
grep -q "^---" templates/nodes/NODE_TEMPLATE.md && echo "OK: NODE frontmatter" || echo "FAIL: NODE frontmatter"
grep -q "^---" docs/installation/INSTALL_TEMPLATE.md && echo "OK: INSTALL frontmatter" || echo "FAIL: INSTALL frontmatter"

# Check 4: Placeholders exist
grep -q "\[" templates/nodes/NODE_TEMPLATE.md && echo "OK: Placeholders" || echo "FAIL: Placeholders"

echo "Done!"
```

---

## Troubleshooting

### Issue: Template Not Found

**Symptom:**
```
FAIL: NODE_TEMPLATE.md not found
```

**Cause:** Template file was deleted or moved

**Solution:**
```bash
# Restore from git
git checkout templates/nodes/NODE_TEMPLATE.md
```

### Issue: Missing Frontmatter

**Symptom:**
```
Both templates must have valid YAML frontmatter
```

**Cause:** Frontmatter was removed or malformed

**Solution:**
Ensure templates start with:
```yaml
---
node_id: "[node-id]"
version: "1.0.0"
...
---
```

---

## Related Documentation

- [NODE_TEMPLATE.md](../../templates/nodes/NODE_TEMPLATE.md)
- [INSTALL_TEMPLATE.md](./INSTALL_TEMPLATE.md)
- [section-meta.yaml](../../config/section-meta.yaml) - Workflow 1 steps
- [/create-node skill](../../.claude/skills/create-node/SKILL.md)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-11 | Initial release |
