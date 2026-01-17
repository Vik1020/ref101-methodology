# Methodology Design Decision Trees

**Version:** 1.0.0
**Last Updated:** 2026-01-17
**Purpose:** Visual decision trees for common methodology design questions

---

## Overview

When designing a methodology, you'll face recurring questions:
- How many states should I have?
- Which actor types should I use?
- When should I add approval workflows?
- When to introduce AI actors?
- How many artifacts are needed?

This guide provides **visual decision trees** to answer these questions based on your organizational context.

**Prerequisites:** Complete context assessment (`CONTEXT_ASSESSMENT.md`) first

---

## Decision Tree 1: How Many States?

```mermaid
graph TD
    START[How many states?] --> MATURITY{Maturity Level?}

    MATURITY -->|Level 1<br/>Ad-hoc| STATES1[3 states<br/>INIT, WORKING, DONE]
    MATURITY -->|Level 2<br/>Managed| STATES2[3-5 states<br/>Add ERROR state<br/>Maybe 1 REVIEW state]
    MATURITY -->|Level 3<br/>Defined| STATES3[5-8 states<br/>Add WAITING states<br/>Add branching]
    MATURITY -->|Level 4+<br/>Quantitatively| STATES4[8-15+ states<br/>Complex flows<br/>Parallel branches]

    STATES1 --> CHECK1{Team >10?}
    CHECK1 -->|Yes| STATES2
    CHECK1 -->|No| FINAL1[Use 3 states]

    STATES2 --> CHECK2{Approvals needed?}
    CHECK2 -->|Yes| APPROVALSTATE[Add 1 WAITING state]
    CHECK2 -->|No| FINAL2[Use 3-4 states]

    APPROVALSTATE --> FINAL2A[Use 4-5 states]

    STATES3 --> CHECK3{Compliance required?}
    CHECK3 -->|Yes| COMPLIANCESTATE[Add compliance gates]
    CHECK3 -->|No| FINAL3[Use 5-8 states]

    COMPLIANCESTATE --> FINAL3A[Use 8-10 states]

    STATES4 --> CHECK4{Multiple teams?}
    CHECK4 -->|Yes| MULTISTATE[Add coordination states]
    CHECK4 -->|No| FINAL4[Use 8-12 states]

    MULTISTATE --> FINAL4A[Use 12-15 states]
```

**Key Principle:** Start with fewer states. Add complexity only when needed.

**Anti-Pattern:** Designing 15-state workflow for 5-person team.

---

## Decision Tree 2: Which Actor Types?

```mermaid
graph TD
    START[Which actor types?] --> AUTOMATION{Automation Level?}

    AUTOMATION -->|Level 1-2<br/>Manual| ACTORS1[Human actors only<br/>1-2 actors max]
    AUTOMATION -->|Level 3<br/>Semi-automated| ACTORS2[Human + AI actors<br/>3-5 actors]
    AUTOMATION -->|Level 4<br/>Highly automated| ACTORS3[Human + AI + System<br/>5-10 actors with RBAC]
    AUTOMATION -->|Level 5<br/>Autonomous| ACTORS4[AI-native<br/>10+ actors, AI primary]

    ACTORS1 --> CHECKROLES1{Need approvals?}
    CHECKROLES1 -->|No| SINGLEROLE[1 actor: team_member]
    CHECKROLES1 -->|Yes| TWOROLES[2 actors: doer + approver]

    ACTORS2 --> CHECKAI{AI readiness >3/5?}
    CHECKAI -->|Yes| ADDAI[Add AI actor<br/>for code review]
    CHECKAI -->|No| DEFER[Defer AI actors<br/>Use 3-5 Human actors]

    ACTORS3 --> CHECKRBAC{Team >50 people?}
    CHECKRBAC -->|Yes| RBACYES[Strict RBAC<br/>Role-based permissions]
    CHECKRBAC -->|No| RBACLIGHT[Light RBAC<br/>Trust-based]

    ACTORS4 --> AIREADY{AI integrated?}
    AIREADY -->|Yes| AINATIVE[AI actors handle<br/>80% of actions]
    AIREADY -->|No| BACKTO3[Not ready<br/>Use Level 3 design]
```

