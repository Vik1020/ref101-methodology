# Maturity-Aware Methodology Design Framework

**Version:** 1.0.0
**Last Updated:** 2026-01-17
**Purpose:** Design methodologies that match organizational maturity level

---

## Overview

A methodology perfect for a Level 5 enterprise will **overwhelm** a Level 1 startup. A minimal workflow for startups will **frustrate** a Level 4 organization.

This guide provides:
1. **5-Level Maturity Model** (CMMI-inspired) with organizational characteristics
2. **6 Capability Areas** assessed across maturity levels
3. **Design Patterns** for each maturity level with concrete constraints
4. **Example Methodologies** showing real implementations
5. **Simplification Strategies** for adapting complex designs

**When to use:** After completing context assessment (see `CONTEXT_ASSESSMENT.md`)

---

## The 5-Level Maturity Model

Based on CMMI (Capability Maturity Model Integration), adapted for methodology design.

### Maturity Level Progression

```
Level 1: Ad-hoc          → "Chaos"
Level 2: Managed         → "Discipline"
Level 3: Defined         → "Standard"
Level 4: Quantitatively  → "Measured"
Level 5: Optimizing      → "Continuous"
```

Each level builds on the previous, requiring foundation before advancement.

---

## Level 1: Ad-hoc (Chaotic)

### Organizational Characteristics

| Aspect | Description |
|--------|-------------|
| **Process** | No documented processes; heroics determine success |
| **Culture** | Reactive; constant firefighting |
| **Tools** | Manual; spreadsheets, email, whiteboards |
| **Team** | Very small (<5 people); everyone does everything |
| **Success** | Depends on individual heroes, not repeatable |
| **Predictability** | None; chaos; outcomes vary wildly |

### Typical Organizations

- **Very early startups** (seed stage, pre-product-market fit)
- **Crisis mode organizations** (survival over process)
- **Proof-of-concept teams** (experimenting, not producing)

**Key Insight:** At Level 1, introducing ANY formal methodology may be premature. Focus on survival first.

### Design Constraints for Level 1

If you MUST design a methodology for Level 1 (usually not recommended):

```yaml
Methodology Complexity: ABSOLUTE MINIMUM

States:
  - Count: 3 maximum
  - Types: Initial, Working, Terminal only
  - NO Waiting states (no formal approvals)
  - NO Error recovery (fix forward in production)
  - Example: [START, WORKING, DONE]

Actors:
  - Count: 1 (everyone is this actor)
  - Types: Human only
  - NO role separation (too small)
  - Example: [team_member]

Actions:
  - Count: 2-3 (bare minimum)
  - Approval: NONE
  - Tools: Manual only
  - Example: [start_work, finish_work]

Artifacts:
  - Count: 1 (single essential artifact)
  - Format: Plain text or markdown
  - Fields: 3-5 critical fields only
  - Example: [TASK.md with: title, description, done checkbox]

Rules:
  - Count: 0-1 (optional)
  - Types: Precondition only (if any)
  - Complexity: Single boolean check
  - Example: [has_title]

Facts:
  - Count: 2-3 (minimal transitions)
  - Triggered: All manual
  - Example: [work_started, work_completed]

Process Duration: Hours (not days)
Documentation: Verbal handoffs acceptable
Training: 5-minute explanation maximum
```

### Example Level 1 Methodology: "Task Tracking"

```yaml
methodology_id: task_tracking_v1
name: "Ultra-Minimal Task Tracking"
version: 1.0.0

states:
  - id: TODO
    type: Initial
  - id: DOING
    type: Working
  - id: DONE
    type: Terminal

actors:
  - id: anyone
    type: Human

actions:
  - id: start
    actor: anyone
    tool: manual
  - id: complete
    actor: anyone
    tool: manual

artifacts:
  - id: task
    template: "# Task\n\n- [ ] Done\n\n## Description\n\n..."

rules: [] # No rules

facts:
  - id: started
    from_state: TODO
    to_state: DOING
    triggered_by: start
  - id: completed
    from_state: DOING
    to_state: DONE
    triggered_by: complete
```

