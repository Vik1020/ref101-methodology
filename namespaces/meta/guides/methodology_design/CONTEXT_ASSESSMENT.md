# Organizational Context Assessment for Methodology Design

**Version:** 1.0.0
**Last Updated:** 2026-01-17
**Purpose:** Assess organizational context BEFORE designing a methodology to create the right design from the start

---

## Overview

When designing a new methodology using the meta-methodology framework, **context matters**. A methodology perfect for a mature enterprise will overwhelm a 5-person startup. A minimal workflow for startups will frustrate a compliance-driven organization.

This guide provides a systematic framework to:
1. **Assess** your organization across 5 critical dimensions
2. **Score** organizational readiness (0-100)
3. **Receive** design recommendations tailored to your context
4. **Design** a methodology that fits your reality

**When to use:** BEFORE starting methodology design (Phase 0 of methodology_creation process)

**Time required:** 20-30 minutes for assessment

---

## The 5-Dimensional Scoring System

Your organizational context is evaluated across 5 dimensions with weighted importance:

| Dimension | Weight | Focus Area |
|-----------|--------|------------|
| **Culture** | 30% | Collaboration, change resistance, documentation, learning |
| **Tech Maturity** | 25% | Tools, automation, infrastructure, AI readiness |
| **Resources** | 20% | Team size, budget, time capacity, skill level |
| **Compliance Needs** | 15% | Regulatory requirements, audits, risk tolerance |
| **Evolution Readiness** | 10% | Incremental preference, rollback capability, pilot willingness |

Each dimension scores 1-5, weighted by importance, producing a **Total Readiness Score (0-100)**.

---

## Dimension 1: Culture (30% weight)

Culture drives adoption success more than any other factor.

### 1.1 Collaboration Level (1-5)

**What it measures:** How teams work together

| Score | Description | Indicators |
|-------|-------------|------------|
| 1 | Siloed teams | Departments don't communicate; throw work "over the wall" |
| 2 | Rare collaboration | Collaboration happens but requires executive intervention |
| 3 | Regular collaboration | Teams collaborate on major projects, some friction remains |
| 4 | Cross-functional standard | Cross-functional teams are normal; shared goals |
| 5 | Seamless integration | Teams self-organize across boundaries; collaboration is natural |

**Why it matters:** Methodologies with many actors/handoffs require high collaboration.

**Example:**
- Score 2 → Design with minimal handoffs (1-2 actors max)
- Score 5 → Can support complex workflows with 5+ actors

---

### 1.2 Resistance to Change (1-5, inverted)

**What it measures:** How readily the organization adopts new processes

| Score | Description | Indicators |
|-------|-------------|------------|
| 1 | High resistance | "We've always done it this way"; new processes ignored |
| 2 | Skeptical | Need extensive convincing; slow adoption |
| 3 | Neutral | Will adopt if benefits are clear |
| 4 | Open to change | Actively seeks improvements; willing to experiment |
| 5 | Change embraced | Change is celebrated; continuous improvement culture |

**Why it matters:** High resistance requires ultra-simple methodologies with clear wins.

**Example:**
- Score 1-2 → Start with minimal 3-state workflow; prove value quickly
- Score 4-5 → Can introduce complex governance from day one

---

### 1.3 Documentation Habits (1-5)

**What it measures:** How the organization handles knowledge

| Score | Description | Indicators |
|-------|-------------|------------|
| 1 | Tribal knowledge | Documentation doesn't exist; knowledge in people's heads |
| 2 | Inconsistent docs | Some docs exist but outdated or scattered |
| 3 | Basic documentation | Key processes documented; teams mostly follow |
| 4 | Living documentation | Docs updated regularly; teams rely on them |
| 5 | Self-updating docs | AI-generated docs; metrics track doc health |

**Why it matters:** Poor documentation habits require lightweight templates.

**Example:**
- Score 1-2 → Use simple markdown checklists (5-10 fields max)
- Score 4-5 → Can use complex YAML schemas with 50+ fields

