# Meta-Methodology Process Catalog

**Version:** 1.0.0
**Last Updated:** 2026-01-17
**Total Processes:** 20

---

## Quick Reference

| Process ID | Group | Type | When to Use |
|------------|-------|------|-------------|
| methodology_creation | LIFECYCLE | wizard | Creating new methodology |
| methodology_migration | LIFECYCLE | transformation | Upgrading methodology version |
| methodology_evolution | LIFECYCLE | incremental | Adding features to methodology |
| methodology_deprecation | LIFECYCLE | sunset | Retiring old methodology |
| methodology_validation | QA | static_analysis | Before deployment |
| methodology_testing | QA | runtime_testing | After changes |
| methodology_audit | QA | compliance | Quarterly reviews |
| methodology_metrics_collection | EFFECTIVENESS | monitoring | Continuous |
| methodology_performance_analysis | EFFECTIVENESS | analytics | Monthly/Quarterly |
| methodology_roi_calculation | EFFECTIVENESS | business_analytics | Budget planning |
| methodology_retrospective | EFFECTIVENESS | learning | Quarterly |
| methodology_approval_workflow | GOVERNANCE | approval | Before production |
| methodology_compliance_check | GOVERNANCE | compliance | Pre-deployment gate |
| methodology_access_control | GOVERNANCE | security | Setup/changes |
| methodology_bottleneck_detection | OPTIMIZATION | analytics | After performance analysis |
| methodology_improvement_proposal | OPTIMIZATION | rfc | Proposing changes |
| methodology_automation_opportunities | OPTIMIZATION | ai_analysis | Semi-annual |
| methodology_tool_integration | INTEGRATION | integration | Connecting tools |
| methodology_cross_reference | INTEGRATION | coordination | Multi-methodology workflows |
| methodology_governance_master | MANAGEMENT | orchestration | Coordinating all groups |

---

## GROUP 1: LIFECYCLE

### 1. methodology_creation

**Type:** wizard
**Version:** 1.0.0
**File:** `processes/methodology_creation.json`

**Description:**
Create new methodologies through 8-phase wizard: Basics → Entity → States → Facts → Workforce → Actions → Rules → Validation.

**Phases:**
1. CONCEPTION - Define basics
2. ENTITY_DESIGN - Define entity schema
3. STATES_DESIGN - Define states
4. FACTS_DESIGN - Define facts (transitions)
5. WORKFORCE_DESIGN - Define actors and tools
6. ACTIONS_DESIGN - Define actions
7. RULES_DESIGN - Define rules
8. VALIDATION - Validate (L1/L2/L3)
9. COMPLETE / ERROR

**Inputs:**
- Domain description
- Problem statement
- Business requirements

**Outputs:**
- `methodology.yaml`
- `validation_report.md`

**When to use:**
- Creating your first methodology
- Designing a new process from scratch
- Learning the 8-element model

**Frequency:** On-demand

---

### 2. methodology_migration

**Type:** transformation
**Version:** 1.0.0
**File:** `processes/methodology_migration.json`

**Description:**
Migrate existing methodologies to new meta-methodology version with breaking changes.

**Phases:**
1. INIT
2. ANALYZE_CURRENT
3. MAP_CHANGES
4. TRANSFORM
5. VALIDATE
6. COMPLETE

**Inputs:**
- Old methodology.yaml (v1.x)
- Migration guide

**Outputs:**
- New methodology.yaml (v2.x)
- Migration report

**When to use:**
- Meta-methodology version upgrade
- Schema breaking changes
- Namespace restructuring

**Frequency:** Major version upgrades only

---

### 3. methodology_evolution

**Type:** incremental
**Version:** 1.0.0
**File:** `processes/methodology_evolution.json`

**Description:**
Evolve methodologies incrementally: add states, actions, tools without breaking changes.

**Phases:**
1. INIT
2. IDENTIFY_CHANGES
3. IMPLEMENT
4. VALIDATE
5. COMPLETE

**Inputs:**
- Existing methodology.yaml
- Evolution proposal

**Outputs:**
- Updated methodology.yaml
- Changelog

**When to use:**
- Adding new features
- Extending capabilities
- Non-breaking improvements

**Frequency:** Monthly/Quarterly

---

### 4. methodology_deprecation

**Type:** sunset
**Version:** 1.0.0
**File:** `processes/methodology_deprecation.json`

**Description:**
Controlled deprecation and archival of methodologies no longer in use.

**Phases:**
1. INIT
2. DEPRECATION_NOTICE (90d warning)
3. MIGRATION_PLAN
4. GRACE_PERIOD (90d wait)
5. ARCHIVE
6. COMPLETE

