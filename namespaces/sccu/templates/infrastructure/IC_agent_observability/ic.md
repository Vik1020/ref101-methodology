---
type: infrastructure_context
id: IC_agent_observability
name: Agent Observability System
version: 1.0.0
status: active
created: 2025-12-27
last_updated: 2025-12-27
owner: System Architecture
compliance_level: mandatory
---

# IC: Agent Observability System

## Purpose

Определяет обязательные требования для системы наблюдения за агентами Claude Code, обеспечивающей прозрачность работы агентов и верификацию применения custom instructions.

## Scope

Данный IC применяется к:
- Всем агентам, использующим custom instructions из `.claude/prompts/*.md`
- Системам reverse-engineering и forward-engineering
- Workflow tracking и validation
- Dashboard generation и reporting

## Mandatory Requirements

### 1. Logging Capabilities

#### 1.1 Console Logging
**Requirement ID:** `OBS-LOG-001`
**Level:** P0

- **MUST** поддерживать real-time console logging
- **MUST** предоставлять 3 уровня verbosity:
  - `minimal`: Phase transitions, P0 violations, errors only
  - `medium`: Above + tool calls, key decisions, confidence scores (DEFAULT)
  - `verbose`: Above + full LLM I/O, detailed metrics
- **MUST** использовать color-coded output (configurable)
- **MUST** включать timestamps в формате ISO 8601

**Validation:**
```typescript
// Console output must be present in medium+ modes
const logger = getLogger();
logger.onToolCall('Glob', { pattern: '**/*.tsx' }, { files: 245 }, 1200);
// Expected output: [2025-12-27 10:30:47] 🔧 TOOL_CALL | Glob(pattern: **/*.tsx) | files: 245
```

#### 1.2 Dashboard Generation
**Requirement ID:** `OBS-LOG-002`
**Level:** P0

- **MUST** генерировать детальные markdown dashboards
- **MUST** включать следующие секции:
  - Session Configuration
  - **Custom Instructions Verification** (критично!)
  - Workflow Execution Trace
  - Tool Calls Table
  - LLM Interactions
  - Token Metrics
  - Performance Metrics
  - Confidence Score Summary
  - Errors and Warnings
- **MUST** сохранять в `.claude/dashboards/session-{timestamp}.md`
- **MUST** поддерживать `current-session.md` link

**Validation:**
```bash
# Dashboard must be generated and contain all sections
test -f .claude/dashboards/current-session.md
grep -q "Custom Instructions Verification" .claude/dashboards/current-session.md
```

### 2. Custom Instructions Verification

#### 2.1 Prompt Tracking
**Requirement ID:** `OBS-PROMPT-001`
**Level:** P0

- **MUST** отслеживать загрузку custom instructions
- **MUST** логировать prompt_path и content_hash
- **MUST** записывать timestamp загрузки

#### 2.2 Behavioral Pattern Matching
**Requirement ID:** `OBS-PROMPT-002`
**Level:** P0

- **MUST** использовать behavioral pattern matching для верификации
- **MUST** поддерживать pattern library для known prompts
- **MUST** calculate confidence score ≥ 70% для подтверждения применения
- **MUST** предоставлять evidence list (какие паттерны сработали)

**Pattern Library Coverage:**
- `reverse-system.md`: 3+ patterns (confidence scoring, evidence-based, user validation)
- `reverse-analysis.md`: 3+ patterns (tech stack, components, API calls)
- `reverse-inference.md`: 3+ patterns (BC/AC generation, confidence hierarchy)
- `system.md`: 3+ patterns (workflow sequence, P0 checks, IC validation)

**Validation:**
```typescript
const verifier = createPromptVerifier();
const verification = verifier.verify('.claude/prompts/reverse-system.md', events);

assert(verification.confidence >= 70, 'Prompt verification confidence too low');
assert(verification.applied === true, 'Prompt not applied');
assert(verification.evidence.length > 0, 'No evidence provided');
```

### 3. Performance Requirements

#### 3.1 Overhead Limits
**Requirement ID:** `OBS-PERF-001`
**Level:** P1

