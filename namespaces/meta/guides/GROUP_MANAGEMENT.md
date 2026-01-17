# Process Group Management

**Version:** 1.0.0
**Last Updated:** 2026-01-17

## Overview

This guide explains how to manage and orchestrate the 7 process groups in the meta-methodology. Process groups organize the 20+ processes into logical categories for different organizational contexts.

---

## The 7 Process Groups

### 1. LIFECYCLE (4 processes)

**Purpose:** Manage the complete lifecycle of methodologies from creation to deprecation.

**Owner:** Methodology Architect

**Processes:**
- `methodology_creation` - Create new methodologies
- `methodology_migration` - Migrate methodologies between versions
- `methodology_evolution` - Evolve methodologies with new features
- `methodology_deprecation` - Retire and archive old methodologies

**When to use:**
- Creating your first methodology
- Upgrading methodology versions
- Sunsetting legacy methodologies

**Priority by context:**
- Startup: **P0** (critical - building foundations)
- Enterprise: **P1** (high - managing portfolio)
- Scale-up: **P1** (high - rapid iteration)

---

### 2. QA (3 processes)

**Purpose:** Ensure quality and correctness of methodologies through validation, testing, and auditing.

**Owner:** Quality Assurance Lead

**Processes:**
- `methodology_validation` - L1/L2/L3 validation (schema, links, static analysis)
- `methodology_testing` - Runtime testing (happy path, error path, edge cases)
- `methodology_audit` - Periodic compliance and governance audits

**When to use:**
- Before deploying a methodology
- After significant changes
- Quarterly compliance reviews

**Priority by context:**
- Startup: **P1** (high - avoid broken processes)
- Enterprise: **P0** (critical - compliance required)
- Scale-up: **P1** (high - quality matters at scale)

---

### 3. EFFECTIVENESS (4 processes)

**Purpose:** Measure and analyze methodology performance through metrics, ROI, and retrospectives.

**Owner:** Analytics Team

**Processes:**
- `methodology_metrics_collection` - Collect Facts from releases (cycle time, error rate, etc.)
- `methodology_performance_analysis` - Analyze trends and bottlenecks
- `methodology_roi_calculation` - Calculate business value and ROI
- `methodology_retrospective` - Team retrospectives and lessons learned

**When to use:**
- Monthly/quarterly metrics reviews
- Business case justification
- Continuous improvement cycles

**Priority by context:**
- Startup: **P2** (medium - focus on building first)
- Enterprise: **P1** (high - justify investments)
- Scale-up: **P0** (critical - optimize for growth)

---

### 4. GOVERNANCE (3 processes)

**Purpose:** Control approvals, enforce compliance, and manage access to methodologies.

**Owner:** Process Owner

**Processes:**
- `methodology_approval_workflow` - Multi-stage approval (technical, business, committee)
- `methodology_compliance_check` - Security, privacy, regulatory compliance
- `methodology_access_control` - RBAC (roles, permissions, enforcement)

**When to use:**
- Before production deployment
- Regulated industries (HIPAA, SOC2, GDPR)
- Enterprise governance requirements

**Priority by context:**
- Startup: **P3** (low - move fast, governance later)
- Enterprise: **P0** (critical - mandatory compliance)
- Scale-up: **P1** (high - establish controls)

---

### 5. OPTIMIZATION (3 processes)

**Purpose:** Identify and implement improvements through bottleneck detection and automation.

**Owner:** AI/ML Team

**Processes:**
- `methodology_bottleneck_detection` - Find slow states, high timeouts, excessive manual work
- `methodology_improvement_proposal` - RFC-style improvement proposals
- `methodology_automation_opportunities` - AI-powered automation recommendations

**When to use:**
- After performance analysis shows issues
- Scaling existing methodologies
- Reducing operational costs

**Priority by context:**
- Startup: **P3** (low - optimize later)
- Enterprise: **P2** (medium - efficiency matters)
- Scale-up: **P0** (critical - eliminate bottlenecks)

---

### 6. INTEGRATION (2 processes)

**Purpose:** Connect methodologies with external tools and coordinate multi-methodology workflows.

**Owner:** Platform Engineering

**Processes:**
- `methodology_tool_integration` - Integrate MCP servers, APIs, CLIs
- `methodology_cross_reference` - Link methodologies (composition, orchestration, saga)

**When to use:**
- Connecting to external systems (GitHub, Jira, Slack)
- Building multi-methodology workflows
- Platform integration requirements

**Priority by context:**
- Startup: **P2** (medium - simple integrations)
- Enterprise: **P1** (high - complex integrations)
- Scale-up: **P1** (high - platform maturity)

---

### 7. MANAGEMENT (1 process)

**Purpose:** Orchestrate all process groups with dependencies, scheduling, and priorities.

**Owner:** Chief Methodology Officer

**Processes:**
- `methodology_governance_master` - Orchestrate all groups, manage dependencies

**When to use:**
- Coordinating multiple groups
- Strategic planning and prioritization
- Quarterly methodology reviews

**Priority by context:**
- Startup: **P1** (high - keep things organized)
- Enterprise: **P0** (critical - coordinate many methodologies)
- Scale-up: **P0** (critical - orchestrate rapid growth)

---

## Group Dependencies

```
LIFECYCLE ──┬──> QA
            │
            └──> EFFECTIVENESS ──> OPTIMIZATION
                      │
                      └──> GOVERNANCE

INTEGRATION (parallel, independent)

MANAGEMENT (orchestrates all)
```

**Dependency rules:**
1. **QA requires LIFECYCLE** - Can't validate what doesn't exist
2. **EFFECTIVENESS requires LIFECYCLE + QA** - Need valid methodologies with data
3. **OPTIMIZATION requires EFFECTIVENESS** - Need metrics to know what to optimize
4. **INTEGRATION is independent** - Can run in parallel
5. **MANAGEMENT orchestrates all** - Controls execution order