**Key Principle:** Match actor types to your automation level. Don't add AI actors if your team isn't ready.

**Anti-Pattern:** Adding 10 AI actors when team has never used AI tools.

---

## Decision Tree 3: Approval Workflow Complexity

```mermaid
graph TD
    START[How many approval stages?] --> CULTURE{Culture Type?}

    CULTURE -->|Collaborative<br/>Flat hierarchy| LIGHT[0-1 approval stages<br/>Trust-based]
    CULTURE -->|Hierarchical<br/>Chain of command| MULTI[2-5 approval stages<br/>Follow hierarchy]
    CULTURE -->|Innovation<br/>Experiment-focused| NONE[0 approvals<br/>Self-approval]

    MULTI --> COMPLIANCE{Compliance required?}
    COMPLIANCE -->|No| STAGES2[2 stages<br/>Tech + Business]
    COMPLIANCE -->|Yes| STAGES4[3-5 stages<br/>Tech + Security +<br/>Compliance + Business]

    LIGHT --> RISK{Risk tolerance?}
    RISK -->|High| SELF[Self-approval<br/>0 stages]
    RISK -->|Low| SINGLE[1 approval<br/>Tech Lead or PM]

    STAGES2 --> CHECKSIZE{Team >100?}
    CHECKSIZE -->|Yes| ADDMORE[Add Director approval<br/>3 stages total]
    CHECKSIZE -->|No| KEEP2[Keep 2 stages]

    STAGES4 --> CHECKAUD{Regular audits?}
    CHECKAUD -->|Yes| COMPREHENSIVE[5 stages<br/>Full audit trail]
    CHECKAUD -->|No| REDUCED[3 stages<br/>Essential governance]
```

**Key Principle:** Match approval complexity to culture + compliance needs.

**Anti-Pattern:** 4-stage approvals in collaborative startup OR zero approvals in regulated enterprise.

---

## Decision Tree 4: When to Add AI Actors?

```mermaid
graph TD
    START[Should I add AI actors?] --> READINESS{AI Readiness?}

    READINESS -->|1-2/5<br/>Not ready| WAIT[WAIT<br/>Focus on Human actors<br/>Revisit in 6-12 months]
    READINESS -->|3/5<br/>Experimenting| PILOT[PILOT<br/>Add 1 AI actor<br/>for code review]
    READINESS -->|4-5/5<br/>Integrated| ADOPT[ADOPT<br/>Add multiple AI actors<br/>Across workflow]

    PILOT --> CHECKTOOLS{MCP tools available?}
    CHECKTOOLS -->|No| BASIC[Use basic AI<br/>Claude/Copilot only]
    CHECKTOOLS -->|Yes| MCP[Use MCP actors<br/>code_analysis_mcp]

    ADOPT --> CHECKPHASE{Which phase?}
    CHECKPHASE --> PHASE1[Code Review:<br/>ai_reviewer]
    CHECKPHASE --> PHASE2[Testing:<br/>ai_test_generator]
    CHECKPHASE --> PHASE3[Security:<br/>ai_security_scanner]
    CHECKPHASE --> PHASE4[Metrics:<br/>ai_metrics_analyzer]

    WAIT --> CHECKDATA{Have AI tools?}
    CHECKDATA -->|No| ACQUIRE[Acquire tools first<br/>Claude Code, Copilot]
    CHECKDATA -->|Yes| TRAIN[Train team<br/>Build comfort with AI]
```

**Key Principle:** AI readiness 3/5+ before adding AI actors. Start with 1 AI actor (code review), then expand.

**Anti-Pattern:** Adding 5 AI actors when team has never used AI tools (will be ignored).

---

