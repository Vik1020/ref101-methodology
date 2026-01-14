---
install_id: INSTALL_workflow-mcp-server
node_id: workflow-mcp-server
node_name: "Workflow MCP Server"
version: "1.1.0"
status: active
last_updated: 2026-01-11
coupling: structural
canonical_project: ref101-pcc
depends_on:
  - workflow-engine
---

# Installation Guide: Workflow MCP Server

> **Node ID:** `workflow-mcp-server`
> **Coupling:** structural
> **Canonical Project:** ref101-pcc
> **Dependencies:** workflow-engine

## Overview

MCP Tooling provides Model Context Protocol server for programmatic workflow enforcement. It exposes 6 workflow tools (`pcc_init_release`, `pcc_create_artifact`, `pcc_workflow_status`, `pcc_workflow_transition`, `pcc_workflow_validate`, `pcc_record_phase_metrics`) that enable LLMs to manage release workflows with guaranteed state persistence.

---

## Prerequisites

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | v18.x | v20.x LTS |
| npm | v9.x | v10.x |
| TypeScript | v5.0 | v5.3+ |

### Project Requirements

| Requirement | Description | Check Command |
|-------------|-------------|---------------|
| npm workspaces | Monorepo structure | `npm -v` (9+) |
| TypeScript | For compilation | `tsc --version` |
| ref101-pcc | Provider project | `ls ../ref101-pcc` |

### Dependencies on Other Nodes

| Node | Role | Purpose |
|------|------|---------|
| workflow-engine | provider | Core state machine for workflow transitions |

---

## Provider Installation

> **Role:** Provider creates and maintains the MCP server implementation
> **Canonical Project:** ref101-pcc
> **SSOT Pattern:** `**/mcp/**/tools.ts`

### Provider Prerequisites

- [ ] You are working in ref101-pcc project
- [ ] workflow-engine node is implemented
- [ ] npm workspaces configured

### Step 1: Create MCP Package Structure

**Requirement ID:** `mcp-server-source`

**What:** Create the MCP server package with TypeScript source files

**Commands:**
```bash
cd /home/vikto/projects/ref101-pcc

mkdir -p packages/mcp/src/handlers
mkdir -p packages/mcp/src/protocol

cat > packages/mcp/package.json << 'EOF'
{
  "name": "@ref101/pcc-mcp",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  }
}
EOF

ls packages/mcp/
```

**Expected Result:**
```
package.json  src/
```

---

### Step 2: Implement MCP Server

**Requirement ID:** `mcp-server-source`

**What:** Create the main MCP server entry point

**Key Contents (server.ts):**
```typescript
import { createServer } from './protocol/server.js';
import { PCC_TOOLS } from './tools.js';

const server = createServer({
  name: 'pcc',
  version: '1.0.0',
  tools: PCC_TOOLS
});

server.start();
console.error('PCC MCP Server started');
```

---

### Step 3: Define MCP Tools (SSOT)

**Requirement ID:** `mcp-tools-definition`

**What:** Create tools.ts with all PCC workflow tool definitions

| Tool Name | Description |
|-----------|-------------|
| `pcc_init_release` | Initialize new release with state file |
| `pcc_create_artifact` | Create workflow artifact |
| `pcc_workflow_status` | Get current workflow state |
| `pcc_workflow_transition` | Transition to next phase |
| `pcc_workflow_validate` | Run phase validators |
| `pcc_record_phase_metrics` | Record token usage metrics |

---

### Step 4: Create Tool Handlers

**Requirement ID:** `mcp-handlers`

**What:** Implement handler functions for each MCP tool

**Commands:**
```bash
ls packages/mcp/src/handlers/
```

**Expected Result:**
```
createArtifact.ts
initRelease.ts
recordPhaseMetrics.ts
workflowStatus.ts
workflowTransition.ts
workflowValidate.ts
```

---

### Step 5: Build MCP Server

**Requirement ID:** `mcp-dist`

**What:** Compile TypeScript to JavaScript for runtime execution

**Commands:**
```bash
cd /home/vikto/projects/ref101-pcc
npm run build --workspace=packages/mcp
ls packages/mcp/dist/server.js
```

**Expected Result:**
```
packages/mcp/dist/server.js
```

---

### Provider Configuration

**File:** `packages/mcp/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  },
  "include": ["src/**/*"]
}
```

### Provider Validation Rules

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `mcp-server-accessible` | error | MCP server can start without errors |
| `handler-exists` | error | Each PCC_TOOL has corresponding handler |
| `tools-consistent` | warning | MCP tools in SKILLs match PCC_TOOLS |

**Run validation:**
```bash
make validate-instances
```

---

## Consumer Installation

> **Role:** Consumer connects to provider's MCP server via configuration
> **Typical Setup:** .mcp.json config file, optional tools symlink

### Consumer Prerequisites

- [ ] ref101-pcc project exists at ../ref101-pcc
- [ ] MCP server is built: `../ref101-pcc/packages/mcp/dist/server.js`
- [ ] Node.js available in PATH

### Step 1: Create MCP Configuration

**Requirement ID:** `mcp-config`

**What:** Create .mcp.json file pointing to provider's MCP server