---

## Execution Strategies

### Strategy 1: Startup (Minimal Viable Governance)

**Active groups:** LIFECYCLE + QA + minimal EFFECTIVENESS

**Execution order:**
1. **Phase 1:** LIFECYCLE (create methodologies)
2. **Phase 2:** QA (validate before use)
3. **Phase 3:** EFFECTIVENESS (basic metrics collection)

**Deferred groups:**
- GOVERNANCE (P3) - No approvals, move fast
- OPTIMIZATION (P3) - Optimize later
- INTEGRATION (P2) - Simple integrations only

**Timeline:** 2-4 weeks to first methodology

---

### Strategy 2: Enterprise (Full Governance)

**Active groups:** ALL 7 groups

**Execution order:**
1. **Phase 1 (Foundation):** LIFECYCLE + QA
2. **Phase 2 (Operations):** EFFECTIVENESS + GOVERNANCE
3. **Phase 3 (Improvement):** OPTIMIZATION + INTEGRATION
4. **Phase 4 (Orchestration):** MANAGEMENT

**Emphasis:**
- GOVERNANCE is P0 (compliance mandatory)
- QA is P0 (audits required)
- EFFECTIVENESS is P1 (ROI justification)

**Timeline:** 8-12 weeks to full implementation

---

### Strategy 3: Scale-up (Optimize for Growth)

**Active groups:** LIFECYCLE + EFFECTIVENESS + OPTIMIZATION + MANAGEMENT

**Execution order:**
1. **Phase 1:** LIFECYCLE (rapid iteration)
2. **Phase 2:** EFFECTIVENESS (measure everything)
3. **Phase 3:** OPTIMIZATION (eliminate bottlenecks)
4. **Phase 4:** MANAGEMENT (coordinate growth)

**Emphasis:**
- OPTIMIZATION is P0 (bottlenecks kill growth)
- EFFECTIVENESS is P0 (data-driven decisions)
- QA is P1 (quality matters, but speed matters more)

**Timeline:** 4-6 weeks to optimization pipeline

---

## Continuous Improvement Loop

The groups work together in a continuous cycle:

```
1. LIFECYCLE: Create methodology
   ↓
2. QA: Validate & test
   ↓
3. EFFECTIVENESS: Collect metrics
   ↓
4. OPTIMIZATION: Detect bottlenecks
   ↓
5. OPTIMIZATION: Propose improvements
   ↓
6. GOVERNANCE: Approve changes
   ↓
7. LIFECYCLE: Evolve methodology
   ↓
(repeat)
```

**Frequency:**
- Metrics collection: **Continuous** (after each release)
- Performance analysis: **Monthly** or **Quarterly**
- Bottleneck detection: **Quarterly**
- Retrospectives: **Quarterly**
- Audits: **Quarterly** or **Semi-annual**

---

## Group Activation Checklist

Before activating a group, ensure:

### LIFECYCLE
- [ ] Methodology template available
- [ ] YAML editor access
- [ ] meta-validate skill installed

### QA
- [ ] Validation schema exists
- [ ] Test scenarios defined
- [ ] Audit policies documented

### EFFECTIVENESS
- [ ] Metrics collection automated
- [ ] Analytics tools available
- [ ] Baseline metrics established

### GOVERNANCE
- [ ] Approval workflows defined
- [ ] Compliance policies documented
- [ ] RBAC roles configured

### OPTIMIZATION
- [ ] Performance thresholds set
- [ ] Improvement proposal template
- [ ] Automation opportunities documented

### INTEGRATION
- [ ] MCP servers available
- [ ] API endpoints documented
- [ ] Cross-reference patterns defined

### MANAGEMENT
- [ ] All groups defined
- [ ] Dependencies mapped
- [ ] Priorities set by context

---

## Monitoring Group Health

Track these KPIs for each group:

**LIFECYCLE:**
- Methodologies created per quarter
- Migration success rate
- Time to deprecation

**QA:**
- Validation pass rate
- Test coverage percentage
- Audit findings (critical/high/medium)

**EFFECTIVENESS:**
- Average cycle time
- Error rate trend
- ROI percentage

**GOVERNANCE:**
- Approval cycle time
- Compliance violations
- Access control incidents

**OPTIMIZATION:**
- Bottlenecks identified
- Improvements implemented
- Automation coverage

**INTEGRATION:**
- Tools integrated
- Cross-methodology workflows
- Integration uptime

**MANAGEMENT:**
- Group coordination effectiveness
- Dependency conflicts
- Overall methodology portfolio health

---

## Troubleshooting

### Problem: Too many groups active, overwhelming team

**Solution:** Start with Core 3 (LIFECYCLE + QA + EFFECTIVENESS), add others incrementally.

### Problem: Group dependencies causing delays

**Solution:** Run independent groups in parallel (INTEGRATION doesn't depend on others).

### Problem: Unclear which group owns a task

**Solution:** Check `process_groups` section in methodology.yaml for process→group mapping.

### Problem: Conflicting priorities across contexts

**Solution:** Use `methodology_governance_master` process to resolve conflicts based on your context.

---

## References

- Process definitions: `namespaces/meta/processes/`
- Process catalog: `namespaces/meta/guides/PROCESS_CATALOG.md`
- methodology.yaml: `namespaces/meta/methodology.yaml`
- Governance master: `processes/methodology_governance_master.json`

---

**Next Steps:**

1. Identify your context (startup / enterprise / scale-up)
2. Activate groups based on priority
3. Set up `methodology_governance_master` to orchestrate
4. Monitor group KPIs monthly
5. Adjust priorities quarterly based on results