## Decision Tree 5: How Many Artifacts?

```mermaid
graph TD
    START[How many artifacts?] --> DOCS{Documentation Habits?}

    DOCS -->|1-2/5<br/>Weak| MIN[1-2 artifacts<br/>Markdown checklists]
    DOCS -->|3/5<br/>Basic| STANDARD[3-6 artifacts<br/>Structured templates]
    DOCS -->|4-5/5<br/>Strong| COMPREHENSIVE[8-15+ artifacts<br/>Full documentation]

    MIN --> CHECKESSENTIAL{What's essential?}
    CHECKESSENTIAL --> RELEASE[RELEASE.md<br/>Always required]
    CHECKESSENTIAL --> OPTIONAL[TEST_REPORT<br/>If testing exists]

    STANDARD --> CHECKPHASES{Which phases?}
    CHECKPHASES --> PLANNING[Planning phase:<br/>PLAN.md]
    CHECKPHASES --> DEV[Development:<br/>CODE_CHANGES.yaml]
    CHECKPHASES --> QA[QA phase:<br/>TEST_REPORT.json]
    CHECKPHASES --> DEPLOY[Deployment:<br/>DEPLOY_LOG.md]

    COMPREHENSIVE --> CHECKCOMPLIANCE{Compliance required?}
    CHECKCOMPLIANCE -->|Yes| AUDIT[Add audit artifacts:<br/>COMPLIANCE_CERT<br/>SECURITY_REPORT<br/>APPROVAL_RECORD]
    CHECKCOMPLIANCE -->|No| METRICS[Add metrics artifacts:<br/>ROI_ANALYSIS<br/>PERFORMANCE_METRICS]

    MIN --> CHECKFIELDS{How many fields?}
    CHECKFIELDS --> FIELDS1[5-10 fields<br/>Keep simple]

    STANDARD --> CHECKFIELDS2{How many fields?}
    CHECKFIELDS2 --> FIELDS2[15-40 fields<br/>Moderate detail]

    COMPREHENSIVE --> CHECKFIELDS3{How many fields?}
    CHECKFIELDS3 --> FIELDS3[50-100+ fields<br/>Comprehensive]
```

**Key Principle:** Match artifact complexity to documentation habits. Start minimal, expand as habits improve.

**Anti-Pattern:** Requiring 15 comprehensive artifacts when team's documentation habits are 2/5.

---

## Decision Tree 6: Maturity Level → Bundle Selection

```mermaid
graph TD
    START[Which bundle?] --> SCORE{Readiness Score?}

    SCORE -->|0-30<br/>Level 1| DEFER[Consider DEFERRING<br/>or minimal with pilot]
    SCORE -->|31-50<br/>Level 2| MINIMAL[minimal bundle<br/>5 phases, hotfix workflow]
    SCORE -->|51-70<br/>Level 3| STANDARD[standard bundle<br/>8 phases, full workflow]
    SCORE -->|71-100<br/>Level 4-5| ENTERPRISE[enterprise bundle<br/>All features enabled]

    MINIMAL --> CHECKGROWTH{Planning to scale?}
    CHECKGROWTH -->|Yes| PLANEVO[Plan evolution to<br/>standard in 6 months]
    CHECKGROWTH -->|No| STAYMIN[Stay minimal<br/>Monitor readiness]

    STANDARD --> CHECKCOMP{Compliance emerging?}
    CHECKCOMP -->|Yes| PLANENT[Plan evolution to<br/>enterprise in 6 months]
    CHECKCOMP -->|No| STAYSTAND[Stay standard<br/>Optimize usage]

    ENTERPRISE --> CHECKOPT{All features needed?}
    CHECKOPT -->|No| SUBSET[Enable subset<br/>Essential features only]
    CHECKOPT -->|Yes| FULLENT[Full enterprise<br/>All features]
```

**Key Principle:** Bundle selection based on readiness score. Plan for evolution, not immediate perfection.

---