---

### 1.4 Learning Culture (1-5)

**What it measures:** How the organization learns from experience

| Score | Description | Indicators |
|-------|-------------|------------|
| 1 | Reactive only | No retrospectives; same mistakes repeated |
| 2 | Occasional learning | Retrospectives happen but insights not applied |
| 3 | Structured learning | Regular retrospectives; action items tracked |
| 4 | Data-driven learning | Metrics guide improvements; experiments common |
| 5 | Continuous improvement | Learning is embedded; Kaizen culture |

**Why it matters:** Strong learning culture enables iterative methodology evolution.

**Example:**
- Score 1-2 → Design fixed workflow; changes require re-training
- Score 4-5 → Design with built-in evolution triggers and A/B testing

---

## Dimension 2: Tech Maturity (25% weight)

Technical sophistication determines what automation is feasible.

### 2.1 Tool Sophistication (1-5)

**What it measures:** Current tool stack maturity

| Score | Description | Tool Stack |
|-------|-------------|------------|
| 1 | Manual tools | Spreadsheets, email, physical boards |
| 2 | Basic digital | Jira/Trello, Slack, Google Docs |
| 3 | Integrated tools | CI/CD, GitHub, automated testing |
| 4 | DevOps mature | GitOps, IaC (Terraform), monitoring (Datadog) |
| 5 | AI-augmented | MCP servers, AI code review, self-healing systems |

**Example:**
- Score 1-2 → Methodology uses manual actions, human actors only
- Score 4-5 → Methodology leverages MCP tools, AI actors, automated validators

---

### 2.2 Automation Level (1-5)

**What it measures:** Current process automation

| Score | Description | Automation |
|-------|-------------|------------|
| 1 | Fully manual | Every step requires human action |
| 2 | Scripted tasks | Basic scripts for repetitive tasks |
| 3 | Semi-automated | CI/CD exists; deployments semi-automated |
| 4 | Highly automated | Most routine tasks automated; humans handle exceptions |
| 5 | Autonomous | Self-healing; humans approve strategic decisions only |

**Example:**
- Score 1-2 → Design with manual approvals, human-triggered actions
- Score 4-5 → Design with automated validators, system-triggered transitions

---

### 2.3 Infrastructure Stability (1-5)

**What it measures:** Reliability of technical infrastructure

| Score | Description | Stability |
|-------|-------------|-----------|
| 1 | Frequent outages | Weekly incidents; manual recovery |
| 2 | Occasional issues | Monthly incidents; documented recovery |
| 3 | Generally stable | Quarterly incidents; automated monitoring |
| 4 | Highly reliable | Rare incidents; self-healing where possible |
| 5 | Mission-critical | 99.99% uptime; redundancy everywhere |

**Why it matters:** Unstable infrastructure requires short timeouts and manual fallbacks.

**Example:**
- Score 1-2 → Use short timeouts (hours); manual escalation paths
- Score 4-5 → Can use long timeouts (days/weeks) with SLA tracking

---

### 2.4 AI Readiness (1-5)

**What it measures:** Organization's ability to leverage AI

| Score | Description | AI Usage |
|-------|-------------|----------|
| 1 | No AI tools | Not using any AI; skeptical of AI |
| 2 | Experimenting | Trying ChatGPT, Copilot; no integration |
| 3 | Tactical use | AI for code review, testing; not in workflows |
| 4 | Strategic integration | AI actors in some processes; governance defined |
| 5 | AI-native | AI deeply integrated; AI-human collaboration seamless |

**Example:**
- Score 1-2 → Design with Human actors only; defer AI adoption
- Score 4-5 → Design with AI actors from start; leverage MCP tools

---

## Dimension 3: Resources (20% weight)

Resources constrain what's feasible regardless of desire.

### 3.1 Team Size Adequacy (1-5)