- **MUST** maintain overhead < 15% in production mode
- **SHOULD** maintain overhead < 10% in medium logging mode
- **SHOULD** maintain overhead < 5% in minimal logging mode

**Measurement:**
```typescript
// Benchmark with and without logging
const timeWithout = benchmarkTask(task, { logging: false });
const timeWith = benchmarkTask(task, { logging: true, level: 'medium' });
const overhead = ((timeWith - timeWithout) / timeWithout) * 100;

assert(overhead < 10, `Overhead ${overhead}% exceeds 10% limit`);
```

#### 3.2 Memory Usage
**Requirement ID:** `OBS-PERF-002`
**Level:** P1

- **SHOULD** buffer events before flushing to disk
- **SHOULD** limit in-memory event buffer to 1000 events
- **MUST** flush buffer at phase boundaries

### 4. Privacy and Security

#### 4.1 PII Sanitization
**Requirement ID:** `OBS-SEC-001`
**Level:** P0

- **MUST** sanitize Personally Identifiable Information (PII)
- **MUST** mask API keys, tokens, passwords
- **MUST** use exclude_patterns from configuration
- **MUST** apply sanitization before logging/dashboard generation

**Default exclude patterns:**
```json
{
  "privacy": {
    "exclude_patterns": [
      "password",
      "apiKey",
      "api_key",
      "secret",
      "token",
      "authorization",
      "bearer"
    ]
  }
}
```

**Validation:**
```typescript
const sanitized = logger.sanitize({ apiKey: 'sk-1234567890' });
assert(sanitized.apiKey === '***', 'API key not sanitized');
```

#### 4.2 Sensitive Data Handling
**Requirement ID:** `OBS-SEC-002`
**Level:** P0

- **MUST NOT** log full LLM prompts/responses if `include_prompts: false`
- **MUST NOT** log tool call results containing secrets
- **SHOULD** provide opt-out for LLM I/O logging

### 5. Configuration Management

#### 5.1 Configuration File
**Requirement ID:** `OBS-CFG-001`
**Level:** P0

- **MUST** provide `.claude/observability-config.json`
- **MUST** support configuration reload without restart
- **MUST** validate configuration on load
- **MUST** provide sensible defaults

**Validation rules:**
- `retention_days`: 1-365
- `max_file_size_mb`: 1-100
- `threshold_warning`: 0-100

#### 5.2 Configuration Schema
**Requirement ID:** `OBS-CFG-002`
**Level:** P0

Configuration must include:
```json
{
  "version": "1.0.0",
  "logging": {
    "enabled": boolean,
    "console": { "enabled": boolean, "level": string, ... },
    "dashboard": { "enabled": boolean, "level": string, ... }
  },
  "tracking": {
    "custom_instructions": { "enabled": boolean, "verify_application": boolean },
    "workflow_phases": { ... },
    "confidence_scores": { ... },
    "p0_violations": { ... }
  },
  "metrics": { ... },
  "privacy": { ... }
}
```

### 6. Retention Policy

#### 6.1 Dashboard Retention
**Requirement ID:** `OBS-RET-001`
**Level:** P1

- **SHOULD** automatically cleanup old dashboards
- **MUST** respect `retention_days` configuration (default: 30)
- **SHOULD** preserve dashboards marked as important

**Cleanup algorithm:**
```typescript
const now = Date.now();
const retentionMs = config.retention_days * 24 * 60 * 60 * 1000;

for (const file of dashboardFiles) {
  if (now - file.mtime > retentionMs) {
    fs.unlinkSync(file.path);
  }
}
```

### 7. Workflow Integration

#### 7.1 Workflow State Sync
**Requirement ID:** `OBS-WF-001`
**Level:** P1

- **SHOULD** update `.claude/state/workflow.json` with observability data
- **SHOULD** track session_id, dashboard_path, custom_instructions_active
- **SHOULD** maintain confidence_warnings and p0_violations counts

**Schema extension:**
```json
{
  "observability": {
    "session_id": string | null,
    "dashboard_path": string | null,
    "custom_instructions_active": string[],
    "confidence_warnings": number,
    "p0_violations": number,
    "last_event_timestamp": string | null
  }
}
```