## Quick Reference: Design Questions

| Question | Key Factor | Decision Range |
|----------|------------|----------------|
| **States count?** | Maturity Level | 3 (L1) → 15+ (L5) |
| **Actor types?** | Automation Level | Human only (L1-2) → AI-native (L5) |
| **Approval stages?** | Culture + Compliance | 0 (Collaborative/Innovation) → 5 (Hierarchical+Compliance) |
| **AI actors?** | AI Readiness | Wait (<3/5) → Adopt (4-5/5) |
| **Artifact count?** | Documentation Habits | 1-2 (Weak) → 15+ (Strong) |
| **Bundle?** | Readiness Score | minimal (31-50) → enterprise (71-100) |

---

## Using These Decision Trees

### Step 1: Complete Context Assessment

Use `CONTEXT_ASSESSMENT_TEMPLATE.md` to determine:
- Maturity Level (1-5)
- Readiness Score (0-100)
- Culture Type (Collaborative / Hierarchical / Innovation)
- Automation Level (1-5)
- AI Readiness (1-5)
- Documentation Habits (1-5)

### Step 2: Walk Through Decision Trees

For each methodology element (States, Actors, Actions, etc.), follow the decision tree using your context scores.

### Step 3: Document Decisions

Record your answers:
```yaml
States: ___ (count) because maturity level is ___
Actors: ___ (types) because automation level is ___
Approvals: ___ (stages) because culture is ___ and compliance is ___
AI Actors: ___ (yes/no/pilot) because AI readiness is ___
Artifacts: ___ (count) because documentation habits is ___
Bundle: ___ (minimal/standard/enterprise) because readiness score is ___
```

### Step 4: Validate with Stakeholders

Share decision rationale with team:
- "We're using 5 states (not 15) because our maturity level is 2"
- "We're starting Human actors only (no AI yet) because AI readiness is 2/5"
- "We're using 1 approval stage (not 5) because we have collaborative culture"

### Step 5: Build Methodology

Apply decisions to your `methodology.yaml` design.

---

## Common Decision Conflicts

### Conflict 1: High compliance need but low maturity

**Symptom:** Score 40/100 (Level 2) but compliance required

**Resolution:**
- Use minimal bundle (match maturity)
- Add essential compliance gates only (don't over-engineer)
- Plan evolution to enterprise bundle as maturity grows

---

### Conflict 2: Collaborative culture but compliance required

**Symptom:** Culture is collaborative (avoid approvals) but SOC2 required (need approvals)

**Resolution:**
- Use collaborative pattern for development phases (async, minimal approvals)
- Add hierarchical pattern for compliance gates only (security, legal)
- Blend patterns: minimize approvals where safe, enforce where required

---

### Conflict 3: AI-ready but team resistance

**Symptom:** AI readiness 4/5 (tools exist) but team resistance to change 2/5

**Resolution:**
- Pilot AI actors with willing early adopters first
- Make AI actors optional (Human can override)
- Collect success stories; gradually expand
- Don't force AI adoption on resistant teams

---

## Next Steps

After using decision trees:

1. **Document your design decisions** (rationale for each element)
2. **Validate with `MATURITY_AWARE_DESIGN.md`** (does your design match patterns for your level?)
3. **Apply adaptation patterns** from `ADAPTATION_PATTERNS.md` (culture-specific tweaks)
4. **Create `methodology.yaml`**
5. **Validate with `/meta-validate`**
6. **Pilot with 1 team**

---

## References

- **Context Assessment:** `CONTEXT_ASSESSMENT.md`
- **Maturity Patterns:** `MATURITY_AWARE_DESIGN.md`
- **Incremental Design:** `INCREMENTAL_DESIGN.md`
- **Adaptation Patterns:** `ADAPTATION_PATTERNS.md`
- **Quick Start:** `README.md`

---

**Version History:**
- 1.0.0 (2026-01-17): Initial release with 6 decision trees for common design questions
