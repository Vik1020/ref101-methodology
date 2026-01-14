---
install_id: INSTALL_design-tokens
node_id: design-tokens
node_name: "Design Tokens"
version: "1.1.0"
status: active
last_updated: 2026-01-11
coupling: structural
canonical_project: ref101-specs
depends_on:
  - workflow-engine
  - workflow-phase-templates
  - workflow-mcp-server
---

# Installation Guide: Design Tokens

> **Node ID:** `design-tokens`
> **Coupling:** structural
> **Canonical Project:** ref101-specs
> **Dependencies:** workflow-engine, workflow-phase-templates, workflow-mcp-server

## Overview

Design System provides design tokens, components, and provider configuration for LLM-driven UI generation. It follows W3C Design Tokens specification and enables consistent UI generation across projects.

---

## Prerequisites

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | v18.x | v20.x LTS |
| Git | 2.x | Latest |

### Dependencies on Other Nodes

| Node | Role | Purpose |
|------|------|---------|
| workflow-engine | provider | Integration with workflow |
| workflow-phase-templates | provider | UI generation phases |
| workflow-mcp-server | provider | Design system MCP tools |

---

## Provider Installation

> **Role:** Provider maintains design tokens and component definitions
> **Canonical Project:** ref101-specs
> **SSOT Pattern:** `design-system/config.json`

### Provider Prerequisites

- [ ] You are working in ref101-specs project
- [ ] Familiarity with W3C Design Tokens spec

### Step 1: Create Design System Structure

**Requirement ID:** `config-file`

**Commands:**
```bash
mkdir -p design-system/tokens
mkdir -p design-system/providers
```

---

### Step 2: Create Config File

**Requirement ID:** `config-file`

**Path:** `design-system/config.json`

**Contents:**
```json
{
  "version": "1.0.0",
  "provider": "shadcn-ui",
  "tokens_path": "design-system/tokens/",
  "providers_path": "design-system/providers/",
  "components": [
    "button",
    "card",
    "dialog",
    "input"
  ]
}
```

---

### Step 3: Create Design Tokens

**Requirement ID:** `tokens-directory`

**Path:** `design-system/tokens/colors.json`

**W3C Format:**
```json
{
  "color": {
    "primary": {
      "$type": "color",
      "$value": "#3b82f6"
    },
    "secondary": {
      "$type": "color",
      "$value": "#64748b"
    }
  }
}
```

---

### Provider Validation Rules

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `provider-config-valid` | error | config.json has valid structure |
| `tokens-w3c-format` | error | Tokens follow W3C spec |

---

## Consumer Installation

> **Role:** Consumer uses design system via submodule access
> **Typical Setup:** Read-only access to tokens

### Consumer Prerequisites

- [ ] ref101-specs submodule available

### Step 1: Verify Access

**Commands:**
```bash
ls methodology/ref101-specs/design-system/
```

**Expected Result:**
```
config.json
tokens/
providers/
```

---

### Step 2: Use Tokens

**What:** Import tokens in your project

**JavaScript:**
```javascript
import tokens from './methodology/ref101-specs/design-system/tokens/colors.json';
```

**CSS (via build tool):**
```css
:root {
  --color-primary: var(--design-token-color-primary);
}
```

---

### Consumer Configuration

No additional configuration. Design system is read-only via submodule.

---

## Verification

### Quick Checklist

**For Provider:**
- [ ] `design-system/config.json` exists
- [ ] `design-system/tokens/` has at least one JSON file
- [ ] Tokens follow W3C format

**For Consumer:**
- [ ] Design system accessible via submodule
- [ ] Can read config.json

### Verification Script

```bash
#!/bin/bash
# verify-design-system.sh

PROJECT_ROOT="${1:-$(pwd)}"

DS_DIR="$PROJECT_ROOT/design-system"
[ ! -d "$DS_DIR" ] && DS_DIR="$PROJECT_ROOT/methodology/ref101-specs/design-system"

[ -d "$DS_DIR" ] \
    && echo "OK design-system directory" || echo "FAIL"

[ -f "$DS_DIR/config.json" ] \
    && echo "OK config.json" || echo "FAIL config.json"

[ -d "$DS_DIR/tokens" ] \
    && echo "OK tokens directory" || echo "FAIL tokens"

# Validate config JSON
node -e "require('$DS_DIR/config.json')" 2>/dev/null \
    && echo "OK valid JSON" || echo "FAIL invalid JSON"
```

---

## Troubleshooting

### Issue: Invalid Token Format

**Symptom:**
```
Error: Token 'color.primary' missing $type or $value
```

**Cause:** Token doesn't follow W3C Design Tokens spec

**Solution:**
```json
{
  "color": {
    "primary": {
      "$type": "color",
      "$value": "#3b82f6"
    }
  }
}
```

---

## Node Instance Registration

### Provider Registration

```yaml
instances:
  design-tokens@ref101-specs:
    template: design-tokens
    project: ref101-specs
    role: provider
    ssot: design-system/config.json
    status: active
```

---

## Related Documentation

- [node-templates.yaml](../../config/node-templates.yaml)
- [W3C Design Tokens](https://design-tokens.github.io/community-group/format/)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-11 | Initial release |
