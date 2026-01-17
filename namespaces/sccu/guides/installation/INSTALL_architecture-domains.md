---
install_id: INSTALL_architecture-domains
node_id: architecture-domains
node_name: "Architecture Domains"
version: "1.1.0"
status: active
last_updated: 2026-01-11
coupling: semantic
canonical_project: ref101-specs
depends_on: []
---

# Installation Guide: Architecture Domains

> **Node ID:** `architecture-domains`
> **Coupling:** semantic
> **Canonical Project:** ref101-specs
> **Dependencies:** None

## Overview

Domain Documentation provides living documentation SSOT for business and analytical contexts. Each project maintains its own BC_DOMAIN_* and AC_DOMAIN_* files that describe the business logic and analytical model.

---

## Prerequisites

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Git | 2.x | Latest |
| Text editor | Any | VS Code with Markdown extension |

### Dependencies on Other Nodes

None - this is a standalone documentation node.

---

## Provider Installation

> **Role:** Provider maintains domain templates and documentation
> **Canonical Project:** ref101-specs (for templates)
> **SSOT Pattern:** `docs/domains/*_DOMAIN_*.md`

### Provider Prerequisites

- [ ] Project structure with docs/ directory
- [ ] Access to domain templates (optional)

### Step 1: Create Domains Directory

**Requirement ID:** `domains-directory`

**Commands:**
```bash
mkdir -p docs/domains
```

---

### Step 2: Create Domain Templates (for ref101-specs)

**Requirement ID:** `bc-template`, `ac-template`

**Paths:**
- `templates/domains/BC_DOMAIN_TEMPLATE.md`
- `templates/domains/AC_DOMAIN_TEMPLATE.md`

**BC Template Structure:**
```markdown
---
domain_id: BC_DOMAIN_[name]
type: bc_domain_aggregator
version: "1.0.0"
status: active
---

# BC Domain: [Name]

## Overview
[Description]

## Goals
1. [Goal 1]

## Actors
| Actor | Role |
|-------|------|

## Features
### F001: [Feature Name]
```

---

### Step 3: Create Domain Documents

**What:** Create BC and AC domain files for your project

**Naming Convention:**
- `BC_DOMAIN_[project_name].md` - Business Context
- `AC_DOMAIN_[project_name].md` - Analytical Context

**Example:**
```bash
touch docs/domains/BC_DOMAIN_node_validators.md
touch docs/domains/AC_DOMAIN_node_validators.md
```

---

### Provider Validation Rules

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `domain-has-frontmatter` | warning | Valid YAML frontmatter |
| `bc-ac-pair-exists` | warning | BC has matching AC |

---

## Consumer Installation

> **Role:** Consumer creates own domain docs using templates
> **Typical Setup:** Each project has its own domains

### Consumer Prerequisites

- [ ] Access to domain templates (via submodule)

### Step 1: Copy Templates

**What:** Use templates to create project-specific domain docs

**Commands:**
```bash
mkdir -p docs/domains

# Copy and customize templates
cp methodology/ref101-specs/templates/domains/BC_DOMAIN_TEMPLATE.md \
   docs/domains/BC_DOMAIN_my_project.md

cp methodology/ref101-specs/templates/domains/AC_DOMAIN_TEMPLATE.md \
   docs/domains/AC_DOMAIN_my_project.md
```

---

### Step 2: Customize Frontmatter

**What:** Update domain_id and other fields

**Edit BC domain:**
```yaml
---
domain_id: BC_DOMAIN_my_project
type: bc_domain_aggregator
version: "1.0.0"
status: active
related_ac: AC_DOMAIN_my_project
---
```

---

### Consumer Configuration

No additional configuration. Each project maintains its own domain docs.

---

## Verification

### Quick Checklist

**For Provider (ref101-specs):**
- [ ] `docs/domains/` directory exists
- [ ] Domain templates exist
- [ ] At least one BC/AC pair

**For Consumer:**
- [ ] `docs/domains/` directory exists
- [ ] BC and AC files have valid frontmatter

### Verification Script

```bash
#!/bin/bash
# verify-domain-docs.sh

PROJECT_ROOT="${1:-$(pwd)}"

DOMAINS_DIR="$PROJECT_ROOT/docs/domains"

[ -d "$DOMAINS_DIR" ] \
    && echo "OK domains directory" || echo "FAIL domains directory"

BC_COUNT=$(ls "$DOMAINS_DIR"/BC_DOMAIN_*.md 2>/dev/null | wc -l)
AC_COUNT=$(ls "$DOMAINS_DIR"/AC_DOMAIN_*.md 2>/dev/null | wc -l)

echo "Found $BC_COUNT BC domains, $AC_COUNT AC domains"

[ "$BC_COUNT" -gt 0 ] && echo "OK has BC domains" || echo "WARN no BC domains"
[ "$AC_COUNT" -gt 0 ] && echo "OK has AC domains" || echo "WARN no AC domains"
```

---

## Troubleshooting

### Issue: Missing Frontmatter

**Symptom:**
```
Warning: domain_id not found in frontmatter
```

**Cause:** YAML frontmatter missing or invalid

**Solution:**
Add frontmatter at the beginning of the file:
```markdown
---
domain_id: BC_DOMAIN_my_project
version: "1.0.0"
---
```

---

## Node Instance Registration

### Provider Registration

```yaml
instances:
  architecture-domains@ref101-specs:
    template: architecture-domains
    project: ref101-specs
    role: provider
    ssot: docs/domains/
    status: active
```

### Consumer Registration

```yaml
instances:
  architecture-domains@my-project:
    template: architecture-domains
    project: my-project
    role: consumer
    status: active
    notes: "Project-specific domain documentation"
```

---

## Related Documentation

- [node-templates.yaml](../../config/node-templates.yaml)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-11 | Initial release |
