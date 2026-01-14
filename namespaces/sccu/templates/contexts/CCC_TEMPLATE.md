<!--
INSTRUCTIONS:
1. Replace CCC_[domain]_[name] with actual ID (e.g., CCC_error_boundary)
2. Update last_updated with today's date (YYYY-MM-DD)
3. Remove this block after filling

See: specifications/guides/standards/development/YAML_FRONTMATTER_GUIDE.md
-->

---
context_id: CCC_[domain]_[name]  # Example: CCC_error_boundary, CCC_theme_provider
version: "1.0.0"
type: cross-cutting
scope:
  layers:                         # Which layers this CCC applies to
    - frontend
    - backend                     # Optional: if it spans multiple layers
  contexts:                       # Which contexts use this CCC (glob patterns)
    - PC_*                        # All PC contexts can use
    - AC_*                        # Optional: if AC contexts reference it
health:
  documentation_coverage: 100
  last_updated: 2025-12-21        # REPLACE with current date (YYYY-MM-DD)
  staleness_days: 0
related_contexts:                 # Optional: Related CCCs or ICs
  - CCC_[related_id]
  - IC_[related_ic]
migration:
  breaking_changes: []
  deprecations: []
  migration_guide: null
---

# Cross-Cutting Context: [Name]

## Purpose
[What cross-cutting concern this addresses. Examples: error handling, theming, logging, analytics]

---

## API/Interface

**Public exports:**
```typescript
export function [functionName](params: Type): ReturnType;
export const [constantName]: Type;
```

---

## Usage

```typescript
import { [export] } from 'ccc/[domain]_[name]';

// Example usage
[exampleCode]
```

---

## Migration Log

### v1.0.0 - 2025-12-21
**Changes:** Initial definition
**Migration Steps:** N/A
**Affected Contexts:** None