| Score | Description | Team Size |
|-------|-------------|-----------|
| 1 | Severely understaffed | <5 people doing work of 20 |
| 2 | Understaffed | 5-10 people; everyone overworked |
| 3 | Adequate | 10-30 people; some slack capacity |
| 4 | Well-resourced | 30-100 people; dedicated roles |
| 5 | Abundant | >100 people; specialized teams |

**Example:**
- Score 1-2 → Minimal 3-state workflow; no approvals
- Score 4-5 → Complex 10+ state workflow; multi-stage approvals

---

### 3.2 Budget Availability (1-5)

| Score | Description | Budget |
|-------|-------------|--------|
| 1 | No budget | Can't afford tools/training |
| 2 | Minimal budget | Basic tools only; no training budget |
| 3 | Moderate budget | Standard tools; some training |
| 4 | Strong budget | Premium tools; extensive training |
| 5 | Ample budget | Custom tools; dedicated process team |

---

### 3.3 Time Capacity (1-5)

| Score | Description | Capacity |
|-------|-------------|----------|
| 1 | Fully utilized | 120% capacity; constant firefighting |
| 2 | Overutilized | 100% capacity; no room for initiatives |
| 3 | At capacity | 90% capacity; can squeeze in small changes |
| 4 | Some slack | 70-80% capacity; can handle initiatives |
| 5 | Capacity for growth | <70% capacity; actively seeking challenges |

**Why it matters:** No capacity means ultra-lightweight processes only.

---

### 3.4 Skill Level (1-5)

| Score | Description | Skills |
|-------|-------------|--------|
| 1 | Junior team | Most <1 year experience; need heavy guidance |
| 2 | Mixed junior | Mix of junior/mid; some expertise gaps |
| 3 | Mid-level | Mostly mid-level (2-5 years); solid skills |
| 4 | Senior team | Mostly senior (5-10 years); strong expertise |
| 5 | Expert team | Experts (10+ years); thought leaders |

**Example:**
- Score 1-2 → Design with explicit checklists; no implicit knowledge
- Score 4-5 → Design can assume best practices; minimal documentation

---

## Dimension 4: Compliance Needs (15% weight)

Compliance requirements dictate governance complexity.

### 4.1 Regulatory Requirements (1-5)

| Score | Description | Requirements |
|-------|-------------|--------------|
| 1 | None | No regulatory requirements |
| 2 | Light | Industry best practices only |
| 3 | Moderate | Some compliance (e.g., PCI-DSS) |
| 4 | Strict | SOC2, GDPR, or HIPAA required |
| 5 | Mission-critical | Multiple frameworks; continuous audits |

**Example:**
- Score 1-2 → No approval workflows; minimal audit trail
- Score 4-5 → Multi-stage approvals; comprehensive audit logs

---

### 4.2 Audit Frequency (1-5)

| Score | Description | Frequency |
|-------|-------------|-----------|
| 1 | Never | No audits performed |
| 2 | Rare | Audits only if customer requests |
| 3 | Annual | Yearly compliance audits |
| 4 | Quarterly | Regular internal + external audits |
| 5 | Continuous | Real-time compliance monitoring |

---

### 4.3 Risk Tolerance (1-5, inverted)

| Score | Description | Tolerance |
|-------|-------------|-----------|
| 1 | High tolerance | Move fast and break things |
| 2 | Moderate tolerance | Accept calculated risks |
| 3 | Balanced | Risk vs reward evaluation |
| 4 | Low tolerance | Conservative; prefer safety |
| 5 | Zero tolerance | Mission-critical; no failures acceptable |

**Example:**
- Score 1-2 → Hotfix workflow; skip planning phases
- Score 4-5 → Extensive planning; BC/AC/security review required

---

## Dimension 5: Evolution Readiness (10% weight)

How the organization handles change and rollout.

### 5.1 Incremental Preference (1-5)

| Score | Description | Approach |
|-------|-------------|----------|
| 1 | Big-bang only | All-or-nothing deployments |
| 2 | Prefer big-bang | Incremental possible but not preferred |
| 3 | Neutral | Use both approaches as appropriate |
| 4 | Prefer incremental | Usually incremental; big-bang for urgency |
| 5 | Strongly incremental | Always incremental; canary/blue-green standard |