**Training:** "Write task in markdown. Check box when done. That's it."

---

## Level 2: Managed (Disciplined)

### Organizational Characteristics

| Aspect | Description |
|--------|-------------|
| **Process** | Basic planning; requirements managed; projects tracked |
| **Culture** | Repeatable but reactive; discipline emerging |
| **Tools** | Basic digital tools (Jira, GitHub, Slack) |
| **Team** | Small (5-20 people); some role separation |
| **Success** | Repeatable within projects; still depends on individuals |
| **Predictability** | Low; similar projects have similar outcomes |

### Typical Organizations

- **Startups** (post-PMF, growing to Series A)
- **Small companies** transitioning from informal to formal
- **Project teams** within larger orgs

**Key Insight:** Level 2 is ready for minimal methodologies with SIMPLE workflows.

### Design Constraints for Level 2

```yaml
Methodology Complexity: MINIMAL

States:
  - Count: 3-5
  - Types: Initial, Working, Terminal, Error
  - Allow 1 Waiting state (single approval point)
  - Simple error recovery (retry or abort)
  - Example: [INIT, WORKING, REVIEW, DONE, ERROR]

Actors:
  - Count: 1-2
  - Types: Human only (not ready for AI)
  - Role separation emerging (doer + reviewer)
  - Example: [engineer, manager]

Actions:
  - Count: 3-7
  - Approval: 0-1 (single approval max)
  - Tools: Basic CLI or manual
  - Example: [start, submit_for_review, approve, reject, complete]

Artifacts:
  - Count: 1-2
  - Format: Markdown with structure
  - Fields: 5-15 fields
  - Templates: Checklists
  - Example: [RELEASE.md, CHECKLIST.md]

Rules:
  - Count: 1-5
  - Types: Preconditions only
  - Complexity: Simple boolean checks
  - Example: [has_description, has_assignee, checklist_complete]

Facts:
  - Count: 4-8
  - Triggered: Manual actions
  - Include basic branching (approve/reject)
  - Example: [started, submitted, approved, rejected, completed]

Process Duration: Days to week
Documentation: Basic templates
Training: 30-60 minutes
```

### Example Level 2 Methodology: "Simple Release Process"

```yaml
methodology_id: simple_release_v1
name: "Simple Release Process"
version: 1.0.0

states:
  - id: INIT
    type: Initial
  - id: WORKING
    type: Working
  - id: REVIEW
    type: Waiting
  - id: DONE
    type: Terminal
  - id: ERROR
    type: Error

actors:
  - id: engineer
    type: Human
  - id: manager
    type: Human

actions:
  - id: start_work
    actor: engineer
  - id: submit_review
    actor: engineer
  - id: approve
    actor: manager
  - id: reject
    actor: manager
  - id: fix_errors
    actor: engineer

artifacts:
  - id: release_notes
    template: |
      # Release v{version}

      ## Changes
      - [ ] Change 1
      - [ ] Change 2

      ## Checklist
      - [ ] Code complete
      - [ ] Tests pass
      - [ ] Manager approved

rules:
  - id: must_have_changes
    type: Precondition
    applies_to: submit_review
    condition: "changes list not empty"

facts:
  - from_state: INIT
    to_state: WORKING
    triggered_by: start_work
  - from_state: WORKING
    to_state: REVIEW
    triggered_by: submit_review
  - from_state: REVIEW
    to_state: DONE
    triggered_by: approve
  - from_state: REVIEW
    to_state: WORKING
    triggered_by: reject
  - from_state: WORKING
    to_state: ERROR
    triggered_by: error_occurred
  - from_state: ERROR
    to_state: WORKING
    triggered_by: fix_errors
```

**Training:** 30-minute session: "How to create release, submit for review, handle feedback."

---

## Level 3: Defined (Standardized)

### Organizational Characteristics

| Aspect | Description |
|--------|-------------|
| **Process** | Processes documented, standardized across organization |
| **Culture** | Proactive; processes followed consistently |
| **Tools** | Integrated toolchain (CI/CD, automated testing) |
| **Team** | Medium (20-100 people); defined roles |
| **Success** | Processes tailored from org standards; measured |
| **Predictability** | Medium-high; consistent results |

