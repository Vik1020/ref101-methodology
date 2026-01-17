---
install_id: INSTALL_workflow-automation-skills
node_id: workflow-automation-skills
node_name: "Workflow Automation Skills"
version: "1.1.0"
status: active
last_updated: 2026-01-11
coupling: semantic
canonical_project: ref101-specs
depends_on:
  - workflow-mcp-server
  - workflow-process-definitions
---

# Installation Guide: Workflow Automation Skills

> **Node ID:** `workflow-automation-skills`
> **Coupling:** semantic
> **Canonical Project:** ref101-specs
> **Dependencies:** workflow-mcp-server, workflow-process-definitions

## Overview

Skills are LLM-executable workflow automation definitions. Each skill (e.g., `/hotfix`, `/new-feature`) combines MCP tools with process definitions to automate specific workflow patterns.

---

## Prerequisites

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Git | 2.x | Latest |
| Claude Code | Latest | Latest |

### Dependencies on Other Nodes

| Node | Role | Purpose |
|------|------|---------|
| workflow-mcp-server | provider | MCP tools used by skills |
| workflow-process-definitions | provider | Process IDs referenced by skills |

---

## Provider Installation

> **Role:** Provider maintains SKILL.md definitions
> **Canonical Project:** ref101-specs
> **SSOT Pattern:** `.claude/skills/*/SKILL.md`

### Provider Prerequisites

- [ ] You are working in ref101-specs project
- [ ] MCP tooling available
- [ ] Process definitions available

### Step 1: Create Skills Directory

**Requirement ID:** `skills-directory`

**Commands:**
```bash
mkdir -p .claude/skills
```

---

### Step 2: Create Skills README

**Requirement ID:** `skill-readme`

**Path:** `.claude/skills/README.md`

**Contents:**
```markdown
# Skills

Available skills for Claude Code:
- `/hotfix` - Quick bugfix workflow
- `/new-feature` - Full feature development
- `/new-release-auto` - Automatic release workflow
```

---

### Step 3: Create Skill Definitions

**What:** Create SKILL.md for each skill

**Structure:**
```
.claude/skills/
├── README.md
├── hotfix/
│   └── SKILL.md
├── new-feature/
│   └── SKILL.md
└── new-release-auto/
    └── SKILL.md
```

**SKILL.md Template:**
```markdown
---
name: hotfix
description: Quick bugfix workflow
process_id: bugfix_simple
triggers:
  - "/hotfix"
  - "hotfix"
---

# Hotfix Skill

## Instructions

1. Parse request
2. Call pcc_init_release with process_id: bugfix_simple
3. Execute workflow phases
...
```

---

### Provider Validation Rules

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `skill-has-frontmatter` | error | Valid YAML frontmatter |
| `skill-has-instructions` | warning | Instructions section exists |
| `mcp-tools-valid` | error | Referenced MCP tools exist |
| `process-id-valid` | warning | Process IDs match processes/*.json |

---

## Consumer Installation

> **Role:** Consumer accesses skills via symlink
> **Typical Setup:** Symlink to ref101-specs/.claude/skills

### Consumer Prerequisites

- [ ] ref101-specs available (submodule or sibling)
- [ ] Claude Code configured

### Step 1: Create Skills Symlink

**Requirement ID:** `skills-symlink`

**Commands:**
```bash
mkdir -p .claude
ln -sf ../methodology/ref101-specs/.claude/skills .claude/skills
# or if sibling project:
ln -sf ../ref101-specs/.claude/skills .claude/skills
```

---

### Step 2: Verify Access

**Commands:**
```bash
ls .claude/skills/
```

**Expected Result:**
```
README.md
hotfix/
new-feature/
new-release-auto/
```

---

### Consumer Configuration

Claude Code automatically discovers skills in `.claude/skills/`.

### Consumer Validation Rules

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `symlink-target-valid` | error | Symlink points to valid directory |

---

## Verification

### Quick Checklist

**For Provider:**
- [ ] `.claude/skills/` directory exists
- [ ] README.md exists
- [ ] Each skill has SKILL.md with frontmatter

**For Consumer:**
- [ ] `.claude/skills` symlink exists
- [ ] Skills accessible via symlink

### Verification Script

```bash
#!/bin/bash
# verify-skills.sh

PROJECT_ROOT="${1:-$(pwd)}"

SKILLS_DIR="$PROJECT_ROOT/.claude/skills"

[ -d "$SKILLS_DIR" ] || [ -L "$SKILLS_DIR" ] \
    && echo "OK skills directory/symlink" || echo "FAIL"

[ -f "$SKILLS_DIR/README.md" ] \
    && echo "OK README.md" || echo "WARN README.md"

for skill in hotfix new-feature new-release-auto; do
    [ -f "$SKILLS_DIR/$skill/SKILL.md" ] \
        && echo "OK $skill/SKILL.md" || echo "WARN $skill missing"
done
```

---

## Troubleshooting

### Issue: Skill Not Recognized

**Symptom:**
```
Error: Unknown skill '/hotfix'
```

**Cause:** Skills symlink broken or not pointing to valid directory

**Solution:**
```bash
ls -la .claude/skills  # Check symlink
rm .claude/skills
ln -sf ../ref101-specs/.claude/skills .claude/skills
```

---

## Node Instance Registration

### Provider Registration

```yaml
instances:
  workflow-automation-skills@ref101-specs:
    template: workflow-automation-skills
    project: ref101-specs
    role: provider
    ssot: .claude/skills/
    status: active
```

### Consumer Registration

```yaml
instances:
  workflow-automation-skills@ref101-node-validators:
    template: workflow-automation-skills
    project: ref101-node-validators
    role: consumer
    config:
      skills_symlink: .claude/skills -> ../ref101-specs/.claude/skills
    status: active
```

---

## Related Documentation

- [node-templates.yaml](../../config/node-templates.yaml)
- [MCP Server Install](./INSTALL_workflow-mcp-server.md)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-11 | Initial release |