**Commands:**
```bash
cd /home/vikto/projects/ref101-node-validators

cat > .mcp.json << 'EOF'
{
  "mcpServers": {
    "pcc": {
      "type": "stdio",
      "command": "node",
      "args": [
        "../ref101-pcc/packages/mcp/dist/server.js"
      ],
      "env": {
        "PROJECT_ROOT": "/home/vikto/projects/ref101-node-validators"
      }
    }
  }
}
EOF

cat .mcp.json
```

**Expected Result:**
```json
{
  "mcpServers": {
    "pcc": {
      "type": "stdio",
      "command": "node",
      "args": ["../ref101-pcc/packages/mcp/dist/server.js"]
    }
  }
}
```

---

### Step 2: Create Tools Symlink (Optional)

**Requirement ID:** `tools-symlink`

**What:** Symlink to observability tools

**Commands:**
```bash
cd /home/vikto/projects/ref101-node-validators
ln -sf ../ref101-specs/tools tools
ls -la tools
```

**Expected Result:**
```
tools -> ../ref101-specs/tools
```

---

### Step 3: Verify MCP Server Path

**Requirement ID:** `mcp-server-path-exists`

**What:** Ensure the path in .mcp.json resolves to existing file

**Commands:**
```bash
ls -la ../ref101-pcc/packages/mcp/dist/server.js
```

---

### Consumer Configuration

**File:** `.mcp.json`

```json
{
  "mcpServers": {
    "pcc": {
      "type": "stdio",
      "command": "node",
      "args": ["../ref101-pcc/packages/mcp/dist/server.js"],
      "env": {
        "PROJECT_ROOT": "${absolute_path_to_project}"
      }
    }
  }
}
```

### Consumer Validation Rules

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `mcp-json-valid` | error | .mcp.json is valid JSON |
| `mcp-server-path-exists` | error | MCP server path exists |

---

## Verification

### Quick Checklist

**For Provider (ref101-pcc):**
- [ ] SSOT file exists: `packages/mcp/src/tools.ts`
- [ ] Server compiles: `packages/mcp/dist/server.js`
- [ ] All 6 handlers exist
- [ ] Server starts without errors

**For Consumer:**
- [ ] `.mcp.json` exists and is valid JSON
- [ ] `mcpServers.pcc.args` path resolves
- [ ] PROJECT_ROOT env is absolute path

### Verification Script

```bash
#!/bin/bash
# verify-mcp-tooling.sh

PROJECT_ROOT="${1:-$(pwd)}"
ROLE="${2:-consumer}"

echo "Verifying mcp-tooling installation..."

if [ "$ROLE" = "provider" ]; then
    [ -f "$PROJECT_ROOT/packages/mcp/src/tools.ts" ] \
        && echo "OK SSOT" || echo "FAIL SSOT"
    [ -f "$PROJECT_ROOT/packages/mcp/dist/server.js" ] \
        && echo "OK dist" || echo "FAIL dist"
else
    [ -f "$PROJECT_ROOT/.mcp.json" ] \
        && echo "OK .mcp.json" || echo "FAIL .mcp.json"
    node -e "require('$PROJECT_ROOT/.mcp.json')" 2>/dev/null \
        && echo "OK valid JSON" || echo "FAIL invalid JSON"
fi

make validate-instances
```

---

## Troubleshooting

### Issue: MCP Server Not Found

**Symptom:**
```
Error: Cannot find module '../ref101-pcc/packages/mcp/dist/server.js'
```

**Cause:** MCP server not compiled or path incorrect

**Solution:**
```bash
cd ../ref101-pcc
npm run build --workspace=packages/mcp
ls packages/mcp/dist/server.js
```

---

### Issue: PROJECT_ROOT Not Set

**Symptom:**
```
Error: PROJECT_ROOT environment variable not set
```

**Cause:** .mcp.json missing PROJECT_ROOT in env

**Solution:**
Edit .mcp.json to add PROJECT_ROOT with absolute path.

---

### Issue: Invalid JSON in .mcp.json

**Symptom:**
```
SyntaxError: Unexpected token } in JSON
```

**Cause:** Malformed JSON

**Solution:**
```bash
node -e "console.log(JSON.stringify(require('./.mcp.json'), null, 2))"
```

---

## Node Instance Registration

### Provider Registration

```yaml
instances:
  workflow-mcp-server@ref101-pcc:
    template: workflow-mcp-server
    project: ref101-pcc
    role: provider
    ssot: packages/mcp/src/tools.ts
    status: active
    notes: "MCP server with 6 workflow tools"
```

### Consumer Registration

```yaml
instances:
  workflow-mcp-server@ref101-node-validators:
    template: workflow-mcp-server
    project: ref101-node-validators
    role: consumer
    config:
      mcp_json: .mcp.json
      server_path: ../ref101-pcc/packages/mcp/dist/server.js
    status: active
```

---

## Related Documentation

- [node-templates.yaml](../../config/node-templates.yaml)
- [node-instances.yaml](../../config/node-instances.yaml)
- [MCP Protocol](https://modelcontextprotocol.io/)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-11 | Initial release |