### Typical Organizations

- **Scale-ups** (Series B/C, rapid growth)
- **Mid-size companies** (50-200 people)
- **Mature product teams** within enterprises

**Key Insight:** Level 3 can handle MODERATE complexity with branching and semi-automation.

### Design Constraints for Level 3

```yaml
Methodology Complexity: MODERATE

States:
  - Count: 5-8
  - Types: All types including multiple Waiting states
  - Branching allowed (parallel paths)
  - Error recovery with retry logic
  - Example: [INIT, PLANNING, DEV, CODE_REVIEW, QA, STAGING, PROD, ERROR]

Actors:
  - Count: 3-5
  - Types: Human + AI (introduce AI actors)
  - Role separation clear (PM, Dev, QA, Reviewer)
  - Example: [pm, engineer, qa_lead, ai_reviewer, deploy_bot]

Actions:
  - Count: 8-15
  - Approval: 1-2 stages
  - Tools: MCP servers, APIs, CLI
  - Semi-automated (mix of manual + automated)
  - Example: [create_plan, code, request_review, ai_review, manual_review, test, deploy]

Artifacts:
  - Count: 3-6
  - Format: Structured (YAML/JSON)
  - Fields: 15-40 fields
  - Templates: Detailed schemas
  - Example: [PLAN.md, CODE_CHANGES.yaml, TEST_REPORT.json, DEPLOY_LOG.md]

Rules:
  - Count: 5-15
  - Types: Precondition, Postcondition, Invariant
  - Complexity: Conditional logic (if/then)
  - Example: [plan_approved, tests_pass, code_review_done, no_critical_bugs, qa_signoff]

Facts:
  - Count: 10-15
  - Triggered: Mix of manual + automated
  - Include branching and parallel transitions
  - Example: [planned, coded, review_requested, ai_reviewed, approved, rejected, tested, deployed]

Process Duration: Weeks
Documentation: Comprehensive guides
Training: Half-day workshop
```

### Example Level 3 Methodology: "Feature Release Workflow"

```yaml
methodology_id: feature_release_v2
name: "Feature Release Workflow"
version: 2.0.0

states:
  - id: PLANNING
    type: Working
  - id: DEVELOPMENT
    type: Working
  - id: CODE_REVIEW
    type: Waiting
  - id: QA_TESTING
    type: Working
  - id: STAGING
    type: Waiting
  - id: PRODUCTION
    type: Terminal
  - id: ERROR
    type: Error

actors:
  - id: pm
    type: Human
  - id: engineer
    type: Human
  - id: qa_lead
    type: Human
  - id: ai_reviewer
    type: AI
    tools: [code_analysis_mcp]
  - id: deploy_bot
    type: System
    tools: [github_actions]

actions:
  - id: create_plan
    actor: pm
  - id: start_development
    actor: engineer
  - id: submit_code_review
    actor: engineer
  - id: run_ai_review
    actor: ai_reviewer
    tool: code_analysis_mcp
  - id: manual_code_review
    actor: pm
  - id: run_tests
    actor: qa_lead
  - id: deploy_staging
    actor: deploy_bot
  - id: approve_production
    actor: pm
  - id: deploy_production
    actor: deploy_bot

artifacts:
  - id: feature_plan
    template: |
      # Feature Plan

      ## Problem Statement
      ...

      ## Solution Overview
      ...

      ## Success Criteria
      ...

  - id: code_changes
    format: yaml
    schema: |
      files_changed: []
      lines_added: int
      lines_removed: int
      complexity_score: float

  - id: test_report
    format: json
    schema: |
      {
        "tests_run": int,
        "tests_passed": int,
        "coverage": float,
        "critical_bugs": int
      }

rules:
  - id: plan_must_exist
    type: Precondition
    applies_to: start_development
    condition: "feature_plan artifact exists"

  - id: ai_review_required
    type: Precondition
    applies_to: manual_code_review
    condition: "ai_reviewer has completed review"

  - id: tests_must_pass
    type: Precondition
    applies_to: deploy_staging
    condition: "test_report.tests_passed == test_report.tests_run"

  - id: no_critical_bugs
    type: Precondition
    applies_to: approve_production
    condition: "test_report.critical_bugs == 0"

  - id: qa_signoff
    type: Precondition
    applies_to: deploy_production
    condition: "qa_lead has approved staging"

facts:
  - from_state: PLANNING
    to_state: DEVELOPMENT
    triggered_by: start_development

  - from_state: DEVELOPMENT
    to_state: CODE_REVIEW
    triggered_by: submit_code_review

  - from_state: CODE_REVIEW
    to_state: QA_TESTING
    triggered_by: manual_code_review
    guard: "manual_code_review.approved == true"

  - from_state: CODE_REVIEW
    to_state: DEVELOPMENT
    triggered_by: manual_code_review
    guard: "manual_code_review.approved == false"

  - from_state: QA_TESTING
    to_state: STAGING
    triggered_by: deploy_staging
    guard: "tests_must_pass"

  - from_state: STAGING
    to_state: PRODUCTION
    triggered_by: deploy_production
    guard: "qa_signoff AND no_critical_bugs"

  - from_state: [DEVELOPMENT, QA_TESTING, STAGING]
    to_state: ERROR
    triggered_by: error_occurred
```

