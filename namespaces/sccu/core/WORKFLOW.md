# Workflow (Single Source of Truth)

**Version:** 2.7.0
**Last Updated:** 2026-01-07

> **Architecture Change (v2.3.0):** Phase-specific rules (validators, skip conditions, transitions)
> are now defined in Templates (SSOT per phase). This file is an index.
>
> **Progress Tracking (v2.4.0):** RELEASE file now stores workflow state, phase history, and
> transition log. See [Progress Tracking](#progress-tracking-v240) section.
>
> **Process Composer (v1.13.1):** Workflows are now composable from reusable phases. See
> [Process Composer](#process-composer-v260) section.

---

## Diagram

```
RELEASE → BC_delta → AC_delta → PLAN_FINALIZE → PC → IC → QA → APPLY_DELTAS → DEPLOY
          (approval)  (approval)  (approval)                (approval)
```

---

## Phase Sequence

| # | Phase | Description | Approval | Template |
|---|-------|-------------|----------|----------|
| 1 | RELEASE | Create release context | - | [RELEASE_TEMPLATE](templates/phases/RELEASE_TEMPLATE.md) |
| 2 | BC_delta | Business Context (delta document) | ✓ Required | [BC_DELTA_TEMPLATE](templates/phases/BC_DELTA_TEMPLATE.md) |
| 3 | AC_delta | Analytical Context (delta document) | ✓ Required | [AC_DELTA_TEMPLATE](templates/phases/AC_DELTA_TEMPLATE.md) |
| 4 | PLAN_FINALIZE | Task decomposition | ✓ Required | [PLAN_FINALIZE_TEMPLATE](templates/phases/PLAN_FINALIZE_TEMPLATE.md) |
| 5 | PC | Programmatic Context (implementation) | - | [PC_CONTEXT_TEMPLATE](templates/phases/PC_CONTEXT_TEMPLATE.md) |
| 6 | IC | Infrastructure validation | - | [IC_TEMPLATE](templates/phases/IC_TEMPLATE.md) |
| 7 | QA | Testing | ✓ Required | [QA_TESTING_TEMPLATE](templates/phases/QA_TESTING_TEMPLATE.md) |
| 8 | APPLY_DELTAS | Apply BC/AC deltas to DOMAIN files | - | (below) |
| 9 | DEPLOY | Production deployment | - | (below) |

---

## Key Rules

1. **Delta = working document** until APPLY_DELTAS
2. **DOMAIN = source of truth** (updated only at APPLY_DELTAS)
3. **After APPLY_DELTAS** — changes only via new release
4. **Git = version control** for delta edits (no v1/v2 files needed)

---

## Process Composer (v1.13.1)

**Workflows are now composable** from reusable phases.

### Default Process

The workflow above (`RELEASE → BC_delta → AC_delta → PLAN_FINALIZE → PC → IC → QA → APPLY_DELTAS → DEPLOY`)
is the **default process** called `feature_full`.

### Available Processes

| Process ID | Name | Phases | Approvals | Use Case |
|-----------|------|--------|-----------|----------|
| [feature_full](processes/feature_full.json) | Feature Development (Full) | 9 | 4 | New features with full BC/AC analysis |
| [feature_full_auto](processes/feature_full_auto.json) | Feature Development (Full, Autonomous) | 9 | 0 | Pre-approved features, no human checkpoints |
| [bugfix_simple](processes/bugfix_simple.json) | Bugfix (Simple) | 5 | 1 | Bug fixes (skip BC/AC) |

### Process Composer Architecture

```
Process Definition (JSON) → Process Composer → Workflow Engine
```

- **Process Definitions** - Defined in `processes/*.json`
- **Phase Library** - Templates in `templates/phases/`
- **Composition** - Process = combination of reusable phases

### Using Processes

```bash
# List available processes
pcc process-list

# Show process details
pcc process-show feature_full

# Validate process definition
pcc process-validate bugfix_simple
```

### Creating Custom Processes

Projects can create custom processes in `{project}/processes/*.json`. See:
- [Process Registry](processes/README.md) - Process catalog
- [Process Composer Guide](guides/workflow/PROCESS_COMPOSER_GUIDE.md) - How to create processes

---

## Approval Points

| Phase | What is Approved | Approver |
|-------|------------------|----------|
| BC_delta | Business goals, actors, scenarios | Product Owner |
| AC_delta | Use cases, API contracts, data models | Tech Lead |
| PLAN_FINALIZE | Task breakdown, estimates | Team |
| QA | Test results, quality gates | QA Lead |

---

## Phase Details

Each Template contains full phase documentation (SSOT):
- **Validators** — preconditions for transition
- **Skip Checklist** — when phase can be skipped
- **Steps** — what to do in this phase
- **Transition** — next phase and approval requirements

| Phase | Template | Guide |
|-------|----------|-------|
| RELEASE | [RELEASE_TEMPLATE.md](templates/phases/RELEASE_TEMPLATE.md) | [RELEASE_MANAGEMENT.md](reference/work-tracking/RELEASE_MANAGEMENT.md) |
| BC_delta | [BC_DELTA_TEMPLATE.md](templates/phases/BC_DELTA_TEMPLATE.md) | [LIVING_DOCUMENTATION.md](guides/methodology/LIVING_DOCUMENTATION.md) |
| AC_delta | [AC_DELTA_TEMPLATE.md](templates/phases/AC_DELTA_TEMPLATE.md) | [LIVING_DOCUMENTATION.md](guides/methodology/LIVING_DOCUMENTATION.md) |
| PLAN_FINALIZE | [PLAN_FINALIZE_TEMPLATE.md](templates/phases/PLAN_FINALIZE_TEMPLATE.md) | [RELEASE_MANAGEMENT.md](reference/work-tracking/RELEASE_MANAGEMENT.md) |
| PC | [PC_CONTEXT_TEMPLATE.md](templates/phases/PC_CONTEXT_TEMPLATE.md) | - |
| IC | [IC_TEMPLATE.md](templates/phases/IC_TEMPLATE.md) | [infrastructure/](infrastructure/) |
| QA | [QA_TESTING_TEMPLATE.md](templates/phases/QA_TESTING_TEMPLATE.md) | [TESTING_STRATEGY.md](guides/standards/testing/TESTING_STRATEGY.md) |
| APPLY_DELTAS | (below) | [LIVING_DOCUMENTATION.md](guides/methodology/LIVING_DOCUMENTATION.md) |
| DEPLOY | (below) | [DEPLOYMENT_GUIDE.md](guides/standards/deployment/DEPLOYMENT_GUIDE.md) |

---

## Phase Artifacts (MANDATORY)

> **CRITICAL:** Each phase MUST produce an artifact file.

**Where to create:** See template frontmatter → `output_file` field
**Template links:** See table above (Phase Details column)

**Rules:**
1. Phase executed → Read template → Create file from `output_file` path
2. Updating `phase_history` ≠ creating artifact file
3. Both are required: file AND phase_history entry

**Validation:**
```bash
# Check release completeness
ls -1 docs/releases/v1.13.0/*.md | wc -l  # Should be 5-7 files
```

---

## Subprocess: APPLY_DELTAS

> No template needed — operational phase with no artifacts created.

**Input:** QA-approved deltas
**Output:** Updated DOMAIN files

**Steps:**
1. Apply BC_delta to BC_DOMAIN
2. Apply AC_delta to AC_DOMAIN
3. Validate all deltas applied
4. Commit changes
5. Transition to DEPLOYED

**Commands:**
- `pcc apply-delta <file> --domain=<name>`
- `pcc validate-domains`

**Validators:**

| Validator | Description |
|-----------|-------------|
| `deltas_applied` | All deltas in applied_deltas |

**Skip Checklist:**

**Skip allowed if ALL TRUE:**
- [ ] BC_delta and AC_delta were skipped
- [ ] No changes to domain-level documentation

**Skip FORBIDDEN if ANY TRUE:**
- [ ] BC_delta was created → requires apply to BC_DOMAIN
- [ ] AC_delta was created → requires apply to AC_DOMAIN
- [ ] Refactoring affected structure described in AC (paths, patterns)

**Transition:** APPLY_DELTAS → DEPLOYED (no approval, automated)

---

## Subprocess: DEPLOY

> No template needed — operational phase.

**Input:** Applied deltas, validated codebase
**Output:** Production deployment

**Steps:**
1. Create git tag
2. Run pre-deployment checks
3. Deploy to production
4. Verify deployment
5. Update release status to "released"

**Validators:**

| Validator | Description |
|-----------|-------------|
| `git_tag_created` | Version tag exists |
| `deploy_verified` | Post-deploy checks pass |

**Skip:** Never (always required for production)

**Transition:** DEPLOYED → (end of workflow)

---

## PCC Commands

| Command | Phase | Description |
|---------|-------|-------------|
| `pcc apply-delta <file> --domain=<name>` | APPLY_DELTAS | Apply delta to domain |
| `pcc validate-domains` | APPLY_DELTAS | Verify all deltas applied |
| `pcc rebuild-domain <name>` | Recovery | Rebuild from all deltas |

---

## Change Type Classification

First, classify the change type to determine required phases:

| Type | Required Phases | Skip Allowed |
|------|-----------------|--------------|
| `feature` | ALL (RELEASE → BC → AC → PLAN → PC → IC → QA → APPLY → DEPLOY) | None |
| `bugfix` | PC → IC → QA → DEPLOY | BC, AC, PLAN (unless contracts change) |
| `refactor` | PC → IC → QA → DEPLOY | BC, AC, PLAN, APPLY |
| `docs` | Documentation only | ALL code phases |
| `config` | PC → QA (smoke) → DEPLOY | BC, AC, PLAN, IC (unless security) |

### Layer Impact Analysis

Identify affected layers to determine required test types:

| Layer Affected | Required Tests |
|----------------|----------------|
| UI components | Visual tests (Playwright screenshots) |
| API endpoints | Contract tests |
| Business logic | Unit + Integration tests |
| Configuration | Smoke tests (startup verification) |

---

## Multi-Tool Projects

When a repository contains multiple tools (e.g., command-center, auto-classifier),
use namespace prefixes to avoid naming conflicts.

### Namespace Convention

| Element | Format | Example |
|---------|--------|---------|
| Domain | `BC_DOMAIN_{tool}_{domain}` | `BC_DOMAIN_pcc_ui` |
| Delta | `BC_delta_{tool}_{feature}` | `BC_delta_pcc_tabs` |
| Release | `RELEASE_v{M}_{m}_{p}_{tool}_{feature}` | `RELEASE_v1_0_0_pcc_web_ui` |
| Overview | `OVERVIEW_{tool}.md` | `OVERVIEW_pcc.md` |
| PLAN_FINALIZE | `PLAN_FINALIZE_{tool}_v{M}_{m}_{p}.md` | `PLAN_FINALIZE_pcc_v1_9_0.md` |
| IC_VALIDATION | `IC_VALIDATION_{tool}_v{M}_{m}_{p}.md` | `IC_VALIDATION_pcc_v1_9_0.md` |
| QA | `QA_{tool}_v{M}_{m}_{p}.md` | `QA_pcc_v1_9_0.md` |

### Directory Structure (SSOT)

> **Single Source of Truth:** This section defines all file locations.
> Other documents SHOULD reference this section instead of duplicating.

All tools share ONE `docs/` directory at project root:

```
docs/
├── TOOLS_INDEX.md                  # Registry of all tools
├── OVERVIEW_{tool}.md              # Per-tool overview
├── domains/                        # Current state (SSOT)
│   ├── BC_DOMAIN_{tool}_{domain}.md
│   └── AC_DOMAIN_{tool}_{domain}.md
└── releases/v{X.Y.Z}/              # ALL release artifacts
    ├── RELEASE_v{X}_{Y}_{Z}_{tool}_{feature}.md
    ├── BC_delta_{tool}_{domain}.md
    ├── AC_delta_{tool}_{domain}.md
    ├── PLAN_FINALIZE_{tool}_v{X}_{Y}_{Z}.md
    ├── IC_VALIDATION_{tool}_v{X}_{Y}_{Z}.md
    └── QA_{tool}_v{X}_{Y}_{Z}.md
```

### Naming Rules

| Element | In Path | In Filename |
|---------|---------|-------------|
| Version | dots: `v1.11.0` | underscores: `v1_11_0` |
| Tool | prefix: `{tool}_` | `pcc_`, `classifier_` |
| Domain | suffix: `_{domain}` | `_ui`, `_cataloging` |

**Examples:**
- Path: `docs/releases/v1.11.0/`
- File: `RELEASE_v1_11_0_classifier_initial.md`

### Tool Registration

Each tool MUST be registered in `docs/TOOLS_INDEX.md`:

```yaml
tools:
  - id: pcc
    name: Project Command Center
    overview: OVERVIEW_pcc.md
    domains: [pcc_ui, pcc_tracker]
  - id: classifier
    name: Auto Classifier
    overview: OVERVIEW_classifier.md
    domains: [classifier_cataloging]
```

---

## Backlog Management (v1.24.0)

> **Backlog is OUTSIDE workflow** — no phases, validators, or MCP tools.

**Purpose:** Capture ideas, feature requests, and plans before they become releases.

### Location & Naming

| Element | Value |
|---------|-------|
| **Location** | `docs/backlog/` |
| **Naming** | `BACKLOG_[YYYYMMDD]_[slug].md` |
| **Template** | [BACKLOG_ITEM_TEMPLATE](../../../specifications/templates/backlog/BACKLOG_ITEM_TEMPLATE.md) |
| **Skill** | `/save-to-backlog` |

### Lifecycle

```
new → in_review → accepted → converted_to_release
                ↓
            rejected
```

| Status | Description |
|--------|-------------|
| `new` | Just created, needs review |
| `in_review` | Being evaluated for implementation |
| `accepted` | Approved, waiting for slot |
| `rejected` | Will not implement (with reason) |
| `converted_to_release` | Became a release |

### Creating Backlog Items

**Option 1: Skill (recommended)**
- Use `/save-to-backlog` or trigger keywords ("сохрани в backlog", "add to backlog")
- Claude analyzes dialog, extracts problem/solution, creates file

**Option 2: Manual**
- Copy template from `specifications/templates/backlog/BACKLOG_ITEM_TEMPLATE.md`
- Fill required fields (item_id, problem_statement, created_date)

### Converting to Release

1. Update backlog item: `status: converted_to_release`, `converted_to: RELEASE_v{X}_{Y}_{Z}_{feature}`
2. Use `/new-release-auto` or `/new-feature`
3. Reference backlog item in RELEASE.md Problem Statement

---

## Progress Tracking (v2.4.0)

> **SSOT:** Release file stores workflow progress. LLM updates it, PCC reads it.

The RELEASE file contains three new fields for tracking workflow progress:

### workflow_state

Current phase and start timestamp:

```yaml
workflow_state:
  current_phase: AC_DRAFT           # Current workflow phase
  started_at: 2026-01-05T10:00:00+03:00
```

### phase_history

Audit trail of completed phases with validator results:

```yaml
phase_history:
  - phase: RELEASE
    entered_at: 2026-01-05T10:00:00+03:00
    exited_at: 2026-01-05T10:15:00+03:00
    validators:
      release_has_problem:
        status: passed              # passed | failed | skipped
        reason: null                # Explanation if failed
    skipped: false
    skip_reason: null
```

### transition_log

Record of all phase transitions with approvals:

```yaml
transition_log:
  - from: BC_DRAFT
    to: BC_APPROVED
    timestamp: 2026-01-05T11:00:00+03:00
    approval_by: user               # null if no approval required
    approval_note: "Approved via chat"
```

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  RELEASE file (YAML frontmatter) - SSOT for progress        │
│                                                              │
│  workflow_state:     # Current phase                         │
│  phase_history:      # Completed phases + validators         │
│  transition_log:     # Transitions + approvals               │
└─────────────────────────────────────────────────────────────┘
          ▲                              ▲
          │ writes                       │ reads
┌─────────────────────┐      ┌─────────────────────┐
│   Claude (LLM)      │      │   PCC Web/CLI       │
│   Primary driver    │      │   UI display        │
└─────────────────────┘      └─────────────────────┘
```

> **See:** [SYSTEM_PROMPT.md → WORKFLOW PROGRESS RECORDING](SYSTEM_PROMPT.md#workflow-progress-recording-v200)

---

## Related Documentation

- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) — P0 Rules cheatsheet
- [SYSTEM_PROMPT.md](SYSTEM_PROMPT.md) — Full specification
- [LIVING_DOCUMENTATION.md](guides/methodology/LIVING_DOCUMENTATION.md) — Delta/Domain management
