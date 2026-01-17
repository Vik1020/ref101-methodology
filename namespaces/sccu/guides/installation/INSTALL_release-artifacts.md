---
install_id: INSTALL_release-artifacts
node_id: release-artifacts
node_name: "Release Artifacts"
version: "1.0.0"
status: active
last_updated: 2026-01-11
coupling: structural
canonical_project: ref101-specs
depends_on:
  - phase-templates
---

# Installation Guide: Release Artifacts

> **Node ID:** `release-artifacts`
> **Coupling:** structural
> **Canonical Project:** ref101-specs
> **Dependencies:** phase-templates

## Overview

Release Artifacts are version-specific documentation and state files generated during the release workflow. Each release creates a state JSON file and corresponding documentation in the releases directory.

---

## Prerequisites

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Git | 2.x | Latest |
| Node.js | v18.x | v20.x (for MCP tools) |

### Dependencies on Other Nodes

| Node | Role | Purpose |
|------|------|---------|
| phase-templates | provider | Templates for release documents |

---

## Provider Installation

> **Role:** Provider generates and maintains release artifacts
> **SSOT Pattern:** `.pcc/releases/*.json`

### Provider Prerequisites

- [ ] MCP tooling configured (optional but recommended)
- [ ] phase-templates available

### Step 1: Create PCC Directory

**Requirement ID:** `pcc-directory`

**Commands:**
```bash
mkdir -p .pcc/releases
```

---

### Step 2: Create Releases Docs Directory

**Requirement ID:** `releases-docs`

**Commands:**
```bash
mkdir -p docs/releases
```

---

### Step 3: Initialize Release (via MCP or manual)

**What:** Create release state and documentation

**Via MCP (recommended):**
```
pcc_init_release({
  version: "v1.0.0",
  feature_name: "initial_release",
  process_id: "feature_full",
  problem_statement: "Description"
})
```

**Manual Structure:**

`.pcc/releases/v1.0.0.json`:
```json
{
  "release_id": "RELEASE_v1_0_0_initial_release",
  "version": "v1.0.0",
  "process_id": "feature_full",
  "workflow_state": {
    "current_phase": "RELEASE",
    "phase_history": []
  }
}
```

`docs/releases/v1.0.0/RELEASE_v1_0_0_initial_release.md`:
```markdown
---
release_id: RELEASE_v1_0_0_initial_release
version: v1.0.0
---

# Release v1.0.0: Initial Release

## Problem Statement
...
```

---

### Provider Validation Rules

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `state-schema-valid` | error | JSON has required fields |
| `state-dir-match` | warning | State file has release directory |

---

## Consumer Installation

> **Role:** Consumer creates own release artifacts
> **Typical Setup:** Each project has its own releases

### Consumer Prerequisites

- [ ] MCP tooling configured (recommended)
- [ ] OR manual workflow

### Step 1: Create Directories

**Commands:**
```bash
mkdir -p .pcc/releases
mkdir -p docs/releases
```

---

### Step 2: Configure MCP (recommended)

**What:** Set up MCP for automated release management

See [INSTALL_mcp-tooling.md](./INSTALL_mcp-tooling.md)

---

### Consumer Configuration

If using MCP, ensure `PROJECT_ROOT` is set in `.mcp.json`:
```json
{
  "mcpServers": {
    "pcc": {
      "env": {
        "PROJECT_ROOT": "/path/to/project"
      }
    }
  }
}
```

---

## Verification

### Quick Checklist

**For Provider/Consumer:**
- [ ] `.pcc/releases/` directory exists
- [ ] `docs/releases/` directory exists
- [ ] State files have valid JSON schema

### Verification Script

```bash
#!/bin/bash
# verify-release-artifacts.sh

PROJECT_ROOT="${1:-$(pwd)}"

[ -d "$PROJECT_ROOT/.pcc/releases" ] \
    && echo "OK .pcc/releases" || echo "FAIL .pcc/releases"

[ -d "$PROJECT_ROOT/docs/releases" ] \
    && echo "OK docs/releases" || echo "FAIL docs/releases"

# Check JSON validity
for state in "$PROJECT_ROOT"/.pcc/releases/*.json; do
    [ -f "$state" ] || continue
    node -e "require('$state')" 2>/dev/null \
        && echo "OK $(basename $state)" || echo "FAIL $(basename $state)"
done
```

---

## Troubleshooting

### Issue: State File Missing Required Fields

**Symptom:**
```
Error: Missing required field 'workflow_state.current_phase'
```

**Solution:**
Ensure state JSON has structure:
```json
{
  "release_id": "...",
  "version": "v1.0.0",
  "process_id": "...",
  "workflow_state": {
    "current_phase": "RELEASE"
  }
}
```

---

## Node Instance Registration

```yaml
instances:
  release-artifacts@my-project:
    template: release-artifacts
    project: my-project
    role: provider
    ssot: .pcc/releases/
    status: active
```

---

## Related Documentation

- [node-templates.yaml](../../config/node-templates.yaml)
- [MCP Tooling Install](./INSTALL_mcp-tooling.md)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-11 | Initial release |