**Training:** Half-day workshop covering planning, development, review, QA, deployment.

---

## Level 4: Quantitatively Managed (Measured)

### Organizational Characteristics

| Aspect | Description |
|--------|-------------|
| **Process** | Processes measured and controlled using metrics |
| **Culture** | Data-driven decisions; continuous monitoring |
| **Tools** | Advanced DevOps (GitOps, IaC, monitoring, dashboards) |
| **Team** | Large (100-500 people); specialized roles |
| **Success** | Statistically predictable; quantitative targets |
| **Predictability** | High; process performance understood and controlled |

### Typical Organizations

- **Enterprises** (established companies, 500-5000 people)
- **Public companies** (quarterly reporting requirements)
- **Regulated industries** (finance, healthcare, government)

**Key Insight:** Level 4 requires COMPREHENSIVE governance with full automation and metrics.

### Design Constraints for Level 4

```yaml
Methodology Complexity: COMPREHENSIVE

States:
  - Count: 8-15
  - Types: All types including parallel branches
  - Complex flows (rollback, compensation, saga patterns)
  - SLA tracking per state
  - Example: Full 8-phase workflow + compliance gates

Actors:
  - Count: 5-10
  - Types: Human + AI + System with RBAC
  - Specialized roles (security, compliance, architect)
  - Example: [po, architect, dev, sec_lead, compliance, qa, ai_agent, sast_tool, deploy_bot]

Actions:
  - Count: 15-30
  - Approval: 2-4 stages (multi-level governance)
  - Tools: Full MCP integration, custom tools
  - Mostly automated with manual overrides
  - Example: [create_rfc, security_review, threat_model, code, sast_scan, pen_test, deploy_canary, monitor, rollback]

Artifacts:
  - Count: 8-15
  - Format: Complex schemas with validation
  - Fields: 50-100+ fields
  - Living documents (updated automatically)
  - Example: [RFC, THREAT_MODEL, BC_ANALYSIS, CODE, SECURITY_REPORT, COMPLIANCE_CERT, METRICS_DASHBOARD]

Rules:
  - Count: 15-30
  - Types: All types (Pre, Post, Invariant, Guard, Compensation)
  - Complexity: Complex predicates, external API checks
  - Example: [rfc_approved, security_cleared, pen_test_passed, compliance_verified, canary_healthy, sla_met]

Facts:
  - Count: 20-30
  - Triggered: Mostly automated, manual for strategic decisions
  - Include compensation flows (rollback mechanisms)
  - Metrics: Track duration, error rate, approval time per fact

Process Duration: Weeks to months
Documentation: Comprehensive with examples, videos
Training: Multi-day certification program
```

### Example Level 4 Methodology: "Enterprise Release with Compliance"