**Inputs:**
- Methodology to deprecate
- Migration target (optional)

**Outputs:**
- `archived/{methodology_id}/`
- Deprecation notice

**When to use:**
- Methodology no longer needed
- Consolidating similar methodologies
- Compliance requirement to archive

**Frequency:** Annually or as needed

---

## GROUP 2: QA

### 5. methodology_validation

**Type:** static_analysis
**Version:** 1.0.0
**File:** `processes/methodology_validation.json`

**Description:**
Three-level validation: L1 (schema), L2 (referential integrity), L3 (static analysis).

**Validation Levels:**
- **L1:** Required fields, patterns, enums
- **L2:** Fact→State links, Action→Actor links, Artifact→Action links
- **L3:** Reachability, deadlocks, termination

**Inputs:**
- methodology.yaml

**Outputs:**
- validation_report.md
- Status: VALID | INVALID | WARNINGS

**When to use:**
- Before every deployment
- After editing methodology.yaml
- CI/CD validation gate

**Frequency:** Continuous (before commits)

---

### 6. methodology_testing

**Type:** runtime_testing
**Version:** 1.0.0
**File:** `processes/methodology_testing.json`

**Description:**
Execute test scenarios: happy path, error path, edge cases (timeouts, retries, compensation).

**Test Categories:**
- **Happy path:** Initial → Terminal with no errors
- **Error path:** Trigger error states and recovery
- **Edge cases:** Timeouts, guards, complex Rules

**Inputs:**
- methodology.yaml
- Test scenarios

**Outputs:**
- test_report.md
- Coverage metrics

**When to use:**
- After significant changes
- Before production deployment
- Quarterly QA reviews

**Frequency:** Before releases

---

### 7. methodology_audit

**Type:** compliance
**Version:** 1.0.0
**File:** `processes/methodology_audit.json`

**Description:**
Periodic audit: compliance, governance, access controls, approval records.

**Audit Checks:**
- **Compliance:** No schema violations, required artifacts present
- **Governance:** Approval workflows followed, change history complete
- **Quality:** Validation passing, test coverage >= 80%

**Inputs:**
- methodology.yaml
- Approval records
- Change history

**Outputs:**
- audit_report.md
- Compliance score (0-100)

**When to use:**
- Quarterly compliance reviews
- Security audits
- SOC2/HIPAA/GDPR requirements

**Frequency:** Quarterly

---

## GROUP 3: EFFECTIVENESS

### 8. methodology_metrics_collection

**Type:** monitoring
**Version:** 1.0.0
**File:** `processes/methodology_metrics_collection.json`

**Description:**
Collect Facts from running releases to calculate effectiveness metrics.

**Metrics Collected:**
- Cycle Time (avg, median, p90)
- Error Rate (%)
- Timeout Rate (%)
- Human Intervention Rate (%)

**Inputs:**
- Entity.history from releases
- Facts with timestamps

**Outputs:**
- `metrics/{methodology_id}/{period}.json`

**When to use:**
- After every release (continuous)
- Daily aggregation
- Feeding performance analysis

**Frequency:** Continuous

---

### 9. methodology_performance_analysis

**Type:** analytics
**Version:** 1.0.0
**File:** `processes/methodology_performance_analysis.json`

**Description:**
Analyze collected metrics: trends, bottlenecks, comparisons vs targets.

**Analysis Types:**
- **Trend analysis:** Improving/degrading over time
- **Bottleneck detection:** Which states cause delays
- **Comparison:** Current vs target vs previous period

**Inputs:**
- Metrics from methodology_metrics_collection

**Outputs:**
- performance_report.md

**When to use:**
- Monthly or quarterly reviews
- After metrics collection
- Before optimization

**Frequency:** Monthly/Quarterly

---

### 10. methodology_roi_calculation

**Type:** business_analytics
**Version:** 1.0.0
**File:** `processes/methodology_roi_calculation.json`

**Description:**
Calculate Return on Investment: time saved, error reduction, cost savings.

**ROI Formula:**
```
ROI = (Benefits - Costs) / Costs × 100%
```

**Costs:**
- Development, training, tooling, maintenance

**Benefits:**
- Time saved, errors prevented, quality improvements

**Inputs:**
- Baseline (before methodology)
- Current metrics
- Cost data

**Outputs:**
- roi_report.md
- ROI %, payback period, NPV

**When to use:**
- Business case justification
- Budget planning
- Quarterly business reviews

**Frequency:** Quarterly

---

### 11. methodology_retrospective

**Type:** learning
**Version:** 1.0.0
**File:** `processes/methodology_retrospective.json`