---

### 5.2 Rollback Capability (1-5)

| Score | Description | Capability |
|-------|-------------|------------|
| 1 | No rollback | Forward-only; fix in production |
| 2 | Manual rollback | Possible but painful; takes hours |
| 3 | Semi-automated | Scripts exist; takes 15-30 minutes |
| 4 | Automated rollback | One-click; takes <5 minutes |
| 5 | Instant rollback | Feature flags; instant toggle |

---

### 5.3 Pilot Willingness (1-5)

| Score | Description | Approach |
|-------|-------------|----------|
| 1 | Skip pilots | Roll out to everyone immediately |
| 2 | Reluctant | Pilots only if forced |
| 3 | Open to pilots | Will pilot major changes |
| 4 | Prefer pilots | Usually pilot first |
| 5 | Always pilot | Never skip pilot; data-driven rollout |

---

## Scoring & Decision Tree

### Calculating Your Total Score

```
Total Score = (Culture × 30%) + (Tech × 25%) + (Resources × 20%) +
              (Compliance × 15%) + (Evolution × 10%)

Each dimension score: Average of sub-scores × 20 (to get 0-100 scale)
```

**Example Calculation:**

```yaml
Culture:
  Collaboration: 3
  Resistance to Change: 4
  Documentation: 2
  Learning: 3
  Average: 3.0 → 60/100 × 30% = 18.0

Tech Maturity:
  Tools: 2
  Automation: 2
  Infrastructure: 3
  AI Readiness: 2
  Average: 2.25 → 45/100 × 25% = 11.25

Resources:
  Team Size: 2
  Budget: 2
  Time: 2
  Skills: 3
  Average: 2.25 → 45/100 × 20% = 9.0

Compliance:
  Regulatory: 2
  Audit Frequency: 1
  Risk Tolerance: 3 (inverted from 3)
  Average: 2.0 → 40/100 × 15% = 6.0

Evolution:
  Incremental: 3
  Rollback: 2
  Pilot: 3
  Average: 2.67 → 53/100 × 10% = 5.3

Total Score: 18.0 + 11.25 + 9.0 + 6.0 + 5.3 = 49.55 ≈ 50/100
```

---

## Decision Tree: Score → Recommendations

### Score 0-30: Level 1 → HIGH RISK

**Maturity:** Ad-hoc
**Context:** startup
**Bundle:** minimal (or defer methodology entirely)

**Assessment:**
- Organization is in survival mode
- Introducing ANY methodology may be premature
- Focus on core business first

**Recommendations:**
1. **Consider deferring:** Wait until team >5 people and basic stability achieved
2. **If must proceed:** Use absolute minimum
   - 3 states max (INIT → WORKING → DONE)
   - 1 Human actor
   - 2-3 manual actions
   - No approval workflows
   - Single markdown checklist artifact
3. **Pilot required:** Test with 1 person for 2 weeks before team adoption

**Design Constraints:**
```yaml
States: 3 (Initial, Working, Terminal)
Actors: 1 (Human only)
Actions: 2-3 (essential only)
Artifacts: 1 (markdown checklist)
Rules: 0-1 (optional precondition)
```

---

### Score 31-50: Level 2 → MEDIUM RISK

**Maturity:** Managed
**Context:** startup
**Bundle:** minimal

**Assessment:**
- Organization is stabilizing but still resource-constrained
- Can adopt minimal methodology with strong support
- Requires simple, fast-win approach

**Recommendations:**
1. **Start with pilot:** 1 team, 3-5 people, 4-6 weeks
2. **Use hotfix workflow:** 5 phases, 1 approval max
3. **Manual first:** All actions human-triggered
4. **Lightweight docs:** Markdown templates only
5. **Quick wins:** Target 2-week cycle time