*(Simplified for brevity - real Level 4 would be 500+ lines)*

```yaml
methodology_id: enterprise_release_v4
name: "Enterprise Release with Compliance"
version: 4.0.0

states:
  - id: RFC
    type: Working
  - id: SECURITY_REVIEW
    type: Waiting
  - id: BC_ANALYSIS
    type: Working
  - id: ARCHITECTURE_DESIGN
    type: Waiting
  - id: DEVELOPMENT
    type: Working
  - id: CODE_REVIEW
    type: Waiting
  - id: SAST_SCAN
    type: Working
  - id: QA_TESTING
    type: Working
  - id: COMPLIANCE_CHECK
    type: Waiting
  - id: STAGING
    type: Working
  - id: CANARY_DEPLOY
    type: Working
  - id: PRODUCTION
    type: Terminal
  - id: ROLLBACK
    type: Working
  - id: ERROR
    type: Error

actors:
  - id: product_owner
    type: Human
    permissions: [create_rfc, approve_production]
  - id: security_lead
    type: Human
    permissions: [security_review, approve_security]
  - id: compliance_officer
    type: Human
    permissions: [compliance_check, approve_compliance]
  - id: architect
    type: Human
    permissions: [architecture_review, approve_design]
  - id: engineer
    type: Human
    permissions: [develop, submit_review]
  - id: qa_automation
    type: System
    tools: [selenium, pytest, k6]
  - id: sast_tool
    type: System
    tools: [snyk, sonarqube]
  - id: ai_reviewer
    type: AI
    tools: [code_analysis_mcp]
  - id: deploy_bot
    type: System
    tools: [github_actions, spinnaker]

# ... 30+ actions, 15+ artifacts, 25+ rules, 30+ facts omitted for brevity ...

# Key Rules at Level 4:

rules:
  - id: rfc_approved_by_committee
    type: Precondition
    applies_to: start_security_review
    condition: "rfc.approvals >= 3 AND rfc.quorum_met"

  - id: security_scan_passed
    type: Precondition
    applies_to: proceed_to_qa
    condition: "sast_report.critical_vulnerabilities == 0 AND pen_test.status == 'PASSED'"

  - id: compliance_verified
    type: Precondition
    applies_to: deploy_staging
    condition: "compliance_cert.valid AND gdpr_check.passed AND sox_audit.signed"

  - id: canary_healthy
    type: Invariant
    maintains: "canary_deploy state"
    condition: "metrics.error_rate < 0.01 AND metrics.latency_p99 < 200ms"
    compensation: "trigger automatic rollback if violated"

  - id: audit_trail_complete
    type: Postcondition
    applies_to: deploy_production
    condition: "all artifacts signed AND approval_chain documented AND metrics_baseline recorded"

# Compensation (Rollback) Rules:

  - id: automatic_rollback
    type: Compensation
    triggers: "canary_healthy invariant violated"
    actions: [rollback_canary, notify_oncall, create_incident]

  - id: manual_rollback
    type: Compensation
    triggers: "production_error_rate > 5%"
    actions: [pause_traffic, rollback_production, escalate_to_director]
```

**Training:** Multi-day certification with modules on RFC process, security reviews, compliance requirements, canary deployments, incident response.

---

## Level 5: Optimizing (Continuous Improvement)

### Organizational Characteristics

| Aspect | Description |
|--------|-------------|
| **Process** | Continuous process improvement; innovation embedded |
| **Culture** | Kaizen; experimentation; learning organization |
| **Tools** | Self-healing systems; AI-optimized; predictive analytics |
| **Team** | Very large (500+ people) or highly mature |
| **Success** | Industry-leading; continuous innovation |
| **Predictability** | Very high + proactive risk management |

### Typical Organizations

- **Tech giants** (FAANG-level maturity)
- **Industry leaders** (defining best practices)
- **Research-driven orgs** (continuous experimentation)

**Key Insight:** Level 5 is SELF-IMPROVING with AI-native workflows and automated optimization.

### Design Constraints for Level 5