**Description:**
Team retrospective: what worked, what didn't, lessons learned. Qualitative insights.

**Retrospective Formats:**
- Start/Stop/Continue
- Mad/Sad/Glad
- Sailboat (wind/anchor/rocks)

**Inputs:**
- Metrics
- Team feedback
- Incidents

**Outputs:**
- retrospective_notes.md
- Action items
- Improvement proposals

**When to use:**
- End of quarter
- After major releases
- Learning cycles

**Frequency:** Quarterly

---

## GROUP 4: GOVERNANCE

### 12. methodology_approval_workflow

**Type:** approval
**Version:** 1.0.0
**File:** `processes/methodology_approval_workflow.json`

**Description:**
Multi-stage approval: technical review, business review, committee (optional).

**Approval Stages:**
1. TECHNICAL_REVIEW (3d timeout)
2. BUSINESS_REVIEW (3d timeout)
3. COMMITTEE_REVIEW (7d timeout, 50% quorum, optional)

**Inputs:**
- Approval package (methodology.yaml, validation report, test results)

**Outputs:**
- approval_record.json
- Decision: APPROVED | REJECTED

**When to use:**
- New methodology deployment
- Major version changes
- Enterprise governance

**Frequency:** Before production deployments

---

### 13. methodology_compliance_check

**Type:** compliance
**Version:** 1.0.0
**File:** `processes/methodology_compliance_check.json`

**Description:**
Automated compliance: security, privacy, regulatory (SOC2, GDPR, HIPAA).

**Compliance Policies:**
- **Security:** No secrets, RBAC configured, audit logging
- **Privacy:** PII handling, data retention, consent
- **Regulatory:** SOC2, GDPR, HIPAA requirements

**Inputs:**
- methodology.yaml
- Compliance policies

**Outputs:**
- compliance_report.md
- Status: COMPLIANT | NON_COMPLIANT

**When to use:**
- Pre-deployment gate
- Weekly automated scans
- Regulatory audits

**Frequency:** Continuous (gates) or Weekly

---

### 14. methodology_access_control

**Type:** security
**Version:** 1.0.0
**File:** `processes/methodology_access_control.json`

**Description:**
RBAC for methodologies: define roles, permissions, assign users, enforce access.

**Default Roles:**
- **Viewer:** Read-only
- **Editor:** Read + Write
- **Approver:** Read + Approve
- **Owner:** Read + Write + Approve + Deploy
- **Admin:** Full control including RBAC

**Inputs:**
- Role definitions
- User assignments

**Outputs:**
- rbac_config.json

**When to use:**
- Initial methodology setup
- Access policy changes
- Security reviews

**Frequency:** Setup + changes

---

## GROUP 5: OPTIMIZATION

### 15. methodology_bottleneck_detection

**Type:** analytics
**Version:** 1.0.0
**File:** `processes/methodology_bottleneck_detection.json`

**Description:**
Analyze metrics to identify bottlenecks: slow states, high timeouts, excessive manual work.

**Bottleneck Types:**
- **Slow state:** p90 duration > 2x median
- **High timeout:** timeout rate > 10%
- **High human intervention:** > 50%

**Inputs:**
- Metrics from metrics_collection

**Outputs:**
- bottleneck_report.md
- Ranked by severity × impact

**When to use:**
- After performance_analysis
- Monthly optimization reviews
- When cycle time degrading

**Frequency:** Monthly

---

### 16. methodology_improvement_proposal

**Type:** rfc
**Version:** 1.0.0
**File:** `processes/methodology_improvement_proposal.json`

**Description:**
RFC-style improvement proposals based on bottlenecks or new insights.

**Proposal Sections:**
- Problem statement (with data)
- Solution (proposed changes)
- Impact (performance improvement, breaking changes, migration)
- Implementation plan

**Inputs:**
- Bottleneck report
- Retrospective insights

**Outputs:**
- `proposals/{proposal_id}.md`
- implementation_record.json

**When to use:**
- After bottleneck_detection
- After retrospectives
- Ad-hoc insights

**Frequency:** As needed

---

### 17. methodology_automation_opportunities

**Type:** ai_analysis
**Version:** 1.0.0
**File:** `processes/methodology_automation_opportunities.json`

**Description:**
AI-powered analysis to identify automation: manual → automated, approvals → rules, tasks → tools.

**Automation Patterns:**
- **Manual to automated:** Human action → AI agent or API
- **Approval to rule:** High-approval-rate step → automated Rule
- **Tool integration:** Manual data entry → MCP/API integration

**Inputs:**
- methodology.yaml
- Metrics (action durations)