**Design Constraints:**
```yaml
States: 3-5 (linear flow)
Actors: 1-2 (Human only)
Actions: 3-7 (manual)
Artifacts: 1-2 (simple templates)
Rules: 1-3 (preconditions only)
Approvals: 0-1 (single approval max)
```

---

### Score 51-70: Level 2-3 → LOW RISK

**Maturity:** Defined (emerging)
**Context:** scaleup
**Bundle:** standard

**Assessment:**
- Organization is growing and ready for structured processes
- Can handle moderate complexity
- Good fit for full-featured methodology

**Recommendations:**
1. **Phased rollout:** Pilot (4-6 weeks) → Team (4-6 weeks) → Org-wide (4-8 weeks)
2. **Use feature workflow:** 8 phases with BC/AC/planning
3. **Semi-automated:** Mix of human and AI actors
4. **Structured docs:** YAML/JSON templates
5. **Metrics tracking:** Collect cycle time, error rate

**Design Constraints:**
```yaml
States: 5-8 (branching allowed)
Actors: 3-5 (Human + AI)
Actions: 8-15 (semi-automated)
Artifacts: 3-6 (structured)
Rules: 5-10 (pre/post conditions)
Approvals: 1-2 (lightweight governance)
```

---

### Score 71-85: Level 3-4 → LOW RISK

**Maturity:** Quantitatively Managed
**Context:** enterprise
**Bundle:** enterprise

**Assessment:**
- Organization is mature and process-oriented
- Can handle complex governance and compliance
- Excellent fit for full methodology

**Recommendations:**
1. **Full rollout:** Pilot (2-4 weeks) → Rapid org-wide (2-4 weeks)
2. **Complete workflow:** All phases including governance
3. **Highly automated:** System actors, automated validators
4. **Comprehensive audit:** Full artifact trail
5. **ROI tracking:** Business case justified with metrics

**Design Constraints:**
```yaml
States: 8-12 (complex flows, parallel branches)
Actors: 5-10 (Human + AI + System)
Actions: 15-25 (mostly automated)
Artifacts: 8-12 (comprehensive)
Rules: 15-25 (all types including guards)
Approvals: 2-3 (multi-stage governance)
```

---

### Score 86-100: Level 4-5 → VERY LOW RISK

**Maturity:** Optimizing
**Context:** enterprise
**Bundle:** enterprise (full features)

**Assessment:**
- Organization is highly mature and continuously improving
- Can leverage most advanced features
- Ideal conditions for methodology success

**Recommendations:**
1. **Accelerated rollout:** Pilot (1-2 weeks) → Immediate org-wide
2. **Full automation:** AI-native workflow
3. **Self-service:** Teams can adapt methodology themselves
4. **Real-time metrics:** Dashboards, predictive analytics
5. **Continuous optimization:** A/B testing, automated improvements

**Design Constraints:**
```yaml
States: 10-15 (sophisticated state machine)
Actors: 8-15 (AI-native, RBAC)
Actions: 20-40 (fully automated where possible)
Artifacts: 10-20 (living documents)
Rules: 20-40 (complex predicates, compensation)
Approvals: 3-5 (sophisticated governance)
```

---

## Design Recommendations by Score

### Example 1: Startup (Score 45)

**Assessment Results:**
- Culture: 50/100 (collaborative but docs weak)
- Tech: 40/100 (basic tools, manual processes)
- Resources: 35/100 (understaffed, tight budget)
- Compliance: 20/100 (no requirements)
- Evolution: 60/100 (willing to pilot, incremental)

**Design Recommendations:**