```yaml
Methodology Complexity: SOPHISTICATED + SELF-IMPROVING

States:
  - Count: 10-20 (dynamic, can add/remove based on data)
  - Types: All types + experimental states
  - Adaptive flows (A/B testing different paths)
  - Predictive routing (AI chooses optimal path)
  - Example: Standard flow + multiple experimental variants

Actors:
  - Count: 10-20+ (dynamic actor allocation)
  - Types: AI-native (AI actors primary, humans for strategic decisions)
  - Self-organizing teams (actors collaborate autonomously)
  - Example: [ai_coordinator, human_approver, ml_optimizer, security_ai, compliance_ai, ...]

Actions:
  - Count: 30-50+ (fully automated where possible)
  - Approval: Minimal (AI-approved with human oversight)
  - Tools: Full AI integration, predictive tools
  - Self-optimizing (actions adapt based on outcomes)
  - Example: [ai_generate_rfc, ai_security_scan, ai_suggest_architecture, human_approve_strategy, ...]

Artifacts:
  - Count: 15-30+ (living, self-updating documents)
  - Format: AI-generated, multi-modal (code, docs, dashboards)
  - Fields: Dynamic (adapt based on context)
  - Real-time validation
  - Example: [AI_GENERATED_RFC, PREDICTIVE_MODEL, REAL_TIME_METRICS, AUTO_UPDATED_DOCS]

Rules:
  - Count: 30-50+ (adaptive rules)
  - Types: All types + predictive rules
  - Complexity: Machine learning models, external AI
  - Self-tuning (rules optimize based on outcomes)
  - Example: [ml_model_predicts_success >80%, ai_detects_anomaly, predictive_rollback_before_failure]

Facts:
  - Count: 40+ (comprehensive event tracking)
  - Triggered: AI-driven, predictive
  - Include feedback loops (facts influence future routing)
  - Real-time metrics: Sub-second granularity

Process Duration: Continuous (releases on-demand)
Documentation: AI-generated, personalized per role
Training: Self-paced, AI-tutored, continuous
```

**Note:** Level 5 is aspirational for most organizations. Design focuses on continuous optimization and AI-driven workflows.

---

## The 6 Capability Areas

Each maturity level is evaluated across 6 capability areas:

### 1. Process Documentation (20% weight)

| Level | Capability |
|-------|------------|
| L1 | No documentation; tribal knowledge only |
| L2 | Basic checklists; inconsistent usage |
| L3 | Processes documented; teams follow consistently |
| L4 | Living documentation; metrics tracked; regular updates |
| L5 | Self-updating docs; AI-generated; personalized per user |

**Impact on Design:**
- L1-2: Use simple markdown checklists (< 10 fields)
- L3: Structured templates (YAML/JSON, 15-40 fields)
- L4-5: Complex schemas with validation (50-100+ fields)

---

### 2. Tool Automation (25% weight)

| Level | Capability |
|-------|------------|
| L1 | Manual (spreadsheets, email, whiteboards) |
| L2 | Basic CI/CD; manual approvals; scripted tasks |
| L3 | Automated testing; semi-automated deployment; MCP servers |
| L4 | GitOps; IaC; automated gates; monitoring dashboards |
| L5 | Self-healing systems; AI optimization; predictive automation |

**Impact on Design:**
- L1-2: Human actors only; manual actions
- L3: Mix of Human + AI actors; semi-automated
- L4-5: System + AI actors dominate; humans for strategic decisions

---

### 3. Quality Assurance (20% weight)

| Level | Capability |
|-------|------------|
| L1 | No testing; fix in production |
| L2 | Manual testing; QA reviews before release |
| L3 | Automated unit tests; code review required |
| L4 | Integration + E2E tests; coverage >80%; SAST/DAST |
| L5 | Property-based tests; formal verification; AI test generation |

**Impact on Design:**
- L1-2: No QA phase; fix errors as they occur
- L3: Add QA_TESTING state; manual + automated tests
- L4-5: Multiple QA gates (SAST, DAST, pen-test, compliance)

---

### 4. Governance & Compliance (15% weight)

