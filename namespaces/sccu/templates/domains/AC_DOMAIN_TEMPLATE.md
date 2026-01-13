<!--
INSTRUCTIONS: Before using this template

1. Replace all [placeholders] with actual values:
   - domain_id: AC_DOMAIN_[name] → AC_DOMAIN_ui, AC_DOMAIN_tracker
   - related_bc: BC_DOMAIN_[name] → BC_DOMAIN_ui
   - version: Current aggregated version

2. Fill in applied_deltas with all deltas that have been applied

3. Document all active Use Cases, API Contracts, and Data Models

4. Remove this instruction block after filling in all values

See also:
- Living Documentation Guide: specifications/guides/methodology/LIVING_DOCUMENTATION.md
-->

---
domain_id: AC_DOMAIN_[name]            # Example: AC_DOMAIN_ui, AC_DOMAIN_tracker
type: ac_domain_aggregator             # Don't change
version: "1.0.0"                       # Current domain version
status: active                         # active | deprecated
last_updated: 2026-01-04               # REPLACE with current date
use_cases_count: 0                     # Total active Use Cases
api_endpoints_count: 0                 # Total API endpoints
data_models_count: 0                   # Total data models
related_bc: BC_DOMAIN_[name]           # Corresponding BC domain
related_domains: []                    # Other related AC domains (if split)
applied_deltas:
  - version: v1.0.0
    delta: AC_delta_v1_0_0_[name]
    applied_at: 2026-01-04
last_applied_version: v1.0.0
---

# AC Domain: [Domain Name]

> **Domain ID:** AC_DOMAIN_[name]
> **Version:** [X.Y.Z]
> **Last Updated:** [YYYY-MM-DD]
> **Related BC:** [BC_DOMAIN_[name]](BC_DOMAIN_[name].md)

## Overview

[2-3 sentences describing the analytical scope of this domain - Use Cases, APIs, and Data Models covered]

---

## Use Cases

### UC001: [Use Case Name]

- **Introduced:** v[X.Y.Z]
- **Modified:** v[X.Y.Z] (if applicable)
- **Status:** active

**Actor:** [Who performs this action]

**Preconditions:**
- [Condition 1]
- [Condition 2]

**Main Flow:**
1. [Actor] [does action]
2. System [validates/processes]
3. System [returns result]

**Postconditions:**
- [State after completion]

**Business Rules Applied:**
- BR-[X] from BC_DOMAIN_[name]

**Error Handling:**
| Error | Response | Recovery |
|-------|----------|----------|
| [Error 1] | [Response] | [Action] |

---

### UC002: [Use Case Name]

- **Introduced:** v[X.Y.Z]
- **Status:** active

**Actor:** [Actor]

**Preconditions:**
- [Condition]

**Main Flow:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Postconditions:**
- [State]

---

## Deprecated Use Cases

### UC00X: [Use Case Name] (deprecated)

- **Introduced:** v[X.Y.Z]
- **Deprecated:** v[X.Y.Z]
- **Replaced By:** UC00Y

---

## API Contracts

### GET /api/[resource]

- **Introduced:** v[X.Y.Z]
- **Modified:** v[X.Y.Z] (if applicable)
- **Status:** active
- **Description:** [What this endpoint does]

**Request:**
```
GET /api/[resource]?param1=value1&param2=value2
Headers:
  Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "field": "value"
  },
  "meta": {
    "total": 100,
    "page": 1
  }
}
```

**Validation Rules:**
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| param1 | string | Yes | Max 100 chars |
| param2 | number | No | 1-1000 |

**Error Responses:**
| Code | Description | Body |
|------|-------------|------|
| 400 | Invalid input | `{"error": "message"}` |
| 401 | Unauthorized | `{"error": "Not authenticated"}` |
| 404 | Not found | `{"error": "Resource not found"}` |

---

### POST /api/[resource]

- **Introduced:** v[X.Y.Z]
- **Status:** active
- **Description:** [What this endpoint does]

**Request:**
```json
{
  "field1": "string",
  "field2": 123
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "generated-id",
    "field1": "string",
    "createdAt": "2026-01-04T00:00:00Z"
  }
}
```

---

## Deprecated Endpoints

### [METHOD] /api/[old-path] (deprecated)

- **Deprecated:** v[X.Y.Z]
- **Sunset:** v[X.Y.Z]
- **Replacement:** [METHOD] /api/[new-path]

---

## Data Models

### [ModelName]

- **Introduced:** v[X.Y.Z]
- **Modified:** v[X.Y.Z] (if applicable)
- **Status:** active

```typescript
interface [ModelName] {
  /** Unique identifier */
  id: string;

  /** [Field description] */
  field1: string;

  /** [Field description] */
  field2: number;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}
```

**Validation:**
- `id`: UUID format
- `field1`: Non-empty, max 100 chars
- `field2`: Range 0-1000

---

### [AnotherModel]

- **Introduced:** v[X.Y.Z]
- **Status:** active

```typescript
interface [AnotherModel] {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
}
```

---

## Use Cases Summary

| ID | Name | Actor | Status | Introduced | Modified |
|----|------|-------|--------|------------|----------|
| UC001 | [Name] | [Actor] | active | v1.0.0 | - |
| UC002 | [Name] | [Actor] | active | v1.0.0 | v1.2.0 |
| UC00X | [Name] | [Actor] | deprecated | v1.0.0 | - |

---

## API Endpoints Summary

| Method | Path | Status | Introduced | Description |
|--------|------|--------|------------|-------------|
| GET | /api/[resource] | active | v1.0.0 | [Brief] |
| POST | /api/[resource] | active | v1.0.0 | [Brief] |
| PUT | /api/[resource]/:id | active | v1.1.0 | [Brief] |

---

## Domain Statistics

| Metric | Value |
|--------|-------|
| Total Use Cases | [N] |
| Active Use Cases | [N] |
| Deprecated Use Cases | [N] |
| Total API Endpoints | [N] |
| Total Data Models | [N] |
| Applied Deltas | [N] |

---

## Applied Deltas History

| Version | Delta | Applied At | Changes Summary |
|---------|-------|------------|-----------------|
| v1.0.0 | AC_delta_v1_0_0_[name] | [Date] | Initial UC, API |
| v1.1.0 | AC_delta_v1_1_0_[name] | [Date] | Added UC003, new API |
| v1.2.0 | AC_delta_v1_2_0_[name] | [Date] | Modified UC002 |

---

## Related Documentation

- **BC Domain:** [BC_DOMAIN_[name]](BC_DOMAIN_[name].md)
- **Deltas:** [deltas/](../deltas/)
- **OVERVIEW:** [OVERVIEW.md](../OVERVIEW.md)

---

> **Maintenance Notes:**
> - Update this document using `pcc apply-delta` command
> - API contracts must match actual implementation
> - Run `pcc validate-domains` to check for missing deltas
