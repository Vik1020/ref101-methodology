<!--
INSTRUCTIONS: Before using this template

1. Replace all [placeholders] with actual values:
   - context_id: PA_[category]_[name] → PA_api_internal, PA_database_schema, etc.
   - category: api | database | storage | deployment | monitoring | auth | cache | queue
   - format: openapi | sql | yaml | json | env
   - last_updated: 2025-12-23 → Use today's date (format: YYYY-MM-DD)

2. Choose a unique context_id following the pattern: PA_[category]_[name]
   - Only letters (a-z, A-Z) and underscores allowed
   - NO hyphens, NO braces, NO brackets
   - Examples: PA_api_internal, PA_database_schema, PA_env_config

3. Update the date field with today's date:
   - Get date: `date +%Y-%m-%d` (Linux/Mac) or `Get-Date -Format "yyyy-MM-dd"` (Windows)
   - Format: YYYY-MM-DD (e.g., 2025-12-23)

4. Remove this instruction block after filling in all values

5. Fill in all required sections below

See also:
- YAML formatting guide: specifications/guides/standards/development/YAML_FRONTMATTER_GUIDE.md
- Error reference: specifications/guides/standards/testing/ERROR_MESSAGES_REFERENCE.md
- EPA checklist: specifications/reference/assets/EPA_CHECKLIST.md
-->

---
context_id: PA_[category]_[name]  # Example: PA_api_internal, PA_database_schema
version: "1.0.0"                  # Keep quotes! Don't use: version: 1.0.0
type: project-asset               # Don't change - PA contexts are always type: project-asset
category: api                     # api | database | storage | deployment | monitoring | auth | cache | queue
format: openapi                   # openapi | sql | yaml | json | env | docker | k8s
applies_to:                       # Which context types this PA applies to
  - analytical                    # AC contexts can use this PA
  - programmatic                  # PC contexts can use this PA
health:
  documentation_coverage: 100     # 0-100 percentage
  last_updated: 2025-12-23        # REPLACE with current date (format: YYYY-MM-DD)
  staleness_days: 0               # Auto-calculated by validator
  schema_validation: passed       # passed | failed | pending
related_assets:                   # Optional: Related PA contexts
  - PA_[related_id]: "1.0.0"
generates_public_docs:            # Optional: PDC contexts generated from this PA
  - PDC_[id]
migration:
  breaking_changes: []            # List of breaking changes (if any)
  deprecations: []                # List of deprecated features
  migration_guide: null           # Link to migration guide (if needed)
owners:                           # Optional: Key stakeholders
  - role: "Technical Lead"
    name: "[Name]"
  - role: "DevOps Engineer"
    name: "[Name]"
---

# Project Asset: [Name]

## Purpose

[Brief description of what this asset defines - under 100 words]

**Examples:**
- API schema for internal microservices communication
- PostgreSQL database schema with migrations
- Environment variables configuration
- Docker deployment manifests

---

## Schema/Specification

### Location

**Primary file:** `[relative/path/to/schema.yaml]`

**Examples:**
```
specifications/reference/assets/PA_api_internal/openapi.yaml
specifications/reference/assets/PA_database_schema/migrations/
specifications/reference/assets/PA_env_config/.env.example
```

### Format

- **Type:** [OpenAPI 3.1 | SQL DDL | YAML | JSON | ENV]
- **Version:** [Schema version if applicable]
- **Validation:** [How to validate - npm script, tool, etc.]

---

## Usage in AC/PC Contexts

### How to Reference

```yaml
# In AC context.md
uses_assets:
  - PA_[this_asset_id]: "1.0.0"

# In PC context.md
uses_assets:
  - PA_[this_asset_id]: "1.0.0"
```

### Integration Examples

**Example 1: API Endpoint Usage**
```typescript
// AC: Declare dependency
uses_assets:
  - PA_api_internal: "1.0.0"

// PC: Import types from OpenAPI schema
import { ProductResponse } from '@/generated/api-types';
```

**Example 2: Database Access**
```typescript
// AC: Declare dependency
uses_assets:
  - PA_database_schema: "2.0.0"

// PC: Reference table structure
// SELECT * FROM products (defined in PA_database_schema)
```

---

## Validation

### Automated Checks

```bash
# Validate schema
npm run validate-asset -- --asset=PA_[this_id]

# Check references
npm run check-asset-references -- --asset=PA_[this_id]
```

### Manual Checks

- [ ] Schema is syntactically valid
- [ ] All required fields are documented
- [ ] Examples are provided
- [ ] Version is updated if schema changed

---

## Artifacts

### File Structure

```
specifications/reference/assets/PA_[this_id]/
├── pa.md                  # This file - metadata and documentation
├── [primary_schema_file]  # Main schema (openapi.yaml, schema.sql, etc.)
└── [supporting_files]/    # Examples, migrations, policies, etc.
```

### Schema File

**File:** `[schema_file_name]`
**Description:** [What this file contains]

**Example:**
```yaml
# For OpenAPI
openapi: 3.1.0
info:
  title: Internal API
  version: 1.0.0
paths:
  /api/products:
    get:
      summary: List products
      # ...
```

### Supporting Files

- **[File/Directory name]:** [Description]
- **[File/Directory name]:** [Description]

---

## Versioning Rules

### Breaking Changes (MAJOR bump: 1.0.0 → 2.0.0)

- Removing or renaming fields in API schema
- Changing data types (string → number)
- Removing required environment variables
- Dropping database tables or columns
- Changing authentication methods

### New Features (MINOR bump: 1.0.0 → 1.1.0)

- Adding new API endpoints
- Adding new optional fields
- New database migrations (additive only)
- New environment variables (optional)

### Bug Fixes (PATCH bump: 1.0.0 → 1.0.1)

- Fixing descriptions in schema
- Updating examples
- Correcting validation rules (without changing behavior)

---

## Related Contexts

### Used By

**AC Contexts:**
- [AC_[id]] - [Description]

**PC Contexts:**
- [PC_[id]] - [Description]

### Depends On

- [PA_[id]] - [Description]

### Generates

**PDC Contexts:**
- [PDC_[id]] - [Public documentation based on this asset]

---

## Examples

### Example 1: [Use Case]

[Code or configuration example showing how to use this asset]

```typescript
// Example code
```

### Example 2: [Use Case]

[Another example]

---

## Migration Guide

### From v0.x to v1.0.0

**Breaking Changes:**
- [Change description]

**Migration Steps:**
1. [Step 1]
2. [Step 2]

**Rollback Plan:**
- [How to revert if needed]

---

## Migration Log

### v1.0.0 - 2025-12-23 (Initial Version)
**Changes:** Initial asset definition
**Migration Steps:** N/A
**Affected Contexts:** None