| Level | Capability |
|-------|------------|
| L1 | No governance; full access for all |
| L2 | Basic access control; manual approvals |
| L3 | Defined workflows; audit logs; RBAC emerging |
| L4 | Automated compliance checks; real-time monitoring; SOC2/GDPR |
| L5 | Predictive compliance; proactive risk management; AI-driven governance |

**Impact on Design:**
- L1-2: No approval workflows; single-stage max
- L3: 1-2 approval stages; basic RBAC
- L4-5: Multi-stage approvals (3-5 stages); comprehensive RBAC

---

### 5. Metrics & Analytics (15% weight)

| Level | Capability |
|-------|------------|
| L1 | No metrics collected |
| L2 | Basic metrics (cycle time, error rate); manual tracking |
| L3 | Dashboards; weekly reviews; automated collection |
| L4 | Real-time metrics; automated alerts; SLA tracking |
| L5 | Predictive analytics; AI insights; anomaly detection |

**Impact on Design:**
- L1-2: No metrics artifacts
- L3: Add metrics collection (cycle time, error rate)
- L4-5: Comprehensive metrics (SLA, p99 latency, ROI, predictive models)

---

### 6. Change Management (5% weight)

| Level | Capability |
|-------|------------|
| L1 | No change process; deploy and pray |
| L2 | Announce changes; hope for best; manual rollback |
| L3 | Change process defined; training provided; documented rollback |
| L4 | Impact analysis; automated rollback; canary deployments |
| L5 | Predictive change impact; feature flags; instant rollback |

**Impact on Design:**
- L1-2: No rollback mechanism; forward-only
- L3: Add ERROR state with manual recovery
- L4-5: Comprehensive rollback (ROLLBACK state, compensation rules)

---

## Simplification Strategies

When adapting a complex methodology for lower maturity:

### Strategy 1: Skip Optional Phases

**When:** Level 1-2 organizations

| Phase to Skip | Reason | Alternative |
|---------------|--------|-------------|
| PLAN_FINALIZE | No strategic planning capacity | Do minimal planning in INIT |
| BC_ANALYSIS | No business analysts | Assume changes needed; skip analysis |
| SECURITY_REVIEW | No security team | Rely on engineer judgment |
| COMPLIANCE_CHECK | No compliance requirements | Skip entirely |

**Example:**
- Full workflow (L4): RFC → BC → AC → PLAN → DESIGN → DEV → REVIEW → QA → COMPLIANCE → STAGING → PROD (11 states)
- Simplified (L2): INIT → DEV → REVIEW → DONE (4 states)

---

### Strategy 2: Reduce Approvals

**When:** Collaborative culture, high trust

| Original Approvals | Simplified |
|--------------------|------------|
| Tech Lead → Director → VP → Exec (4 stages) | Tech Lead only (1 stage) |
| Security → Compliance → Legal (3 stages) | Security only (1 stage) |

**Example:**
```yaml
# L4: 3 approval stages
rules:
  - tech_lead_approved
  - security_approved
  - compliance_approved

# L2: 1 approval stage
rules:
  - manager_approved
```

---

### Strategy 3: Defer Artifacts

**When:** Low documentation maturity

| Artifact | L4 (required) | L2 (deferred) |
|----------|---------------|---------------|
| BC_ANALYSIS | Detailed business case (50+ fields) | Defer to later maturity |
| THREAT_MODEL | Security threat analysis | Defer; rely on SAST tools |
| COMPLIANCE_CERT | Signed compliance certificate | Not applicable |

**Keep only essential artifacts:**
- RELEASE.md (always)
- CODE_CHANGES (if using Git)
- TEST_REPORT (if testing exists)

---

### Strategy 4: Manual First

**When:** Low automation level

| Action | L4 (automated) | L2 (manual) |
|--------|----------------|-------------|
| Security scan | SAST tool (System actor) | Engineer reviews code (Human actor) |
| Deploy | deploy_bot (System actor) | Engineer runs deploy script (Human actor) |
| Metrics collection | Automated (System actor) | Engineer manually records metrics |

**Principle:** Start manual, automate incrementally as maturity grows.

---