```yaml
Methodology Design for Score 45:

States:
  Recommendation: 3-4 states maximum
  Rationale: "Small team can't handle complexity"
  Example: [INIT, WORKING, DONE, ERROR]

Actors:
  Recommendation: 1-2 Human actors only
  Rationale: "Low automation level (2/5); defer AI"
  Example: [engineer, optional_manager_for_approval]

Actions:
  Recommendation: 3-5 manual actions
  Rationale: "Keep it simple; team is small"
  Example: [start_work, request_review, complete]
  Approvals: Max 1 approval (manager signoff)

Artifacts:
  Recommendation: 1-2 lightweight artifacts
  Rationale: "Documentation habits weak (2/5)"
  Templates: Simple markdown (5-10 fields)
  Example: [RELEASE.md, CHECKLIST.md]

Rules:
  Recommendation: 1-2 essential preconditions
  Rationale: "No compliance needs; keep governance minimal"
  Example: [has_description, tests_exist]

Timeouts:
  Recommendation: Short (hours, not days)
  Rationale: "Small team; delays hurt velocity"
  Example: 4 hours per state
```

**Anti-Patterns to Avoid:**
- ❌ Multi-stage approvals (no capacity for governance)
- ❌ Complex state machines (team too small)
- ❌ AI actors (AI readiness only 2/5)
- ❌ Comprehensive artifacts (docs habits weak)

---

### Example 2: Scale-up (Score 65)

**Assessment Results:**
- Culture: 70/100 (collaborative, good learning culture)
- Tech: 65/100 (CI/CD exists, some automation)
- Resources: 60/100 (30-person team, moderate budget)
- Compliance: 50/100 (some requirements emerging)
- Evolution: 70/100 (pilot-friendly, incremental)

**Design Recommendations:**

```yaml
Methodology Design for Score 65:

States:
  Recommendation: 6-8 states with branching
  Rationale: "Team can handle moderate complexity"
  Example: [INIT, PLANNING, DEV, REVIEW, QA, STAGING, PROD, ERROR]
  Include Waiting states for approvals

Actors:
  Recommendation: 3-5 actors (Human + AI)
  Rationale: "Automation level 3/5; ready for AI code review"
  Example: [pm, dev, qa, ai_reviewer, deploy_bot]

Actions:
  Recommendation: 8-15 actions (semi-automated)
  Rationale: "Balance manual and automated"
  Example: [create_plan, code, ai_review, manual_review, deploy]
  Approvals: 2 approvals (tech lead + qa)

Artifacts:
  Recommendation: 4-6 structured artifacts
  Rationale: "Good documentation habits (4/5)"
  Templates: YAML/JSON with validation
  Example: [PLAN.md, CODE_CHANGES, TEST_REPORT, DEPLOY_LOG]

Rules:
  Recommendation: 8-12 rules (pre/post conditions)
  Rationale: "Emerging compliance needs; add governance"
  Example: [plan_approved, tests_pass, qa_signoff, no_critical_bugs]

Timeouts:
  Recommendation: Medium (days with escalation)
  Rationale: "Team has capacity; allow thoughtful reviews"
  Example: 2 days per waiting state
```

**Growth Path:**
- ✅ Start with standard bundle
- ✅ Add AI actors incrementally (code review first)
- ✅ Introduce metrics collection after 3 releases
- ✅ Plan transition to enterprise bundle when team >50

---

### Example 3: Enterprise (Score 80)

**Assessment Results:**
- Culture: 85/100 (mature, learning-focused)
- Tech: 90/100 (GitOps, full automation, AI-ready)
- Resources: 80/100 (100+ person teams, strong budget)
- Compliance: 85/100 (SOC2, GDPR required)
- Evolution: 75/100 (always pilot, incremental)

**Design Recommendations:**