**Outputs:**
- automation_recommendations.md
- ROI estimates per opportunity

**When to use:**
- Semi-annual optimization
- After bottleneck_detection
- Cost reduction initiatives

**Frequency:** Semi-annual

---

## GROUP 6: INTEGRATION

### 18. methodology_tool_integration

**Type:** integration
**Version:** 1.0.0
**File:** `processes/methodology_tool_integration.json`

**Description:**
Integrate external tools: MCP servers, REST APIs, CLI tools.

**Tool Types:**
- **MCP Server:** Model Context Protocol (e.g., pcc, ide, filesystem)
- **API:** REST/GraphQL
- **CLI:** Command-line tools

**Integration Patterns:**
- Action trigger (Action → external tool)
- Data sync (consume external data)
- Event listener (external tool → Fact)

**Inputs:**
- Tool specifications
- Integration requirements

**Outputs:**
- `integrations/{methodology_id}/{tool_id}.json`
- integration_docs.md

**When to use:**
- Connecting to GitHub, Jira, Slack
- Platform integration
- Automation requirements

**Frequency:** As needed

---

### 19. methodology_cross_reference

**Type:** coordination
**Version:** 1.0.0
**File:** `processes/methodology_cross_reference.json`

**Description:**
Link multiple methodologies: composition, orchestration, saga patterns.

**Integration Patterns:**
- **Composition:** One methodology embeds another
- **Orchestration:** One coordinates multiple
- **Saga:** Long-running transaction with compensation
- **Peer-to-peer:** Direct communication via Facts

**Inputs:**
- Methodologies to link
- Integration pattern

**Outputs:**
- cross_reference_map.json
- integration_docs.md

**When to use:**
- Multi-methodology workflows
- Complex business processes
- Bounded context integration

**Frequency:** As needed

---

## GROUP 7: MANAGEMENT

### 20. methodology_governance_master

**Type:** orchestration
**Version:** 1.0.0
**File:** `processes/methodology_governance_master.json`

**Description:**
Orchestrate all 6 process groups: determine order, validate dependencies, manage scheduling.

**Orchestration:**
- **Phase 1 (Foundation):** LIFECYCLE + QA
- **Phase 2 (Operations):** EFFECTIVENESS + GOVERNANCE
- **Phase 3 (Improvement):** OPTIMIZATION + INTEGRATION

**Group Dependencies:**
- QA → depends on LIFECYCLE
- EFFECTIVENESS → depends on LIFECYCLE + QA
- OPTIMIZATION → depends on EFFECTIVENESS

**Inputs:**
- Organizational context (startup/enterprise/scale-up)
- Group priorities

**Outputs:**
- Execution plan
- Monitoring dashboard

**When to use:**
- Coordinating multiple groups
- Strategic planning
- Quarterly reviews

**Frequency:** Continuous orchestration

---

## Process Selection Guide

### "I want to create a new methodology"
→ Use **methodology_creation**

### "I want to upgrade to a new meta-methodology version"
→ Use **methodology_migration**

### "I want to add features to an existing methodology"
→ Use **methodology_evolution**

### "I want to retire an old methodology"
→ Use **methodology_deprecation**

### "I want to check if my methodology is valid"
→ Use **methodology_validation**

### "I want to test my methodology works correctly"
→ Use **methodology_testing**

### "I need to audit for compliance"
→ Use **methodology_audit**

### "I want to measure performance"
→ Use **methodology_metrics_collection** + **methodology_performance_analysis**

### "I want to calculate ROI"
→ Use **methodology_roi_calculation**

### "I want to run a team retrospective"
→ Use **methodology_retrospective**

### "I need approval to deploy"
→ Use **methodology_approval_workflow**

### "I need to check compliance before deployment"
→ Use **methodology_compliance_check**

### "I want to set up access control"
→ Use **methodology_access_control**

### "I want to find bottlenecks"
→ Use **methodology_bottleneck_detection**

### "I want to propose an improvement"
→ Use **methodology_improvement_proposal**

### "I want to identify automation opportunities"
→ Use **methodology_automation_opportunities**

### "I want to integrate external tools"
→ Use **methodology_tool_integration**

### "I want to link multiple methodologies"
→ Use **methodology_cross_reference**

### "I want to coordinate all process groups"
→ Use **methodology_governance_master**

---

## References

- **Process definitions:** `namespaces/meta/processes/`
- **Group management:** `namespaces/meta/guides/GROUP_MANAGEMENT.md`
- **methodology.yaml:** `namespaces/meta/methodology.yaml`
- **Meta README:** `namespaces/meta/README.md`