### Strategy 5: Incremental Validators

**When:** Early adoption phase

| Validators | L4 (comprehensive) | L2 (incremental) |
|------------|-------------------|------------------|
| P0 (critical) | ✅ Implement immediately | ✅ Implement immediately |
| P1 (high) | ✅ Implement immediately | ⏳ Add after 3 successful releases |
| P2 (medium) | ✅ Implement immediately | ⏳ Add after 6 months |
| P3 (low) | ✅ Implement immediately | ❌ Skip indefinitely |

**Example:**
```yaml
# Phase 1: P0 only
rules:
  - has_title
  - has_description

# Phase 2: P0 + P1
rules:
  - has_title
  - has_description
  - tests_exist
  - code_reviewed

# Phase 3: P0 + P1 + P2
rules:
  - has_title
  - has_description
  - tests_exist
  - code_reviewed
  - security_scanned
  - metrics_collected
```

---

## Maturity Assessment Worksheet

Use this worksheet to determine your organization's maturity level across 6 capability areas.

### Scoring

For each capability area, rate 1-5:
- 1 = Level 1 (Ad-hoc)
- 2 = Level 2 (Managed)
- 3 = Level 3 (Defined)
- 4 = Level 4 (Quantitatively Managed)
- 5 = Level 5 (Optimizing)

**Be honest.** Most organizations are Level 2-3. Very few reach Level 5.

| Capability Area | Your Score (1-5) | Weight | Weighted Score |
|-----------------|------------------|--------|----------------|
| Process Documentation | ___ | 20% | ___ × 0.20 |
| Tool Automation | ___ | 25% | ___ × 0.25 |
| Quality Assurance | ___ | 20% | ___ × 0.20 |
| Governance & Compliance | ___ | 15% | ___ × 0.15 |
| Metrics & Analytics | ___ | 15% | ___ × 0.15 |
| Change Management | ___ | 5% | ___ × 0.05 |
| **Total Maturity Score** | | **100%** | **___** |

### Interpreting Your Score

| Score | Maturity Level | Recommendation |
|-------|----------------|----------------|
| 1.0-1.5 | Level 1 (Ad-hoc) | Defer methodology OR use absolute minimum (3 states, 1 actor) |
| 1.6-2.5 | Level 2 (Managed) | Use minimal methodology (4-5 states, 2 actors, simple workflow) |
| 2.6-3.5 | Level 3 (Defined) | Use standard methodology (6-8 states, 4-5 actors, semi-automated) |
| 3.6-4.5 | Level 4 (Quantitatively) | Use enterprise methodology (10-15 states, 8-10 actors, highly automated) |
| 4.6-5.0 | Level 5 (Optimizing) | Use advanced methodology (15+ states, AI-native, self-optimizing) |

**Example:**
```
Process Documentation: 3
Tool Automation: 2
Quality Assurance: 3
Governance: 2
Metrics: 2
Change Management: 3

Weighted Average: (3×0.20) + (2×0.25) + (3×0.20) + (2×0.15) + (2×0.15) + (3×0.05)
                = 0.60 + 0.50 + 0.60 + 0.30 + 0.30 + 0.15
                = 2.45

Result: Level 2 (Managed) → Use minimal methodology
```

---

## Next Steps

After determining your maturity level:

1. **Use appropriate design patterns** from this guide for your level
2. **Apply simplification strategies** if adapting from higher-level design
3. **Plan incremental evolution** using `INCREMENTAL_DESIGN.md`
4. **Select adaptation patterns** from `ADAPTATION_PATTERNS.md` for your context
5. **Create your methodology** following constraints for your maturity level

---

## References

- **Context Assessment:** `CONTEXT_ASSESSMENT.md`
- **Incremental Design:** `INCREMENTAL_DESIGN.md`
- **Adaptation Patterns:** `ADAPTATION_PATTERNS.md`
- **Decision Trees:** `DESIGN_DECISIONS.md`
- **Quick Start:** `README.md`

---

**Version History:**
- 1.0.0 (2026-01-17): Initial release with 5-level CMMI-inspired maturity model