```yaml
Methodology Design for Score 80:

States:
  Recommendation: 10-15 states (comprehensive)
  Rationale: "Organization can handle complexity; compliance requires it"
  Example: Full 8-phase workflow + security/compliance gates
  Include parallel branches, rollback states

Actors:
  Recommendation: 8-12 actors with RBAC
  Rationale: "Large team; strict access control required"
  Example: [po, architect, dev, security, compliance, qa, ai_agent, deploy_bot]

Actions:
  Recommendation: 20-30 granular actions
  Rationale: "Audit trail required; granular actions enable traceability"
  Example: [create_rfc, security_review, compliance_check, canary_deploy, ...]
  Approvals: 3-4 stages (tech, security, compliance, business)

Artifacts:
  Recommendation: 12-18 comprehensive artifacts
  Rationale: "Compliance requires full documentation"
  Templates: Complex schemas with validation
  Example: [RFC, THREAT_MODEL, BC_ANALYSIS, COMPLIANCE_CERT, AUDIT_LOG, ...]

Rules:
  Recommendation: 25-35 rules (all types)
  Rationale: "Zero-risk tolerance; comprehensive governance"
  Include: Guards, compensation, external API checks
  Example: [security_approved, pen_test_passed, legal_review, gdpr_compliant, ...]

Timeouts:
  Recommendation: Long with SLA tracking
  Rationale: "Complex approval chains; track SLAs for bottlenecks"
  Example: 5 days per approval with automated escalation
```

**Advanced Features:**
- ✅ Full MCP integration
- ✅ Real-time compliance monitoring
- ✅ Automated canary deployments
- ✅ ROI dashboards for executives
- ✅ Self-service methodology customization

---

## Using This Assessment

### Step 1: Complete the Questionnaire

Use the template at `namespaces/meta/templates/methodology_design/CONTEXT_ASSESSMENT_TEMPLATE.md`:
- 20 questions (4 per dimension)
- 15-20 minutes to complete
- Involve key stakeholders (not just one person's view)

### Step 2: Calculate Your Score

Use weighted formula:
```
Total = (Culture × 30%) + (Tech × 25%) + (Resources × 20%) +
        (Compliance × 15%) + (Evolution × 10%)
```

### Step 3: Review Decision Tree

Find your score range (0-30, 31-50, 51-70, 71-85, 86-100) and read recommendations.

### Step 4: Apply Design Constraints

Use the design constraints from your score range when creating `methodology.yaml`:
- States count and types
- Actors count and types
- Actions complexity
- Artifacts structure
- Rules governance level

### Step 5: Validate with Maturity Guide

Cross-reference with `MATURITY_AWARE_DESIGN.md` to see detailed patterns for your maturity level.

---

## Common Pitfalls

### Pitfall 1: Over-Engineering for Low Scores

**Symptom:** Score 40 but designing 10-state workflow with multi-stage approvals

**Fix:** Respect your score. Start minimal. Grow incrementally.

### Pitfall 2: Under-Engineering for High Scores

**Symptom:** Score 85 but designing 3-state workflow without governance

**Fix:** Leverage your maturity. Compliance stakeholders will demand governance anyway.

### Pitfall 3: Ignoring Culture Dimension

**Symptom:** Great tech (Tech=90) but poor culture (Culture=40) → Failure

**Fix:** Culture is 30% of score for a reason. No amount of automation fixes culture resistance.

### Pitfall 4: Solo Assessment

**Symptom:** One person completes assessment based on their view

**Fix:** Involve 3-5 stakeholders (PM, Engineer, QA, Manager). Average their scores.

---

## Next Steps

After completing this assessment:

1. **Record your results** using the template
2. **Review design recommendations** for your score range
3. **Read maturity-specific patterns** in `MATURITY_AWARE_DESIGN.md`
4. **Plan incremental evolution** using `INCREMENTAL_DESIGN.md`
5. **Select adaptation patterns** from `ADAPTATION_PATTERNS.md`

**Start here:** `README.md` in this directory for navigation guidance.

---

## References

- **Template:** `namespaces/meta/templates/methodology_design/CONTEXT_ASSESSMENT_TEMPLATE.md`
- **Maturity Patterns:** `MATURITY_AWARE_DESIGN.md`
- **Incremental Strategy:** `INCREMENTAL_DESIGN.md`
- **Adaptation Patterns:** `ADAPTATION_PATTERNS.md`
- **Decision Trees:** `DESIGN_DECISIONS.md`

---

**Version History:**
- 1.0.0 (2026-01-17): Initial release with 5-dimensional scoring system
