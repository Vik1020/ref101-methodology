<!--
INSTRUCTIONS: Before using this template

1. Replace all [placeholders] with actual values:
   - domain_id: BC_DOMAIN_[name] → BC_DOMAIN_ui, BC_DOMAIN_tracker
   - related_ac: AC_DOMAIN_[name] → AC_DOMAIN_ui
   - version: Current aggregated version of all features

2. Fill in applied_deltas with all deltas that have been applied

3. Document all active features from all applied deltas

4. Remove this instruction block after filling in all values

See also:
- Living Documentation Guide: specifications/guides/methodology/LIVING_DOCUMENTATION.md
-->

---
domain_id: BC_DOMAIN_[name]            # Example: BC_DOMAIN_ui, BC_DOMAIN_tracker
type: bc_domain_aggregator             # Don't change
version: "1.0.0"                       # Current domain version (matches last applied delta)
status: active                         # active | deprecated
last_updated: 2026-01-04               # REPLACE with current date
features_count: 0                      # Total active features
deprecated_count: 0                    # Total deprecated features
related_ac: AC_DOMAIN_[name]           # Corresponding AC domain
related_domains: []                    # Other related BC domains (if split)
applied_deltas:
  - version: v1.0.0
    delta: BC_delta_v1_0_0_[name]
    applied_at: 2026-01-04
  # Add more as deltas are applied
last_applied_version: v1.0.0           # Version of last applied delta
---

# BC Domain: [Domain Name]

> **Domain ID:** BC_DOMAIN_[name]
> **Version:** [X.Y.Z]
> **Last Updated:** [YYYY-MM-DD]
> **Related AC:** [AC_DOMAIN_[name]](AC_DOMAIN_[name].md)

## Overview

[2-3 sentences describing what this domain covers and its business purpose]

---

## Goals

1. [Goal 1: Primary business objective of this domain]
2. [Goal 2: Secondary business objective]
3. [Goal 3: Additional objective]

---

## Actors

| Actor | Description | Key Actions |
|-------|-------------|-------------|
| [Actor 1] | [Who they are] | [What they do in this domain] |
| [Actor 2] | [Who they are] | [What they do in this domain] |

---

## Active Features

### F001: [Feature Name]

- **Introduced:** v[X.Y.Z]
- **Modified:** v[X.Y.Z] (if applicable)
- **Status:** active
- **Description:** [Brief description of what this feature does]

**Scenarios:**
- **S1:** [User does X to achieve Y]
- **S2:** [User does X to achieve Y]

**Business Rules:**
- **BR-1:** [Rule description]

---

### F002: [Feature Name]

- **Introduced:** v[X.Y.Z]
- **Status:** active
- **Description:** [Brief description]

**Scenarios:**
- **S1:** [Scenario description]

**Business Rules:**
- **BR-1:** [Rule description]

---

## Deprecated Features

### F00X: [Feature Name] (deprecated)

- **Introduced:** v[X.Y.Z]
- **Deprecated:** v[X.Y.Z]
- **Removal Planned:** v[X.Y.Z]
- **Replaced By:** F00Y [Feature Name]
- **Description:** [What this feature did]

**Migration:**
- [How to migrate to replacement feature]

---

## Feature Summary

| ID | Feature | Status | Introduced | Modified | Description |
|----|---------|--------|------------|----------|-------------|
| F001 | [Name] | active | v1.0.0 | - | [Brief] |
| F002 | [Name] | active | v1.0.0 | v1.2.0 | [Brief] |
| F00X | [Name] | deprecated | v1.0.0 | - | [Brief] |

---

## Domain Statistics

| Metric | Value |
|--------|-------|
| Total Features | [N] |
| Active Features | [N] |
| Deprecated Features | [N] |
| Total Scenarios | [N] |
| Total Business Rules | [N] |
| Applied Deltas | [N] |

---

## Applied Deltas History

| Version | Delta | Applied At | Changes Summary |
|---------|-------|------------|-----------------|
| v1.0.0 | BC_delta_v1_0_0_[name] | [Date] | Initial features |
| v1.1.0 | BC_delta_v1_1_0_[name] | [Date] | Added F003, F004 |
| v1.2.0 | BC_delta_v1_2_0_[name] | [Date] | Modified F002, deprecated F001 |

---

## Related Documentation

- **AC Domain:** [AC_DOMAIN_[name]](AC_DOMAIN_[name].md)
- **Deltas:** [deltas/](../deltas/)
- **OVERVIEW:** [OVERVIEW.md](../OVERVIEW.md)

---

> **Maintenance Notes:**
> - Update this document using `pcc apply-delta` command
> - Do not edit manually except for overview and goals sections
> - Run `pcc validate-domains` to check for missing deltas