## Validation Checklist

### Pre-deployment Validation

- [ ] All P0 requirements implemented
- [ ] Pattern library covers all 4 prompts (reverse-system, reverse-analysis, reverse-inference, system)
- [ ] Confidence threshold ≥ 70% for prompt verification
- [ ] Performance overhead < 15% measured
- [ ] PII sanitization tested with sample data
- [ ] Dashboard generated with all sections
- [ ] Configuration validated successfully
- [ ] Retention policy tested

### Runtime Validation

- [ ] Console logging appears in real-time
- [ ] Dashboard files generated in `.claude/dashboards/`
- [ ] Custom instructions verification shows in dashboard
- [ ] Confidence scores calculated correctly
- [ ] P0 violations logged when triggered
- [ ] Old dashboards cleaned up per retention policy

## Non-Compliance Consequences

### P0 Violations (CRITICAL)

**Non-compliance with P0 requirements blocks deployment:**

- Missing console logging → Cannot track agent execution
- Missing custom instructions verification → **Cannot solve user's main problem**
- Missing PII sanitization → **Security risk**
- Missing dashboard generation → Cannot review agent behavior

**Action:** Fix P0 violations before proceeding to next phase.

### P1 Violations (HIGH)

**Non-compliance with P1 requirements requires documentation:**

- Performance overhead > 15% → Document impact, plan optimization
- Missing retention policy → Manual cleanup required
- Missing workflow integration → Limited visibility in workflow state

**Action:** Document violation, create remediation plan.

## Dependencies

### External Dependencies

- Node.js `fs` module (file I/O)
- TypeScript compiler
- `.claude/prompts/*.md` (custom instructions)
- `.claude/state/workflow.json` (workflow state)

### Internal Dependencies

- `types.ts` (TypeScript definitions)
- `config.ts` (configuration loader)
- `agent-logger.ts` (core logging)
- `console-formatter.ts` (console output)
- `dashboard-writer.ts` (markdown generation)
- `prompt-tracker.ts` (verification)
- `workflow-observer.ts` (workflow integration)

## Monitoring and Metrics

### Key Metrics to Track

1. **Prompt Verification Rate**
   - Target: ≥ 95% of prompts verified with confidence ≥ 70%
   - Alert: < 80% verification rate

2. **Performance Overhead**
   - Target: < 10% in medium mode
   - Alert: > 15% overhead

3. **Dashboard Generation Success**
   - Target: 100% sessions have dashboard
   - Alert: Missing dashboards

4. **Confidence Score Distribution**
   - Monitor: % of high/medium/low/requires-validation
   - Alert: > 20% requires user validation

## Examples

### Example 1: Basic Usage

```typescript
import { getLogger, createSession } from './.claude/observability/agent-logger';

const session = createSession('Explore', 'claude-sonnet-4-5', 'reverse-engineering', [
  '.claude/prompts/reverse-system.md'
]);

const logger = getLogger();
await logger.onSessionStart(session);
await logger.onToolCall('Glob', { pattern: '**/*.tsx' }, { files: 245 }, 1200);
await logger.onConfidenceScore('BC_auth', 85, ['README.md']);

const summary = logger.generateSummary();
await logger.onSessionEnd('completed', summary);
```

### Example 2: Verification

```typescript
import { createPromptVerifier } from './.claude/observability/prompt-tracker';

const verifier = createPromptVerifier();
const verification = verifier.verify('.claude/prompts/reverse-system.md', events);

console.log(`Applied: ${verification.applied ? 'YES' : 'NO'}`);
console.log(`Confidence: ${verification.confidence}%`);
console.log(`Evidence:`, verification.evidence);
```

## Change History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-12-27 | Initial IC creation | System Architecture |

## Approval

- **Reviewed by:** System Architecture Team
- **Approved by:** Technical Lead
- **Date:** 2025-12-27
- **Status:** ✅ Active

---

**Compliance:** This IC is **MANDATORY** for all agent observability implementations.
**Review Cycle:** Quarterly
**Next Review:** 2026-03-27
